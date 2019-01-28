/*
* products_handler file that will handle all the requests coming to the /products
*
*/
//dependencies
var config = require('../config');
var token_handler = require('./token_handler');

class products_handler{
    constructor(){
        this.allowed_methods = ["get"];
        // hardcoded pizza data
        this.__pizzas = [
            {
                pizza_id: "PD001",
                title: "Margherita",
                ingredients : "Tomato sauce, mozzarella, and oregano",
                prices: {
                    "8 inch" : 250,
                    "10 inch" : 380,
                    "12 inch" : 540
                }
            },
            {
                pizza_id: "PD002",
                title: "Marinara",
                ingredients : "Tomato sauce, garlic and basil",
                prices: {
                    "8 inch" : 270,
                    "10 inch" : 400,
                    "12 inch" : 560
                }

            },
            {
                pizza_id: "PD003",
                title: "Carbonara",
                ingredients : "Tomato sauce, mozzarella, parmesan, eggs, and bacon",
                prices: {
                    "8 inch" : 340,
                    "10 inch" : 520,
                    "12 inch" : 750
                }
            }
            ,
            {
                pizza_id: "PD004",
                title: "Quattro Formaggi",
                ingredients : "Tomato sauce, mozzarella, parmesan, gorgonzola cheese, artichokes, and oregano",
                prices: {
                    "8 inch" : 330,
                    "10 inch" : 500,
                    "12 inch" : 720
                }
            },
            {
                pizza_id: "PD005",
                title: "Mediterranea",
                ingredients : "Tomato sauce, buffalo mozzarella, cherry tomatoes and pepper",
                prices: {
                    "8 inch" : 300,
                    "10 inch" : 440,
                    "12 inch" : 590
                }
            }
        ]
    }
    //get route
    //required data: token in header. thats it
    //optional data: none
    get(req,callback){
        var self = this;
        var token = typeof(req.headers["x-token"]) == "string" && req.headers["x-token"].trim().length == config.token_length ? req.headers["x-token"].trim() : false;
        if(token){
            token_handler.__validate_token(token, null, false, (err)=>{
                if(err){
                    callback(403, {error: "you are not authorized for this request"});
                }
                else{
                    //return pizza data
                    callback(200, {
                        pizzas : self.__pizzas,
                        __note: "all prices are in INR"
                    });
                }
            });
        }
        else{
            console.log("products_handler#get invalid fields error");
            callback(400,"invalid token sent");
        }
    }

    __fetch_pizza_price(pizza_id, size){
        var pizza_price = -1;
        // let us go through all the pizzas and check if pizza_id is valid and for that pizza_id size is valid or not
        this.__pizzas.map(p=>{
            if (p.pizza_id == pizza_id && typeof(p.prices[size]) == "number"){
                pizza_price = p.prices[size];
            }
        });
        return pizza_price;
    }

    __fetch_pizza_name(pizza_id){
        var pizza_name = false;
        // let us go through all the pizzas and check if pizza_id is valid and for that pizza_id size is valid or not
        this.__pizzas.map(p=>{
            if (p.pizza_id == pizza_id){
                pizza_name = p.title;
            }
        });
        return pizza_name;
    }
}

module.exports = new products_handler();