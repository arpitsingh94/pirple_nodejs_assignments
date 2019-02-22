/*
* the main file for our application which initiates everything
*
*/
var data_service = require('./lib/data_service');
var server = require('./lib/server');
var cli = require('./lib/cli');

var app = {};

//define the app init function
app.init = ()=>{
	//init the data service
	data_service.init();
	//init the server
	server.init();
	//init the cli module with a delay
	setTimeout(()=>{
		cli.init();
	}, 100);
}


//call the app init function
app.init();


//exporting the app
module.exports = app;