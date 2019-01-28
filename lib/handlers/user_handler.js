var helpers = require('../helpers');
var data_service = require('../data_service');
var token_handler = require('./token_handler');
var config = require('../config');

class user_handler{
    constructor(){
        this.allowed_methods = ["post","get","put","delete"];
    }
    //post route
    //required data - name, email address and street_address, password
    //optional data: none
    post(req,callback){
        //check for name, email address, street address and password

        var first_name = typeof(req.body.first_name) == "string" && req.body.first_name.trim().length > 0 ? req.body.first_name.trim() : false;
        var last_name = typeof(req.body.last_name) == "string" && req.body.last_name.trim().length > 0 ? req.body.last_name.trim() : false;
        var email_id = typeof(req.body.email_id) == "string" && helpers.validate_email(req.body.email_id.trim()) ? req.body.email_id.trim() : false;
        var street_address = typeof(req.body.street_address) == "string" && req.body.street_address.trim().length > 0 ? req.body.street_address.trim() : false;
        var password = typeof(req.body.password) == "string" && req.body.password.trim().length > 0 ? req.body.password.trim() : false;

        if(first_name && last_name && email_id && street_address && password){
            //create hash of password
            var password_hash = helpers.create_hash(password);

            //create data. make file for email_id
            //orders will be an array of order_ids
            data_service.create("users",email_id, {
                first_name :first_name,
                last_name: last_name,
                email_id: email_id,
                street_address: street_address,
                password_hash: password_hash,
                orders: []
            }, (err)=>{
                if (err){
                    // send error code
                    callback(500, err);
                }
                else{
                    //create empty cart for same email_id
                    var newcartdata = {
                        email_id : email_id,
                        items: [],
                        total_price : 0
                    };
                    data_service.create("carts",email_id,newcartdata,(err)=>{
                        if(err){                        
                            callback(500,err);
                        }
                        else{
                            console.log("user_handler#post success");
                            callback(200, {success: "user created successfully"});
                        }
                    });
                }
            });
        }
        else{
            console.log("user_handler#post invalid fields error");
            callback(400, {error: "missing or invalid required fields"})
        }
    }

    //get route
    //required query params: email_id, token in header
    //optional data: none
    get(req, callback){
        //check data
        var email_id = typeof(req.query.email_id) == "string" && helpers.validate_email(req.query.email_id.trim()) ? req.query.email_id.trim() : false;
        var token = typeof(req.headers["x-token"]) == "string" && req.headers["x-token"].trim().length == config.token_length ? req.headers["x-token"].trim() : false;

        //token would have been created with help of password. so omitting check of that here
        if(email_id && token){
            token_handler.__validate_token(token, email_id, true, (err)=>{
                if(err){
                    callback(403, {error: "you are not authorised for this request"});        
                }
                else{
                    data_service.read("users",email_id, (err, data)=>{
                        if(err) callback(500, err);
                        else{
                            console.log("user_handler#get success");
                            //do not send password to user
                            delete data.password_hash;
                            callback(200, data);
                        }
                    });
                }
            });
        }
        else{
            console.log("user_handler#get invalid fields error");
            callback(400, {error: "missing or invalid required fields"});
        }
    }

    //put route
    //required data: email_id in body, token in header
    //optional data: first_name, last_name, street_address, password but at least one of them should be present
    put(req, callback){
        //check data
        var first_name = typeof(req.body.first_name) == "string" && req.body.first_name.trim().length > 0 ? req.body.first_name.trim() : false;
        var last_name = typeof(req.body.last_name) == "string" && req.body.last_name.trim().length > 0 ? req.body.last_name.trim() : false;
        var email_id = typeof(req.body.email_id) == "string" && helpers.validate_email(req.body.email_id.trim()) ? req.body.email_id.trim() : false;
        var street_address = typeof(req.body.street_address) == "string" && req.body.street_address.trim().length > 0 ? req.body.street_address.trim() : false;
        var password = typeof(req.body.password) == "string" && req.body.password.trim().length > 0 ? req.body.password.trim() : false;

        var token = typeof(req.headers["x-token"]) == "string" && req.headers["x-token"].trim().length == config.token_length ? req.headers["x-token"].trim() : false;

        //check if email_id and token are there and at least one of first_name, last_name and address is there
        if(email_id && token && (first_name || last_name || street_address || password)){
            token_handler.__validate_token(token, email_id, true, (err)=>{
                if(err){
                    callback(403, {error: "you are not authorised for this request"});        
                }
                else{
                    data_service.read("users",email_id, (err, data)=>{
                        //now we will update this data
                        if(first_name){
                            data.first_name = first_name;
                        }
                        if(last_name){
                            data.last_name = last_name;
                        }
                        if(street_address){
                            data.street_address = street_address;
                        }
                        if(password){
                            data.password_hash = helpers.create_hash(password);
                        }
                        data_service.update("users",email_id,data,(err)=>{
                            if(err) callback(500, err);
                            else{
                                console.log("user_handler#put success");
                                callback(200, {success: "data updated successfully", __latest_data: data});
                            }
                        });
                    });
                }
            });
        }
        else{
            console.log("user_handler#put invalid fields error");
            callback(400, {error: "missing or invalid required fields. at least one update field should be sent"})
        }
    }

    //delete route
    //required query params: email_id, token in header
    //optional data: none
    delete(req, callback){
        //check data
        var email_id = typeof(req.query.email_id) == "string" && helpers.validate_email(req.query.email_id.trim()) ? req.query.email_id.trim() : false;
        var token = typeof(req.headers["x-token"]) == "string" && req.headers["x-token"].trim().length == config.token_length ? req.headers["x-token"].trim() : false;

        if(email_id && token){
            token_handler.__validate_token(token, email_id, true, (err)=>{
                if(err){
                    callback(403, {error: "you are not authorised for this request"});        
                }
                else{
                    //delete user data
                    data_service.delete("users",email_id, (err, data)=>{
                        if(err) callback(500, err);
                        else{
                            //also delete user related data
                            data_service.delete("carts",email_id,(err)=>{
                                if(err){                        
                                    callback(500,err);
                                }
                                else{
                                    data_service.delete("tokens",token, (err, data)=>{
                                        if(err) callback(500, err);
                                        else{
                                            console.log("user_handler#delete success");
                                            callback(200, {success: "successfully deleted user"});
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
        else{
            console.log("user_handler#delete invalid fields error");
            callback(400, {error: "missing or invalid required fields"})
        }
    }
}

module.exports = new user_handler();