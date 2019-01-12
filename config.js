// we have all the configs here


var environments = {
	"staging":{
		http_port : 3000,
		https_port : 3300,
		env_name: "staging"
	},
	"production":{
		http_port : 5000,
		https_port : 5500,
		env_name: "production"
	}
}

var export_environment_key = (typeof(process.env.NODE_ENV) == "string" && environments[process.env.NODE_ENV] !== "undefined" ) ? process.env.NODE_ENV : "staging";

console.log("App has started with environment: ",environments[export_environment_key].env_name);

module.exports = environments[export_environment_key]; 