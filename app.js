//import built-in modules here
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const os = require('os');
const cluster = require('cluster');
//import the modules we exported here
const config = require('./config');
var router = require('./router');

//create a server object
var server = {};

// instantiate the http server and start listening
server.http_server = http.createServer(function (req,res) {
	unified_server_callback(req,res);
});

// instantiate the https server and start listening
var https_server_options = {
	key : fs.readFileSync('./ssl/key.pem'),
	cert : fs.readFileSync('./ssl/cert.pem')
}

server.https_server = https.createServer(https_server_options,function (req,res) {
	unified_server_callback(req,res);
});

//the unified callback function
var unified_server_callback = (req,res)=>{
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
		parsed_req_obj.body = buffer.toString('utf-8');
		//get callback from router
		router.route_request(parsed_req_obj, (code, message)=>{
			res.setHeader('Content-Type','application/json');
			res.writeHead(code);
			res.end(JSON.stringify(message));

			console.log((new Date).toISOString(),"request received ", parsed_req_obj);
		});
	});
}

server.init = ()=>{
	//start listening on both http and https servers
	server.http_server.listen(config.http_port, ()=>{
		console.log("HTTP server is listening on port", config.http_port);
	});

	server.https_server.listen(config.https_port, ()=>{
		console.log("HTTPS server is listening on port", config.https_port);
	});
}

if(cluster.isMaster){
	//fork processes on other threads
	os.cpus().map(()=>{
		cluster.fork();
	});
}
else{
	//init the server
	server.init();
}