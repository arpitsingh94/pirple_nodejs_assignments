/*
* router file that will handle all the requests coming to the server
*
*/
//dependencies
var user_handler = require('./handlers/user_handler');
var token_handler = require('./handlers/token_handler');
var products_handler = require('./handlers/products_handler');
var cart_handler = require('./handlers/cart_handler');
var order_handler = require('./handlers/order_handler');
var public_handler = require('./handlers/public_handler');

var html_templates_service = require('./html_templates_service');

//top level handlers. these handlers will in turn route request to lower level handlers
var router_handlers = {
	"not_found" : (req,callback)=>{
		callback(404, {message: "The path you requested was not found."});
	},
	"api/users" : (req,callback)=>{
		if(user_handler.allowed_methods.indexOf(req.method) >-1){
			user_handler[req.method](req, callback);
		}
		else{
			router_handlers.not_found(req,callback);
		}
	},
	"api/tokens" : (req,callback)=>{
		if(token_handler.allowed_methods.indexOf(req.method) >-1){
			token_handler[req.method](req, callback);
		}
		else{
			router_handlers.not_found(req,callback);
		}
	},
	"api/products" : (req,callback)=>{
		if(products_handler.allowed_methods.indexOf(req.method) >-1){
			products_handler[req.method](req, callback);
		}
		else{
			router_handlers.not_found(req,callback);
		}
	},
	"api/carts" : (req,callback)=>{
		if(cart_handler.allowed_methods.indexOf(req.method) >-1){
			cart_handler[req.method](req, callback);
		}
		else{
			router_handlers.not_found(req,callback);
		}
	},
	"api/orders" : (req,callback)=>{
		if(order_handler.allowed_methods.indexOf(req.method) >-1){
			order_handler[req.method](req, callback);
		}
		else{
			router_handlers.not_found(req,callback);
		}
	},
	"public" : (req,callback)=>{
		public_handler.serve_static(req.trimmed_path.replace("public/",""), callback);
	}
};

class router{
	constructor(){
		this.handlers = router_handlers;
	}

	//router will be passed parsed_req object and it will return statuscode and message
	route_request(req, callback){
		//route all public assets
		if(req.trimmed_path.indexOf('public/') > -1){
			this.handlers.public(req,callback);
		}
		//route all api requests
		else if(req.trimmed_path.indexOf('api/') > -1 && typeof(this.handlers[req.trimmed_path]) !== "undefined") {
			this.handlers[req.trimmed_path](req,callback);
		}
		//route html requests
		else if( typeof(html_templates_service.available_routes[req.trimmed_path]) !== "undefined" ){
			html_templates_service.available_routes[req.trimmed_path](callback);
		}
		//return 404
		else this.handlers.not_found(req,callback);
	}
}

module.exports = new router();