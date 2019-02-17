// we have all the configs here
var fs = require('fs');

var environments = {
	"staging":{
		http_port : 3000,
		https_port : 3300,
		env_name: "staging",
		hashing_secret : "staginghashsecretkey",
		token_length: 10,
		orderid_length: 20,
		order_deletion_time: 10, // this is time in minutes before which order can still be deleted
		stripe: {
			secret: ""
		},
		mailgun: {
			api_key: "",
			sandbox_domain: "sandbox93ac034c273d456ea66644499e456998.mailgun.org"
		},
		template_globals : {
			'appName' : 'Pizza Delivery Service',
			'companyName' : 'RandomCompanyName, Inc.',
			'yearCreated' : '2019',
			'baseUrl' : 'http://localhost:3000/'
		}
	},
	"production":{
		http_port : 5000,
		https_port : 5500,
		env_name: "production",
		hashing_secret : "productionhashsecretkey",
		token_length: 20,
		orderid_length: 20,
		order_deletion_time: 10, // this is time in minutes before which order can still be deleted
		stripe: {
			secret: ""
		},
		mailgun: {
			api_key: "",
			sandbox_domain: "sandbox93ac034c273d456ea66644499e456998.mailgun.org"
		},
		template_globals : {
			'appName' : 'Pizza Delivery Service',
			'companyName' : 'RandomCompanyName, Inc.',
			'yearCreated' : '2019',
			'baseUrl' : 'http://localhost:3000/'
		}
	}
}

try{
	// var app_keys = fs.readFileSync('.app_keys.json',{encoding: 'utf-8'});
	var app_keys = require('../.app_keys.json');
	environments.staging.stripe.secret = app_keys.staging.stripe.secret;
	environments.staging.mailgun.api_key = app_keys.staging.mailgun.api_key;

	environments.production.stripe.secret = app_keys.production.stripe.secret;
	environments.production.mailgun.api_key = app_keys.production.mailgun.api_key;
}
catch(e){
	console.log("error in reading app keys: ",e);
	process.exit(-1);
}

var export_environment_key = (typeof(process.env.NODE_ENV) == "string" && environments[process.env.NODE_ENV] !== undefined ) ? process.env.NODE_ENV : "staging";

console.log("App has started with environment: ",environments[export_environment_key].env_name);

module.exports = environments[export_environment_key]; 