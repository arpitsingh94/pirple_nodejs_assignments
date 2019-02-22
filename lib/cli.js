/*
* CLI module, for reading an admin commands and responding on command line
*
**/

//dependencies
const readline = require('readline');
const events = require('events');
const helpers = require('./helpers');
const os = require('os');
const v8 = require('v8');

const pizzas = require('./handlers/products_handler').__pizzas;
const data_service = require('./data_service');

//extend events class
class __events extends events{}

class cli{
    constructor(){
        this.emitter = new __events();
        
        //handle events
        this.emitter.on("man", ()=>{
            this.__help();
        });

        this.emitter.on("help", ()=>{
            this.__help();
        });

        this.emitter.on("exit", ()=>{
            this.__exit();
        });

        this.emitter.on("stats", ()=>{
            this.__stats();
        });

        this.emitter.on("view menu", ()=>{
            this.__menu();
        });

        this.emitter.on("list orders", (line)=>{
            this.__orders(line);
        });

        this.emitter.on("more order info", (line)=>{
            this.__order_details(line);
        });

        this.emitter.on("list users", ()=>{
            this.__users();
        });

        this.emitter.on("more user info", (line)=>{
            this.__user_details(line);
        });
    }

    init(){
        //start up an interface
        this.__interface = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '>>'
        });
        //on getting a line, pass it to an input processor
        this.__interface.on("line", (line)=>{
            //no callback is required because we are going to use events
            this.process_input(line);
            this.__interface.prompt();
        });

        //on cancel, exit process
        this.__interface.on("close", ()=>{
            process.exit(0);
        });

        //get a prompt
        this.__interface.prompt();
    }

    process_input(line){
        var self = this;
        line = typeof(line) == "string" && line.trim().length > 0 ? line.trim() : false;
        if(line){
            var available_command_matches = [
                "man",
                "help",
                "exit",
                "stats",
                "view menu",
                "list orders",
                "more order info",
                "list users",
                "more user info"
            ];
            var match_found = false;
            available_command_matches.map(cmd=>{
                if(line.toLowerCase().indexOf(cmd)>-1){
                    //emit this cmd and line
                    self.emitter.emit(cmd, line);
                    //set match found to true
                    match_found = true;
                }
            });
            //inform user that match is not found
            if(!match_found){
                console.log(helpers.color_command("Sorry. Couldn't find what you were looking for. Try \"man\" or \"help\"", "magenta"));
            }
        }
    }

    //add a horizontal line on the screen
    horizontal_line(){
        //get width of terminal;
        var width = process.stdout.columns;
        var out = "";
        for(var i = 0;i<width;i++){
            out+="-";
        }
        console.log(out);
    }
    //add "num" number of new lines
    vertical_space(num){
        num = typeof(num) == "number" && num > 0 ? num : 1;
        for(var i = 0;i<num;i++){
            console.log();
        }
    }
    //print the string and center it horizontally
    centered_string(str){
        var padding_width = (process.stdout.columns-str.length)/2;
        var out = "";
        for(var i = 0;i<padding_width;i++){
            out+=" ";
        }
        out+=str;
        console.log(out);
    }
    //responder for help/man
    __help(){
        this.horizontal_line();
        this.centered_string("CLI HELP");
        this.horizontal_line();
        this.vertical_space(2);
        
        var available_command_matches = {
            "man" : "Get information on available commands and how to use them.",
            "help": "Alias command for \"man\".",
            "exit": "Close the application and exit the process.",
            "stats": "Get statistics on the underlying operating system and resource utilization",
            "view menu": "Take a look at all items offered by the service for ordering",
            "list orders [--recent]": "Take a look at all orders placed. The recent option can be optionally passed to list only those orders placed in last 24 hours.",
            "more order info --{order_id}": "Get details of a particular order by passing its order_id.",
            "list users": "List all users registered on the service.",
            "more user info --{email_id}" : "Get details of a particular user by passing their email_id.",
        };

        //loop over all commands
        for(var key in available_command_matches){
            var out = "     "+helpers.color_command(key,"yellow");
            var padding_width = 60 - key.length;
            for(var i=0;i<padding_width;i++){
                out+=" ";
            }
            out+=available_command_matches[key];
            console.log(out);
        }
        this.vertical_space();
        this.horizontal_line();
    }
    //responder for exit cmd
    __exit(){
        console.log("Exiting. Application will close now.");
        process.exit(0);
    }
    //responder for stats cmd
    __stats(){
        var stats = {
            'Load Average' : os.loadavg().join(' '),
            'CPU Count' : os.cpus().length,
            'Free Memory' : os.freemem(),
            'Current Malloced Memory' : v8.getHeapStatistics().malloced_memory,
            'Peak Malloced Memory' : v8.getHeapStatistics().peak_malloced_memory,
            'Allocated Heap Used (%)' : Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
            'Available Heap Allocated (%)' : Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
            'Uptime' : os.uptime()+' Seconds'
        };
        
        // Create a header for the stats
        this.horizontal_line();
        this.centered_string('SYSTEM STATISTICS');
        this.horizontal_line();
        this.vertical_space(2);
        
        // Log out each stat
        for(var key in stats){
            var out = "     "+helpers.color_command(key,"yellow");
            var padding_width = 60 - key.length;
            for(var i=0;i<padding_width;i++){
                out+=" ";
            }
            out+=stats[key];
            console.log(out);
        }
        // Create a footer for the stats
        this.vertical_space();
        this.horizontal_line();
    }
    //responder for menu cmd
    __menu(){
        // Create a header for the menu
        this.horizontal_line();
        this.centered_string('PIZZAS AVAILABLE');
        this.horizontal_line();
        this.vertical_space();
        //loop over each pizza
        pizzas.map(p=>{
            console.dir(p,{colors: true});
            this.vertical_space();
        });
    }
    //responder for list orders
    __orders(str){
        var self = this;
        var only_recent = str.toLowerCase().indexOf("--recent") > -1 ? true : false;
        data_service.list("orders", (err, file_list)=>{
            if(!err){
                //leave some space on top
                self.vertical_space();
                //iterate over each file name
                file_list.map(file_name=>{
                    data_service.read("orders", file_name, (err, data)=>{
                        if (!err && data){
                            if(!only_recent || (only_recent && Date.now() - 24*3600*1000 < data.order_created*1000)){
                                var out = helpers.color_command("Order ID: ","yellow")+file_name;
                                out+=", "+helpers.color_command("Email ID: ","yellow")+data.email_id;
                                out+=", "+helpers.color_command("Total Price: ","yellow")+data.total_price;
                                console.log(out);
                                self.vertical_space();
                            }
                        }
                    });
                });
            }
        });
    }
    //responder for more order info 
    __order_details(str){
        var self = this;
        var order_id = typeof(str.split("--")[1]) == "string" && str.split("--")[1].trim().length > 0 ? str.split("--")[1] : false;
        if(order_id){
            //fetch order data
            data_service.read("orders",order_id, (err,data)=>{
                if(!err && data){
                    self.vertical_space();
                    console.dir(data,{colors:true});
                    self.vertical_space();
                }
            });
        }
    }
    //responder for list users
    __users(str){
        var self = this;
        data_service.list("users", (err, file_list)=>{
            if(!err){
                //leave some space on top
                self.vertical_space();
                //iterate over each file name
                file_list.map(file_name=>{
                    data_service.read("users", file_name, (err, data)=>{
                        if (!err && data){
                            var out = helpers.color_command("Name: ","yellow")+data.first_name+" "+data.last_name;
                            out+=", "+helpers.color_command("Email ID: ","yellow")+data.email_id;
                            console.log(out);
                            self.vertical_space();
                        }
                    });
                });
            }
        });
    }
    //responder for more user info 
    __user_details(str){
        var self = this;
        var email_id = typeof(str.split("--")[1]) == "string" && str.split("--")[1].trim().length > 0 ? str.split("--")[1] : false;
        if(email_id){
            //fetch order data
            data_service.read("users",email_id, (err,data)=>{
                if(!err && data){
                    //delete password hash
                    delete data.password_hash;
                    self.vertical_space();
                    console.dir(data,{colors:true});
                    self.vertical_space();
                }
            });
        }
    }
}

module.exports = new cli();