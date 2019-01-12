//router will be passed parsed_req object and it will return statuscode and message

var router_handlers = {
	"not_found" : (req,callback)=>{
		callback(404, {message: "The path you requested was not found."});
	},
	"hello" : {
		"post" : (req, callback)=>{
			callback(200, {message: "Hi there. this is an app in progress"});
		}
	}
}

class router{
	constructor(){
		this.handlers = router_handlers;
	}

	route_request(req, callback){
		if(typeof(this.handlers[req.trimmed_path]) !== "undefined" && typeof(this.handlers[req.trimmed_path][req.method]) !== "undefined" ) {
			this.handlers[req.trimmed_path][req.method](req,callback);
		}
		else this.handlers.not_found(req,callback);
	}
}

module.exports = new router();