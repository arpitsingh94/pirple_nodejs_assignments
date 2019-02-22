var crypto = require('crypto');
var config = require('./config');

class helpers{
	parse_string_to_json(string){
		try{
			var json = JSON.parse(string);
			return json;
		}
		catch(error){
			//invalid json. set default
			return {};
		}
	}

	validate_email(email) {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(email).toLowerCase());
	}

	create_hash(string){
		return crypto.createHmac('sha256', config.hashing_secret)
			.update(string)
			.digest('hex');
	}

	create_random_string(string_length){
		var characters_to_use = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		var random_string = "";
		for(var i=0;i<string_length;i++){
			random_string += characters_to_use[Math.floor(Math.random()*characters_to_use.length)];
		}
		return random_string;
	}
	color_command(str, clr){
		var colors = {};
		colors.black = "\x1b[30m";
		colors.red = "\x1b[31m";
		colors.green = "\x1b[32m";
		colors.yellow = "\x1b[33m";
		colors.blue = "\x1b[34m";
		colors.magenta = "\x1b[35m";
		colors.cyan = "\x1b[36m";
		colors.white = "\x1b[37m";

		if(colors.hasOwnProperty(clr)){
			return colors[clr]+str+"\x1b[0m";
		}
		else return str;
	}
}

module.exports = new helpers();