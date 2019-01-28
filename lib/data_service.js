/*
*
* Class for reading and writing data to file system
* for errors, we will callback generic message but log specific message
*/
//dependencies
var fs = require('fs');
var path = require('path');
var helpers = require('./helpers');


//implement all crud operations
class data_service{
	constructor(){
		//init all data relevant to data service
		this.base_path = path.join(__dirname, '../.data/');
	}

	//create all relevant directories for our project
	init(){
		//create base dir
		if(!fs.existsSync(this.base_path)) fs.mkdirSync(this.base_path);

		// all these operations are in sync since they are in the beginning and these directories need to be up before we start serving API requests
		//create dir for users
		if(!fs.existsSync(path.join(this.base_path,'users'))) fs.mkdirSync(path.join(this.base_path,'users'));
		//create dir for carts
		if(!fs.existsSync(path.join(this.base_path,'carts'))) fs.mkdirSync(path.join(this.base_path,'carts'));
		//create dir for orders
		if(!fs.existsSync(path.join(this.base_path,'orders'))) fs.mkdirSync(path.join(this.base_path,'orders'));
		//create dir for tokens
		if(!fs.existsSync(path.join(this.base_path,'tokens'))) fs.mkdirSync(path.join(this.base_path,'tokens'));
	}

	//create data
	create(table, file, data, callback){
		var self = this;
		
		//open file for writing and throw error if it already exists
		fs.open(path.join(self.base_path,table,file+".json"), "wx", (err,file_descriptor)=>{
			if(!err && file_descriptor){
				//stringify data
				var string_data = JSON.stringify(data);
				//write to file
				fs.writeFile(file_descriptor, string_data, (err)=>{
					if(err){
						console.log("data service#create write error ",err);
						callback({error : "error in writing to file"});
					}
					else{
						//success in writing. now close file
						fs.close(file_descriptor, (err)=>{
							if(err){
								console.log("data service#create close error ",err);
								callback({error : "error in closing file"});
							}
							else callback(null);
						});
					}
				})
			}
			else{
				console.log("data service#create open error ",err);
				callback({error: "error in opening file. file may already exist"});
			}
		});
	}
	//read data
	read(table, file, callback){
		var self = this;

		//open file for writing and throw error if it already exists
		fs.readFile(path.join(self.base_path,table,file+".json"), "utf-8", (err,data)=>{
			if(!err && data){
				//get json data
				var json_data = helpers.parse_string_to_json(data.trim());
				callback(null,json_data);
			}
			else{
				console.log("data service#read error ",err);
				callback({error: "error in reading file. file may not exist"});
			}
		});
	}
	//update data
	update(table, file, newdata, callback){
		var self = this;
		
		//open file for reading and writing and throw error if it does not exist
		fs.open(path.join(self.base_path,table,file+".json"), "r+", (err,file_descriptor)=>{
			if(!err && file_descriptor){
				//stringify data
				var string_data = JSON.stringify(newdata);
				//write and truncate old data
				fs.truncate(file_descriptor,(err)=>{
					if(err){
						console.log("data service#update truncate error ",err);
						callback({error: "error in truncating file"});
					}
					else{
						fs.writeFile(file_descriptor, string_data,(err)=>{
							if(err){
								console.log("data service#update write error ",err);
								callback({error: "error in writing to file"});
							}
							else{
								//success in writing. now close file
								fs.close(file_descriptor, (err)=>{
									if(err){
										console.log("data service#update close error ",err);
										callback({error: "error in closing file"});
									}
									else callback(null);
								});
							}
						});
					}
				});
			}
			else{
				//file may not exist
				console.log("data service#update open error ",err);
				callback({error: "error in opening file. file may not already exist"});
			}
		});
	}
	//delete data
	delete(table, file, callback){
		var self = this;
		//delete file
		fs.unlink(path.join(self.base_path,table,file+".json") ,(err)=>{
			if(err){
				console.log("data service#delete error ",err);
				callback({error: "error in deleting file"});
			}
			else callback(null);
		});
	}
	//list all the files for that table
	list(table, callback){
		var self = this;
		//read the directory for all files
		fs.readdir(path.join(self.base_path, table),(err, files)=>{
			if(err){
				console.log("data service#list error ",err);
				callback({error: "error in reading files"});
			}
			else{
				files.map(file=>{
					//only replacing .json at the end
					//because it might be part of the email address
					return file.replace(/\.json$/,"");
				})
				callback(null,files);
			}
		});
	}
}

module.exports = new data_service();