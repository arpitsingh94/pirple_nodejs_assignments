/*
* cart_handler file that will handle all the requests coming to the /carts
*
*/
//dependencies
const assert = require('assert');
var config = require('../config');
var products_handler = require('./products_handler');
var data_service = require('../data_service');

class cart_handler{
    constructor(){
        this.allowed_methods = ["get","post","put","delete"];
    }
    //post route
    //required data: pizza_id, quantity, size. Token
    //optional data as none
    post(req,callback){
        //check incoming data
        var pizza_id = typeof(req.body.pizza_id) == "string" && req.body.pizza_id.trim().length > 0 ? req.body.pizza_id.trim() : false;
        var quantity = typeof(req.body.quantity) == "number" && req.body.quantity > 0 ? req.body.quantity : false;
        var size = typeof(req.body.size) == "string" && req.body.size.trim().length > 0 ? req.body.size.trim() : false;
        var token = typeof(req.headers["x-token"]) == "string" && req.headers["x-token"].trim().length == config.token_length ? req.headers["x-token"].trim() : false;

        if(pizza_id && quantity && size && token){
            //let us confirm that the pizza_id and size are actually available
            var pizza_price = products_handler.__fetch_pizza_price(pizza_id, size);
            
            if(pizza_price == -1){
                //return error code
                callback(400, {error: "invalid pizza_id Or size is not available"});
            }
            else{
                // need to save this to user's cart. if it does not exist, create it

                //get token info and user info
                // we are not calling validate token because we need the userdata anyways. no point in calling it twice
                data_service.read("tokens",token, (err,tokendata)=>{
                    if(err){
                        //error in reading token
                        callback(500,err);
                    }
                    else if(tokendata.expires < Date.now()){
                        //token is expired
                        callback(403,{error: "you are not authorized for this request"});
                    }
                    else{
                        var email_id = tokendata.email_id;
                        //using this email_id save info to cart. create if doesnt exist
                        data_service.read("carts",email_id,(err,cartdata)=>{
                            if(err){
                                //data has to exist. return the error
                                callback(500,err);
                            }
                            else{
                                //update items and total_price
                                cartdata.total_price += pizza_price*quantity;
                                //if this pizza_id and size already exist, then update that quantity
                                var duplicate_pizzas = cartdata.items.filter(item=>{
                                    var ans = (item.pizza_id == pizza_id && item.size == size);
                                    if(ans) item.quantity += quantity;
                                    return ans;
                                });
                                //the duplicate_pizzas array cannot be more than length 1
                                assert(duplicate_pizzas.length < 2);
                                if(duplicate_pizzas.length == 0){
                                    cartdata.items.push({
                                        pizza_id: pizza_id,
                                        quantity: quantity,
                                        size: size
                                    });
                                }
                                //now finally save back this data
                                data_service.update("carts",email_id,cartdata,(err)=>{
                                    if(err){
                                        callback(500,err);
                                    }
                                    else{
                                        console.log("cart_handler#post success update");
                                        callback(200,{success: "item added to cart successfully"});
                                    }
                                });
                            }

                        });
                    }
                });
            }
        }
        else{
            console.log("cart_handler#post invalid fields error");
            callback(400, {error: "missing or invalid required fields"})
        }
    }
    //get route
    //required data: token in header. thats it
    //optional data: none
    get(req,callback){
        var self = this;
        var token = typeof(req.headers["x-token"]) == "string" && req.headers["x-token"].trim().length == config.token_length ? req.headers["x-token"].trim() : false;
        if(token){
            data_service.read("tokens",token, (err,tokendata)=>{
                if(err){
                    //error in reading token
                    callback(500,err);
                }
                else if(tokendata.expires < Date.now()){
                    //token is expired
                    callback(403,{error: "you are not authorized for this request"});
                }
                else{
                    data_service.read("carts",tokendata.email_id, (err,data)=>{
                        if(err){
                            callback(500,err);
                        }
                        else{
                            console.log("cart_handler#get success");
                            callback(200,data);
                        }
                    });
                }
            });
        }
        else{
            console.log("cart_handler#get invalid fields error");
            callback(400, {error: "missing or invalid required fields"});
        }
    }
    //put route
    //required data: token in header. cart_id (which is index of item in cart list), new value of quantity
    //optional data: none
    put(req,callback){
        var self = this;
        var token = typeof(req.headers["x-token"]) == "string" && req.headers["x-token"].trim().length == config.token_length ? req.headers["x-token"].trim() : false;
        var cart_id = typeof(req.body.cart_id) == "number" ? req.body.cart_id : false;
        var quantity = typeof(req.body.quantity) == "number" && req.body.quantity > 0 ? req.body.quantity : false;

        // specifically checking cart id for boolean value because 0 also resolves to false
        if(token && (cart_id!==false) && quantity){
            data_service.read("tokens",token, (err,tokendata)=>{
                if(err){
                    //error in reading token
                    callback(500,err);
                }
                else if(tokendata.expires < Date.now()){
                    //token is expired
                    callback(403,{error: "you are not authorized for this request"});
                }
                else{
                    data_service.read("carts",tokendata.email_id, (err,cartdata)=>{
                        if(err){
                            callback(500,err);
                        }
                        else{
                            //check if cart_id is valid
                            if(cart_id < cartdata.items.length){
                                var cart_item = cartdata.items[cart_id];
                                var old_quantity = cart_item.quantity;
                                cart_item.quantity = quantity; 
                                cartdata.total_price += (quantity-old_quantity)*products_handler.__fetch_pizza_price(cart_item.pizza_id, cart_item.size); 
                                //update cart data
                                data_service.update("carts",tokendata.email_id,cartdata, (err)=>{
                                    if(err) callback(500,err);
                                    else{
                                        console.log("cart_handler#put success");
                                        callback(200, {success: "cart updated successfully", __latest_data: cartdata});
                                    }
                                });
                            }
                            else{
                                console.log("cart_handler#put invalid cart_id error");    
                                callback(400,{error : "invalid cart_id."})
                            }
                        }
                    });
                }
            });
        }
        else{
            console.log("cart_handler#put invalid fields error");
            callback(400, {error: "missing or invalid required fields"});
        }
    }
    //delete route
    //required data: token in header. cart_id (which is index of item in cart list to be removed)
    //optional data: none
    delete(req,callback){
        var token = typeof(req.headers["x-token"]) == "string" && req.headers["x-token"].trim().length == config.token_length ? req.headers["x-token"].trim() : false;
        var cart_id = typeof(req.body.cart_id) == "number" ? req.body.cart_id : false;

        // specifically checking cart id for boolean value because 0 also resolves to false
        if(token && (cart_id!==false)){
            data_service.read("tokens",token, (err,tokendata)=>{
                if(err){
                    //error in reading token
                    callback(500,err);
                }
                else if(tokendata.expires < Date.now()){
                    //token is expired
                    callback(403,{error: "you are not authorized for this request"});
                }
                else{
                    data_service.read("carts",tokendata.email_id, (err,cartdata)=>{
                        if(err){
                            callback(500,err);
                        }
                        else{
                            //check if cart_id is valid
                            if(cart_id < cartdata.items.length){
                                var cart_item = cartdata.items[cart_id];
                                cartdata.total_price -= cart_item.quantity * products_handler.__fetch_pizza_price(cart_item.pizza_id, cart_item.size);
                                cartdata.items.splice(cart_id,1);
                                console.log(cartdata);
                                //update price back to cart
                                data_service.update("carts",tokendata.email_id,cartdata, (err)=>{
                                    if(err) callback(500,err);
                                    else{
                                        console.log("cart_handler#delete success");
                                        callback(200, {success: "item removed from cart successfully", __latest_data: cartdata});
                                    }
                                });
                            }
                            else{
                                console.log("cart_handler#delete invalid cart_id error");    
                                callback(400,{error : "invalid cart_id."})
                            }
                        }
                    });
                }
            });
        }
        else{
            console.log("cart_handler#delete invalid fields error");
            callback(400, {error: "missing or invalid required fields"});
        }
    }
}

module.exports = new cart_handler();