/*
* Includes all API tests for pizza delivery service
*/

const assert = require('assert');
const http = require('http');

//make a http request
var make_http_request = (path, method, headers, json_payload, callback)=>{

    var body = typeof(json_payload) == "object" && json_payload !=null ? JSON.stringify(json_payload) : false;
    var request_options = {
        protocol: "http:",
        host: "localhost",
        port: 3000,
        path: path,
        method: method,
        headers : {
            "Content-Type" : "application/json"
        }
    }
    if(typeof(headers) == "object" && headers != null){
        for(var h in headers){
            if(headers.hasOwnProperty(h)){
                request_options.headers[h] = headers[h];
            }
        }
    }
    if(body) request_options.headers["Content-Length"] = Buffer.byteLength(body);
    var called_back = false;
    var req = http.request(request_options, (res)=>{
        var chunks = [];
        res.on('data', (chunk) => {
            chunks.push(chunk);
        });
        res.on('end', () => {
            //getting response body
            var body = Buffer.concat(chunks).toString();
            var json_resp = JSON.parse(body);
            if(!called_back){
                callback(null, res.statusCode, json_resp);
                called_back = true;
            }
            
        });
    });
    req.on('error',(e)=>{
        if(!called_back){
            called_back = true;
            callback(e);
        }
    });

    if(body) req.write(body);
    req.end();
}
//config for running tests
var config = {};

//make all requests for user
var api = [];

api.push({
    name: "Create a user",
    fn: (done)=>{
        make_http_request("/api/users","POST", undefined, {
            email_id : "example@example.com",
            first_name : "first",
            last_name : "last",
            street_address : "internet",
            password : "2tyyi$As"
        }, (err, code, response)=>{
            if(err){
                done(err);
            }
            else{
                try{
                    assert.equal(code, 200);
                    done();
                }
                catch(e){
                    done(e);
                }
            }
        });
    }
});

api.push({
    name: "Create a token",
    fn: (done)=>{
        make_http_request("/api/tokens","POST", undefined, {
            email_id : "example@example.com",
            password : "2tyyi$As"
        }, (err, code, response)=>{
            if(err){
                done(err);
            }
            else{
                try{
                    assert.equal(code, 200);
                    assert.equal(typeof(response.data.token), "string");
                    assert.equal(typeof(response.data.email_id), "string");
                    assert.equal(typeof(response.data.expires), "number");
                    config.token = response.data.token;
                    done();
                }
                catch(e){
                    done(e);
                }
            }
        });
    }
});

api.push({
    name: "Get the token",
    fn: (done)=>{
        make_http_request("/api/tokens?token="+config.token,"GET", undefined, undefined, (err, code, response)=>{
            if(err){
                done(err);
            }
            else{
                try{
                    assert.equal(code, 200);
                    assert.equal(typeof(response.token), "string");
                    assert.equal(typeof(response.email_id), "string");
                    assert.equal(typeof(response.expires), "number");
                    done();
                }
                catch(e){
                    done(e);
                }
            }
        });
    }
});

api.push({
    name: "Extend the token",
    fn: (done)=>{
        make_http_request("/api/tokens","PUT", undefined, {
            "token" : config.token,
            "extend" : true
        }, (err, code, response)=>{
            if(err){
                done(err);
            }
            else{
                try{
                    assert.equal(code, 200);
                    assert.equal(typeof(response.__latest_data.token), "string");
                    assert.equal(typeof(response.__latest_data.email_id), "string");
                    assert.equal(typeof(response.__latest_data.expires), "number");
                    done();
                }
                catch(e){
                    done(e);
                }
            }
        });
    }
});

api.push({
    name: "Delete the token",
    fn: (done)=>{
        make_http_request("/api/tokens?token="+config.token,"DELETE", undefined, {
            "token" : config.token,
            "extend" : true
        }, (err, code, response)=>{
            if(err){
                done(err);
            }
            else{
                try{
                    assert.equal(code, 200);
                    done();
                }
                catch(e){
                    done(e);
                }
            }
        });
    }
});

api.push({
    name: "Create another token",
    fn: (done)=>{
        make_http_request("/api/tokens","POST", undefined, {
            email_id : "example@example.com",
            password : "2tyyi$As"
        }, (err, code, response)=>{
            if(err){
                done(err);
            }
            else{
                try{
                    assert.equal(code, 200);
                    assert.equal(typeof(response.data.token), "string");
                    assert.equal(typeof(response.data.email_id), "string");
                    assert.equal(typeof(response.data.expires), "number");
                    config.token = response.data.token;
                    done();
                }
                catch(e){
                    done(e);
                }
            }
        });
    }
});

api.push({
    name: "Get user details",
    fn: (done)=>{
        make_http_request("/api/users?email_id=example@example.com","GET",{"x-token": config.token}, undefined, (err, code, response)=>{
            if(err){
                done(err);
            }
            else{
                try{
                    assert.equal(code, 200);
                    assert.equal(typeof(response.first_name), "string");
                    assert.equal(typeof(response.last_name), "string");
                    assert.equal(typeof(response.email_id), "string");
                    assert.equal(typeof(response.street_address), "string");
                    assert.equal(typeof(response.password), "undefined");
                    assert.ok(response.orders instanceof Array);
                    done();
                }
                catch(e){
                    done(e);
                }
            }
        });
    }
});

api.push({
    name: "Edit user details",
    fn: (done)=>{
        make_http_request("/api/users","PUT", {"x-token" : config.token}, {
            email_id : "example@example.com",
            first_name : "first",
            last_name : "last",
            street_address : "myspace akshaya"
        }, (err, code, response)=>{
            if(err){
                done(err);
            }
            else{
                try{
                    assert.equal(code, 200);
                    assert.equal(typeof(response.__latest_data.first_name), "string");
                    assert.equal(typeof(response.__latest_data.last_name), "string");
                    assert.equal(typeof(response.__latest_data.email_id), "string");
                    assert.equal(typeof(response.__latest_data.street_address), "string");
                    assert.equal(typeof(response.__latest_data.password), "undefined");
                    assert.ok(response.__latest_data.orders instanceof Array);
                    done();
                }
                catch(e){
                    done(e);
                }
            }
        });
    }
});

api.push({
    name: "Get all Pizzas",
    fn: (done)=>{
        make_http_request("/api/products","GET",{"x-token": config.token}, undefined, (err, code, response)=>{
            if(err){
                done(err);
            }
            else{
                try{
                    assert.equal(code, 200);
                    assert.ok(response.pizzas instanceof Array);
                    assert.ok(response.pizzas.length > 0);
                    assert.equal(typeof(response.pizzas[0].pizza_id), "string");
                    assert.equal(typeof(response.pizzas[0].title), "string");
                    assert.equal(typeof(response.pizzas[0].ingredients), "string");
                    assert.equal(typeof(response.pizzas[0].prices), "object");
                    config.pizzas = response.pizzas;
                    done();
                }
                catch(e){
                    done(e);
                }
            }
        });
    }
});

api.push({
    name: "Put an item in cart",
    fn: (done)=>{
        //get a random pizza_id
        let pizza_index = Math.floor(Math.random()*config.pizzas.length);
        let pizza_id = config.pizzas[pizza_index].pizza_id;
        let size_index = Math.floor(Math.random()*Object.keys(config.pizzas[pizza_index].prices).length);
        let size = Object.keys(config.pizzas[pizza_index].prices)[size_index];
        make_http_request("/api/carts","POST", {"x-token" : config.token}, {
            pizza_id : pizza_id,
            size: size,
            quantity: 1
        }, (err, code, response)=>{
            if(err){
                done(err);
            }
            else{
                try{
                    assert.equal(code, 200);
                    done();
                }
                catch(e){
                    done(e);
                }
            }
        });
    }
});

api.push({
    name: "Put another item in cart",
    fn: (done)=>{
        //get a random pizza_id
        let pizza_index = Math.floor(Math.random()*config.pizzas.length);
        let pizza_id = config.pizzas[pizza_index].pizza_id;
        let size_index = Math.floor(Math.random()*Object.keys(config.pizzas[pizza_index].prices).length);
        let size = Object.keys(config.pizzas[pizza_index].prices)[size_index];
        make_http_request("/api/carts","POST", {"x-token" : config.token}, {
            pizza_id : pizza_id,
            size: size,
            quantity: 2
        }, (err, code, response)=>{
            if(err){
                done(err);
            }
            else{
                try{
                    assert.equal(code, 200);
                    done();
                }
                catch(e){
                    done(e);
                }
            }
        });
    }
});

api.push({
    name: "Fetch item from cart",
    fn: (done)=>{
        make_http_request("/api/carts","GET", {"x-token" : config.token}, undefined, (err, code, response)=>{
            if(err){
                done(err);
            }
            else{
                try{
                    assert.equal(code, 200);
                    assert.equal(typeof(response.email_id),"string");
                    assert.equal(typeof(response.total_price),"number");
                    assert.ok(response.items instanceof Array);
                    if(response.items.length > 0){
                        assert.equal(typeof(response.items[0].pizza_id), "string");
                        assert.equal(typeof(response.items[0].size), "string");
                        assert.equal(typeof(response.items[0].quantity), "number");
                    }
                    config.cart_length = response.items.length;
                    done();
                }
                catch(e){
                    done(e);
                }
            }
        });
    }
});

api.push({
    name: "Update item quantity in cart",
    fn: (done)=>{
        let cart_id = Math.floor(Math.random()*config.cart_length);
        make_http_request("/api/carts","PUT", {"x-token" : config.token}, {cart_id : cart_id, quantity: 2}, (err, code, response)=>{
            if(err){
                done(err);
            }
            else{
                try{
                    assert.equal(code, 200);
                    assert.equal(typeof(response.__latest_data.email_id),"string");
                    assert.equal(typeof(response.__latest_data.total_price),"number");
                    assert.ok(response.__latest_data.items instanceof Array);
                    if(response.__latest_data.items.length > 0){
                        assert.equal(typeof(response.__latest_data.items[0].pizza_id), "string");
                        assert.equal(typeof(response.__latest_data.items[0].size), "string");
                        assert.equal(typeof(response.__latest_data.items[0].quantity), "number");
                    }
                    config.cart_length = response.__latest_data.items.length;
                    done();
                }
                catch(e){
                    done(e);
                }
            }
        });
    }
});

api.push({
    name: "Delete item from cart",
    fn: (done)=>{
        let cart_id = Math.floor(Math.random()*config.cart_length);
        make_http_request("/api/carts","DELETE", {"x-token" : config.token}, {cart_id : cart_id}, (err, code, response)=>{
            if(err){
                done(err);
            }
            else{
                try{
                    assert.equal(code, 200);
                    assert.equal(typeof(response.__latest_data.email_id),"string");
                    assert.equal(typeof(response.__latest_data.total_price),"number");
                    assert.ok(response.__latest_data.items instanceof Array);
                    if(response.__latest_data.items.length > 0){
                        assert.equal(typeof(response.__latest_data.items[0].pizza_id), "string");
                        assert.equal(typeof(response.__latest_data.items[0].size), "string");
                        assert.equal(typeof(response.__latest_data.items[0].quantity), "number");
                    }
                    config.cart_length = response.__latest_data.items.length;
                    done();
                }
                catch(e){
                    done(e);
                }
            }
        });
    }
});

api.push({
    name: "Create Order",
    fn: (done)=>{
        if(typeof(config.cart_length) == "undefined" || config.cart_length == 0){
            done("no items in cart");            
            return;
        }
        make_http_request("/api/orders","POST", {"x-token" : config.token}, {
            delivery_address : "internet",
            payment_token : "tok_visa"
        }, (err, code, response)=>{
            if(err){
                done(err);
            }
            else{
                try{
                    assert.equal(code, 200);
                    assert.equal(typeof(response.__order_data.email_id),"string");
                    assert.equal(typeof(response.__order_data.total_price),"number");
                    assert.ok(response.__order_data.items instanceof Array);
                    assert.ok(response.__order_data.items.length > 0);
                    assert.equal(typeof(response.__order_data.items[0].pizza_id), "string");
                    assert.equal(typeof(response.__order_data.items[0].size), "string");
                    assert.equal(typeof(response.__order_data.items[0].quantity), "number");
                    assert.equal(typeof(response.__order_data.delivery_address),"string");
                    assert.equal(typeof(response.__order_data.payment_id),"string");
                    assert.equal(typeof(response.__order_data.order_id),"string");
                    assert.equal(typeof(response.__order_data.order_created),"number");

                    config.order_id = response.__order_data.order_id;
                    done();
                }
                catch(e){
                    done(e);
                }
            }
        });
    }
});

api.push({
    name: "Cancel Order",
    fn: (done)=>{
        make_http_request("/api/orders","DELETE", {"x-token" : config.token}, {
            order_id : config.order_id,
            delete_order : true
        }, (err, code, response)=>{
            if(err){
                done(err);
            }
            else{
                try{
                    assert.equal(code, 200);
                    assert.equal(typeof(response.__latest_order_data.email_id),"string");
                    assert.equal(typeof(response.__latest_order_data.total_price),"number");
                    assert.ok(response.__latest_order_data.items instanceof Array);
                    assert.ok(response.__latest_order_data.items.length > 0);
                    assert.equal(typeof(response.__latest_order_data.items[0].pizza_id), "string");
                    assert.equal(typeof(response.__latest_order_data.items[0].size), "string");
                    assert.equal(typeof(response.__latest_order_data.items[0].quantity), "number");
                    assert.equal(typeof(response.__latest_order_data.delivery_address),"string");
                    assert.equal(typeof(response.__latest_order_data.payment_id),"string");
                    assert.equal(typeof(response.__latest_order_data.order_id),"string");
                    assert.equal(typeof(response.__latest_order_data.order_created),"number");
                    assert.equal(typeof(response.__latest_order_data.deleted),"boolean");

                    assert.equal(response.__latest_order_data.order_id, config.order_id);
                    done();
                }
                catch(e){
                    done(e);
                }
            }
        });
    }
});

api.push({
    name: "Fetch Order",
    fn: (done)=>{
        make_http_request("/api/orders?order_id="+config.order_id,"GET", {"x-token" : config.token}, undefined, (err, code, response)=>{
            if(err){
                done(err);
            }
            else{
                try{
                    assert.equal(code, 200);
                    assert.equal(typeof(response.email_id),"string");
                    assert.equal(typeof(response.total_price),"number");
                    assert.ok(response.items instanceof Array);
                    assert.ok(response.items.length > 0);
                    assert.equal(typeof(response.items[0].pizza_id), "string");
                    assert.equal(typeof(response.items[0].size), "string");
                    assert.equal(typeof(response.items[0].quantity), "number");
                    assert.equal(typeof(response.delivery_address),"string");
                    assert.equal(typeof(response.payment_id),"string");
                    assert.equal(typeof(response.order_id),"string");
                    assert.equal(typeof(response.order_created),"number");
                    assert.equal(typeof(response.deleted),"boolean");

                    assert.equal(response.order_id, config.order_id);
                    done();
                }
                catch(e){
                    done(e);
                }
            }
        });
    }
});

//do this in the end
api.push({
    name: "Delete user",
    fn: (done)=>{
        make_http_request("/api/users?email_id=example@example.com","DELETE", {"x-token" : config.token},undefined, (err, code, response)=>{
            if(err){
                done(err);
            }
            else{
                try{
                    assert.equal(code, 200);
                    done();
                }
                catch(e){
                    done(e);
                }
            }
        });
    }
});



module.exports = api;