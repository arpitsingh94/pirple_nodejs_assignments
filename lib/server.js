//import built-in modules here
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const debug = require('util').debuglog("access_logs");

//import the modules we exported here
const config = require('./config');
var router = require('./router');
var helpers = require('./helpers');

//creating the server class
class server{
	constructor(){
		// create the http server
		this.http_server = http.createServer(this.unified_server_callback);
		//ssl options for https server
		this.https_server_options = {
			key : fs.readFileSync('./ssl/key.pem'),
			cert : fs.readFileSync('./ssl/cert.pem')
		}
		//create the https server
		this.https_server = https.createServer(this.https_server_options, (req,res)=>{
			this.unified_server_callback(req,res);
		});
	}

	//create a callback to be passed to the http and https servers
	unified_server_callback(req,res){
		//understand req
		//parse path, query, body, header, method

		var url_parsed = url.parse(req.url, true);
		var parsed_req_obj = {
			method: req.method.toLowerCase(),
			path: url_parsed.pathname,
			trimmed_path: url_parsed.pathname.replace(/^\/+|\/$/g,""),
			query: url_parsed.query,
			headers: req.headers
		}

		var buffer = '';
		req.on('data', (data)=>{
			buffer+= data;
		});

		req.on('end', ()=>{
			//creating a string from the buffer
			parsed_req_obj.body = buffer.toString('utf-8');
			//since this is json API, parse the body into json
			parsed_req_obj.body = helpers.parse_string_to_json(parsed_req_obj.body);

			//get callback from router
			router.route_request(parsed_req_obj, (code, message, content_type)=>{
				content_type = typeof(content_type) == "string" ? content_type : "json";
				code = typeof(code) == "number" ? code : 200;

				//depending on content-type we will craft this response_string
				let response_string = "";

				if(content_type == "json"){
					res.setHeader('Content-Type','application/json');
					message = typeof(message) == 'object'? message : {};
					response_string = JSON.stringify(message)
				}
				else if(content_type == "html"){
					res.setHeader('Content-Type','text/html');
					response_string = typeof(message) == 'string'? message : "";
				}
				else if(content_type == "jpg"){
					res.setHeader('Content-Type','image/jpeg');
					response_string = typeof(message) !== 'undefined'? message : "";
				}
				else if(content_type == "png"){
					res.setHeader('Content-Type','image/png');
					response_string = typeof(message) !== 'undefined'? message : "";
				}
				else if(content_type == "css"){
					res.setHeader('Content-Type','text/css');
					response_string = typeof(message) !== 'undefined'? message : "";
				}
				else if(content_type == "plain"){
					res.setHeader('Content-Type','text/plain');
					response_string = typeof(message) !== 'undefined'? message : "";
				}
				else if(content_type == "favicon"){
					res.setHeader('Content-Type','image/x-icon');
					response_string = typeof(message) !== 'undefined'? message : "";
				}
				
				//these two operations are common for all content-types
				res.writeHead(code);
				res.end(response_string);

				debug((new Date).toISOString(),"request received ", parsed_req_obj);
			});
		});
	}


	//defining the server init function
	init(){
		//start the http server
		this.http_server.listen(config.http_port, ()=>{
			console.log("\x1b[33m%s\x1b[0m", "HTTP server is listening on port: "+ config.http_port);
		});

		//start the https server
		this.https_server.listen(config.https_port, ()=>{
			console.log("\x1b[32m%s\x1b[0m", "HTTPS server is listening on port: "+ config.https_port);
		});	
	}
};


//exporting the server object
module.exports = new server();