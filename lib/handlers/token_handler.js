var helpers = require('../helpers');
var data_service = require('../data_service');
var config = require('../config');

class token_handler{
    constructor(){
        this.allowed_methods = ["post","get","put","delete"];
    }
    //post route
    //required data - email address, password
    //optional data: none
    post(req,callback){
        //check for email address and password

        var email_id = typeof(req.body.email_id) == "string" && helpers.validate_email(req.body.email_id.trim()) ? req.body.email_id.trim() : false;
        var password = typeof(req.body.password) == "string" && req.body.password.trim().length > 0 ? req.body.password.trim() : false;

        if(email_id && password){
            //verify password
            data_service.read("users",email_id,(err,userdata)=>{
                if(err){
                    //sending error code
                    callback(500,err);
                }
                else{
                    var password_hash = helpers.create_hash(password, config.hashing_secret);
                    if(password_hash == userdata.password_hash){
                        //create token of length config.token_length
                        var token = helpers.create_random_string(config.token_length);
                        //set token expiry to one hour from now
                        var expires = Date.now() + 3600*1000;
                        //create data and save
                        var data_to_save = {
                            token: token,
                            email_id: email_id,
                            expires: expires
                        }
                        data_service.create("tokens", token, data_to_save,(err)=>{
                            if(err){
                                //send error token
                                callback(500, err);
                            }
                            else{
                                console.log("token_handler#post success");
                                callback(200, {success: "token created successfully", data: data_to_save});
                            }
                        });
                    }
                    else{
                        console.log("token_handler#post wrong password error");
                        callback(400,{error: "password does not match"});
                    }
                }
            });
        }
        else{
            console.log("token_handler#post invalid fields error");
            callback(400, {error: "missing or invalid required fields"})
        }
    }

    //get route
    //required query params: token
    //optional data: none
    get(req, callback){
        //check data
        var token = typeof(req.query.token) == "string" && req.query.token.trim().length == config.token_length ? req.query.token.trim() : false;

        if(token){
            //read data and return
            data_service.read("tokens",token,(err,data)=>{
                if(err){
                    callback(500,err);
                }
                else{
                    console.log("token_handler#get success");
                    callback(200, data);
                }
            });
        }
        else{
            console.log("token_handler#get invalid fields error");
            callback(400, {error: "missing or invalid required fields"})
        }
    }

    //put route
    //required data: token, extend (a boolean)
    // since only one put parameter is valid, it is required
    put(req, callback){
        //check data
        var token = typeof(req.body.token) == "string" && req.body.token.trim().length == config.token_length ? req.body.token.trim() : false;
        var extend = typeof(req.body.extend) == "boolean" ? req.body.extend : false;

        //check if extend and token are valid
        if(token && extend){
            //fetch data from data_service
            data_service.read("tokens", token,(err,tokendata)=>{
                if(err){
                    callback(500,err);
                }
                else{
                    //refresh the expiry of the token. set 1 hour from now
                    tokendata.expires = Date.now() + 3600*1000;
                    //save it back
                    data_service.update("tokens",token, tokendata,(err)=>{
                        if(err){
                            callback(500,err);
                        }
                        else{
                            console.log("token_handler#put success");
                            callback(200, {success: "data updated successfully", __latest_data: tokendata});
                        }
                    });
                }
            });
        }
        else{
            console.log("token_handler#put invalid fields error");
            callback(400, {error: "missing or invalid required fields. extend must be set to true"});
        }
    }

    //delete route
    //required query params: token
    //optional data: none
    delete(req, callback){
        //check data
        var token = typeof(req.query.token) == "string" && req.query.token.trim().length == config.token_length ? req.query.token.trim() : false;

        if(token){
            data_service.delete("tokens",token,(err)=>{
                if(err){
                    callback(500,err);
                }
                else{
                    console.log("token_handler#delete success");
                    callback(200, {success: "successfully deleted token"});
                }
            });
        }
        else{
            console.log("token_handler#delete invalid fields error");
            callback(400, {error: "missing or invalid required fields"})
        }
    }

    __validate_token(token, email_id, validate_email=false,callback){
        //first level of check
        //verify token length
        
        if(typeof(token) == "string" && token.trim().length == config.token_length){
            data_service.read("tokens",token,(err,tokendata)=>{
                if(err){
                    callback(err);
                }
                else{
                    if(Date.now() > tokendata.expires){
                        console.log("token_handler#validate email_id token is expired");
                        callback({error: "token is expired"});
                    }
                    else{
                        if(!validate_email || tokendata.email_id == email_id){
                            callback(null);
                        }
                        else{
                            console.log("token_handler#validate email_id does not match");
                            callback({error: "token is not valid for email_id received in request"});
                        }
                    }
                }
            });
        }
        else{
            console.log("token_handler#validate email_id token invalid");
            callback({error: "token invalid"});
        }
    }
}

module.exports = new token_handler();