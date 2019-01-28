/*
* handler for requests to /orders
* {products:[{product_id,quantity}],delivery_address, payment_id, order_id}
*/
const https = require('https');
const querystring = require('querystring');
const config = require('../config');
const helpers = require('../helpers');
const data_service = require('../data_service');
const products_handler = require('./products_handler');

class order_handler{
    constructor(){
        this.allowed_methods = ["get","post","delete"];
    }
    //post route
    //required data: delivery address, payment_token (received from stripe), token (in header)
    //optional data: none
    post(req,callback){
        var self = this;
        //check incoming data
        var delivery_address = typeof(req.body.delivery_address) == "string" && req.body.delivery_address.trim().length > 0 ? req.body.delivery_address.trim() : false;
        var payment_token = typeof(req.body.payment_token) == "string" && req.body.payment_token.trim().length > 0 ? req.body.payment_token.trim() : false;
        var token = typeof(req.headers["x-token"]) == "string" && req.headers["x-token"].trim().length == config.token_length ? req.headers["x-token"].trim() : false;
        if(delivery_address && payment_token && token){
            //confirm payment by passing payment_token to stripe
            // on UI side, it should have been confirmed that order is for atleast one item.

            //confirm token validity
            data_service.read("tokens",token,(err,tokendata)=>{
                if(err){
                    //error in reading token
                    callback(500,err);
                }
                else if(tokendata.expires < Date.now()){
                    //token is expired
                    callback(403,{error: "you are not authorized for this request"});
                }
                else{
                    //let us fetch the cart items
                    data_service.read("carts",tokendata.email_id, (err, cartdata)=>{
                        if(err) callback(500,err);
                        else{
                            //make a request to stripe
                            self.__make_payment_request(cartdata.total_price,payment_token,tokendata.email_id,(err,result)=>{
                                if(err){
                                    callback(500, err);
                                    //send the email receipt from here
                                    self.__notify_user_payment(tokendata.email_id, false);
                                }
                                else{
                                    //create order body. we'll use timestamp and id from stripe response
                                    var orderdata = {
                                        email_id: tokendata.email_id,
                                        items: cartdata.items,
                                        total_price : cartdata.total_price,
                                        delivery_address: delivery_address,
                                        payment_id : result.id,
                                        order_created: result.created,
                                        order_id : helpers.create_random_string(config.orderid_length)
                                    };
                                    //save this order to data_service
                                    data_service.create("orders",orderdata.order_id, orderdata,(err)=>{
                                        if(err) callback(500,err);
                                        else{
                                            //update carts
                                            cartdata.items = [];
                                            cartdata.total_price = 0;
                                            data_service.update("carts",cartdata.email_id, cartdata, (err)=>{
                                                if(err) callback(500, err);
                                                else{
                                                    //update order_id to user data
                                                    data_service.read("users",cartdata.email_id,(err,userdata)=>{
                                                        if(err) callback(500,err);
                                                        else{
                                                            userdata.orders.push(orderdata.order_id);
                                                            data_service.update("users",userdata.email_id,userdata,(err)=>{
                                                                if(err) callback(500,err);
                                                                else{
                                                                    //this is one big callback hell
                                                                    console.log("order_handler#post success");
                                                                    callback(200, {success: "order placed successfully. you should receive a notification by email soon", __order_data: orderdata});
                                                                    //send the email receipt from here
                                                                    self.__notify_user_payment(tokendata.email_id, true, orderdata);
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
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
            console.log("order_handler#post invalid fields error");
            callback(400, {error: "missing or invalid required fields"});
        }
    }

    //get route
    //required query params: order_id, token in header
    //optional data: none
    get(req, callback){
        //check data
        var order_id = typeof(req.query.order_id) == "string" && req.query.order_id.trim().length == config.orderid_length ? req.query.order_id.trim() : false;
        var token = typeof(req.headers["x-token"]) == "string" && req.headers["x-token"].trim().length == config.token_length ? req.headers["x-token"].trim() : false;

        //token would have been created with help of password. so omitting check of that here
        if(order_id && token){
            data_service.read("tokens",token, (err,tokendata)=>{
                if(err){
                    callback(500,err);
                }
                else if(tokendata.expires < Date.now()){
                    callback(403,{error:"you are not authorized for this request"});
                }
                else{
                    data_service.read("orders",order_id, (err, orderdata)=>{
                        if(err) callback(500, err);
                        else{
                            if(orderdata.email_id !== tokendata.email_id){
                                callback(403,{error:"you are not authorized for this request"});
                            }
                            else{
                                console.log("order_handler#get success");
                                callback(200, orderdata);
                            }
                        }
                    });
                }
            });
        }
        else{
            console.log("order_handler#get invalid fields error");
            callback(400, {error: "missing or invalid required fields"});
        }
    }

    //delete route
    //required data: order_id, delete_order(must be true), token in header
    //optional data none
    delete(req, callback){
        //check data
        var self = this;
        var order_id = typeof(req.body.order_id) == "string" && req.body.order_id.trim().length == config.orderid_length ? req.body.order_id.trim() : false;
        var token = typeof(req.headers["x-token"]) == "string" && req.headers["x-token"].trim().length == config.token_length ? req.headers["x-token"].trim() : false;
        var delete_order = typeof(req.body.delete_order) == "boolean" ? req.body.delete_order : false;


        //delete must be set to true
        if(order_id && token && delete_order){
            data_service.read("tokens",token, (err,tokendata)=>{
                if(err){
                    callback(500,err);
                }
                else if(tokendata.expires < Date.now()){
                    callback(403,{error:"you are not authorized for this request"});
                }
                else{
                    //read orderdata
                    data_service.read("orders",order_id, (err, orderdata)=>{
                        if(err) callback(500, err);
                        else{
                            if(orderdata.email_id !== tokendata.email_id){
                                callback(403,{error:"you are not authorized for this request"});
                            }
                            else{
                                //check if there is still time to delete order - the value is in config
                                if(Date.now() - (orderdata.order_created*1000) < config.order_deletion_time*60*1000 ){
                                    //trigger a refund
                                    self.__make_refund_request(orderdata.payment_id, (err)=>{
                                        if(err){
                                            callback(500,err);
                                            self.__notify_user_refund(tokendata.email_id, false, orderdata);
                                        }
                                        else{
                                            //update orderdata
                                            orderdata.deleted = true;
                                            data_service.update("orders",order_id,orderdata,(err)=>{
                                                if(err){
                                                    callback(500,err);
                                                }
                                                else{
                                                    console.log("order_handler#delete success");
                                                    callback(200,{success:"your order is canceled. amount will be refunded to your account/card.", __latest_order_data: orderdata});
                                                    self.__notify_user_refund(tokendata.email_id, true, orderdata);
                                                }
                                            });
                                        }
                                    });
                                }
                                else{
                                    console.log("order_handler#delete tooLate error");
                                    callback(400, {error: "you cannot cancel your order now. We apologize for the inconvenience"})
                                }
                            }
                        }
                    });
                }
            });
        }
        else{
            console.log("order_handler#delete invalid fields error");
            callback(400, {error: "missing or invalid required fields"});
        }
    }

    //makes the payment request to stripe and return success/failure
    //also internally calls mailgun function to notify the user
    __make_payment_request(total_amount, payment_token,email_id, callback){
        //not putting this url in config because this wont change. only key will change
        // https://api.stripe.com/v1/charges
        var self = this;
        //for INR, amount should be multiplied by 100
        var form_data = querystring.stringify({
            "amount" : total_amount*100,
            "currency" : "inr",
            "description" : "test charge for user "+email_id+" for amount Rs "+total_amount,
            "source" : payment_token
        });
        

        var request_options = {
            auth: config.stripe.secret,
            protocol: "https:",
            host: "api.stripe.com",
            path: "/v1/charges",
            method: "POST",
            headers : {
                "Content-Type" : "application/x-www-form-urlencoded",
                "Content-Length" : Buffer.byteLength(form_data)
            }
        };
        var called_back = false;
        var request = https.request(request_options, (res)=>{
            //we'll save the chunks in an array
            var chunks = [];
            res.on('data', (chunk) => {
                chunks.push(chunk);
            });
            res.on('end', () => {
                //getting response body
                var body = Buffer.concat(chunks).toString();
                if(!called_back){
                    called_back = true;
                    if (res.statusCode !== 200 && res.statusCode !== 201){
                        console.log('order_handler#__make_payment_request failure statusCode', body, res.statusCode);
                        callback({error : "payment request was unsuccessful"});
                    }
                    else{
                        var parsed_body = helpers.parse_string_to_json(body);
                        console.log('order_handler#__make_payment_request success', parsed_body);
                        callback(null,parsed_body);
                    }
                }
            });
        });

        //listen for error
        request.on('error',(err)=>{
            console.log('order_handler#__make_payment_request error returned', err);
            if(!called_back){
                called_back = true;
                callback({error : "payment request was unsuccessful"});
            };
        });
      
        // End the request
        request.write(form_data);
        request.end();
    }

    //make a refund request to stripe and return success/failure
    __make_refund_request(charge_token, callback){
        //not putting this url in config because this wont change. only key will change
        // https://api.stripe.com/v1/refunds
        var self = this;
        var form_data = querystring.stringify({
            "charge" : charge_token
        });

        var request_options = {
            auth: config.stripe.secret,
            protocol: "https:",
            host: "api.stripe.com",
            path: "/v1/refunds",
            method: "POST",
            headers : {
                "Content-Type" : "application/x-www-form-urlencoded",
                "Content-Length" : Buffer.byteLength(form_data)
            }
        };
        var called_back = false;
        var request = https.request(request_options, (res)=>{
            //we'll save the chunks in an array
            var chunks = [];
            res.on('data', (chunk) => {
                chunks.push(chunk);
            });
            res.on('end', () => {
                //getting response body
                var body = Buffer.concat(chunks).toString();
                if(!called_back){
                    called_back = true;
                    if (res.statusCode !== 200 && res.statusCode !== 201){
                        console.log('order_handler#__make_refund_request failure statusCode', body, res.statusCode);
                        callback({error : "refund request was unsuccessful"});
                    }
                    else{
                        var parsed_body = helpers.parse_string_to_json(body);
                        console.log('order_handler#__make_refund_request success', parsed_body);
                        callback(null,parsed_body);
                    }
                }
            });
        });

        //listen for error
        request.on('error',(err)=>{
            console.log('order_handler#__make_refund_request error returned', err);
            if(!called_back){
                called_back = true;
                callback({error : "refund request was unsuccessful"});
            };
        });
      
        // End the request
        request.write(form_data);
        request.end();
    }

    __notify_user_payment(email_id, success, orderdata){
        //no callback required
        //this will be sent in background

        //construct basic form data
        var form_data_json = {
            "from" : "Me <mailgun@"+config.mailgun.sandbox_domain+">",
            "to" : email_id
        };
        //construct basic request options
        var request_options = {
            auth: "api:"+config.mailgun.api_key,
            protocol: "https:",
            host: "api.mailgun.net",
            path: "/v3/"+config.mailgun.sandbox_domain+"/messages",
            method: "POST",
            headers : {
                "Content-Type" : "application/x-www-form-urlencoded"
            }
        };
        if(!success){
            //send email for failure
            //construct failure body and subject
            var failure_subject = "Pizza Delivery Service - Order Payment Failure";
            var failure_text = "Your order could not be placed because of payment failure.";
            form_data_json.subject = failure_subject;
            form_data_json.text = failure_text;
            
            //stringifying form data json
            var form_data = querystring.stringify(form_data_json);

            //setting content length header
            request_options.headers["Content-Length"] = Buffer.byteLength(form_data);

            var request = https.request(request_options, (res)=>{
                //we'll save the chunks in an array
                var chunks = [];
                res.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                res.on('end', () => {
                    //getting response body
                    var body = Buffer.concat(chunks).toString();
                    if (res.statusCode !== 200 && res.statusCode !== 201){
                        console.log('order_handler#__notify_user_payment failure message statusCode error ', body, res.statusCode);
                    }
                    else{
                        console.log('order_handler#__notify_user_payment failure message success');
                    }
                });
            });
    
            //listen for error
            request.on('error',(err)=>{
                console.log('order_handler#__notify_user_payment failure message error ', err);
            });
          
            // End the request
            request.write(form_data);
            request.end();
        }
        else{
            //send email for success
            //construct failure body and subject
            var success_subject = "Pizza Delivery Service - Order Payment Success";
            var success_text = "Your order was placed successfully. Your order_id is: "+orderdata.order_id;
            var success_html = `
                <html>
                    <body>
                        <p>Your order was placed successfully. Following are the order details:</p>
                        
                        <table style="width:100%">
                            <tr>
                                <th>S. No</th>
                                <th>Pizza</th>
                                <th>Size</th> 
                                <th>Quantity</th>
                                <th>Price</th>
                            </tr>
            `;
            orderdata.items.map((item,ix)=>{
                success_html += `
                            <tr>
                                <td>${ix+1}</td>
                                <td>${products_handler.__fetch_pizza_name(item.pizza_id)}</td>
                                <td>${item.size}</td>
                                <td>${item.quantity}</td>
                                <td>${products_handler.__fetch_pizza_price(item.pizza_id,item.size)}</td>
                            </tr>
                `;
            });
            success_html += `
                            <tr>
                                <td>Total</td>
                                <td> - </td>
                                <td> - </td>
                                <td> - </td>
                                <td>${orderdata.total_price}</td>
                            </tr>
                        </table>
                    </body>
                </html>
            `;
            
            form_data_json.subject = success_subject;
            form_data_json.text = success_text;
            form_data_json.html = success_html;
            
            //stringifying form data json
            var form_data = querystring.stringify(form_data_json);

            //setting content length header
            request_options.headers["Content-Length"] = Buffer.byteLength(form_data);

            var request = https.request(request_options, (res)=>{
                //we'll save the chunks in an array
                var chunks = [];
                res.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                res.on('end', () => {
                    //getting response body
                    var body = Buffer.concat(chunks).toString();
                    if (res.statusCode !== 200 && res.statusCode !== 201){
                        console.log('order_handler#__notify_user_payment success message statusCode error ', body, res.statusCode);
                    }
                    else{
                        console.log('order_handler#__notify_user_payment success message success');
                    }
                });
            });
    
            //listen for error
            request.on('error',(err)=>{
                console.log('order_handler#__notify_user_payment success message error ', err);
            });
          
            // End the request
            request.write(form_data);
            request.end();
        }
    }

    __notify_user_refund(email_id, success, orderdata){
        //no callback required
        //this will be sent in background

        //construct basic form data
        var form_data_json = {
            "from" : "Me <mailgun@"+config.mailgun.sandbox_domain+">",
            "to" : email_id
        };
        //construct basic request options
        var request_options = {
            auth: "api:"+config.mailgun.api_key,
            protocol: "https:",
            host: "api.mailgun.net",
            path: "/v3/"+config.mailgun.sandbox_domain+"/messages",
            method: "POST",
            headers : {
                "Content-Type" : "application/x-www-form-urlencoded"
            }
        };
        if(!success){
            //send email for failure
            //construct failure body and subject
            var failure_subject = "Pizza Delivery Service - Order Refund Failure";
            var failure_text = "Your order with order ID "+orderdata.order_id+" could not be cancelled because of refund failure. Please try again";
            form_data_json.subject = failure_subject;
            form_data_json.text = failure_text;
            
            //stringifying form data json
            var form_data = querystring.stringify(form_data_json);

            //setting content length header
            request_options.headers["Content-Length"] = Buffer.byteLength(form_data);

            var request = https.request(request_options, (res)=>{
                //we'll save the chunks in an array
                var chunks = [];
                res.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                res.on('end', () => {
                    //getting response body
                    var body = Buffer.concat(chunks).toString();
                    if (res.statusCode !== 200 && res.statusCode !== 201){
                        console.log('order_handler#__notify_user_payment failure message statusCode error ', body, res.statusCode);
                    }
                    else{
                        console.log('order_handler#__notify_user_payment failure message success');
                    }
                });
            });
    
            //listen for error
            request.on('error',(err)=>{
                console.log('order_handler#__notify_user_payment failure message error ', err);
            });
          
            // End the request
            request.write(form_data);
            request.end();
        }
        else{
            //send email for success
            //construct failure body and subject
            var success_subject = "Pizza Delivery Service - Order Payment Success";
            var success_text = "Your order with order ID "+orderdata.order_id+" was successfully refunded. Rs "+orderdata.total_price+" will be refunded back to your card/account used for payment";
            
            form_data_json.subject = success_subject;
            form_data_json.text = success_text;            
            
            //stringifying form data json
            var form_data = querystring.stringify(form_data_json);

            //setting content length header
            request_options.headers["Content-Length"] = Buffer.byteLength(form_data);

            var request = https.request(request_options, (res)=>{
                //we'll save the chunks in an array
                var chunks = [];
                res.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                res.on('end', () => {
                    //getting response body
                    var body = Buffer.concat(chunks).toString();
                    if (res.statusCode !== 200 && res.statusCode !== 201){
                        console.log('order_handler#__notify_user_payment success message statusCode error ', body, res.statusCode);
                    }
                    else{
                        console.log('order_handler#__notify_user_payment success message success');
                    }
                });
            });
    
            //listen for error
            request.on('error',(err)=>{
                console.log('order_handler#__notify_user_payment success message error ', err);
            });
          
            // End the request
            request.write(form_data);
            request.end();
        }
    }

}

module.exports = new order_handler();