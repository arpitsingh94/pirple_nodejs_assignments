/*
* public_handler file that will handle all the requests coming to the /public/
*
*/
//dependencies
var config = require('../config');
var fs = require('fs');
var path = require('path');

class public_handler{
    constructor(){}

    serve_static(filename, callback){
        var path_to_read = path.join(__dirname, "../../public/",filename);
        fs.readFile(path_to_read, (err,data)=>{
            if(err){
                //send error back
                console.log("public_handler#serve_static error in reading public file: ",err);
                callback(404, {error: "could not find file"});
            }
            else{
                var content_type = "plain";
                if(filename.indexOf('.css') > -1){
                    content_type = 'css';
                }
                if(filename.indexOf('.png') > -1){
                    content_type = 'png';
                }
                if(filename.indexOf('.jpg') > -1){
                    content_type = 'jpg';
                }
                if(filename.indexOf('.ico') > -1){
                    content_type = 'favicon';
                }
                callback(200, data, content_type);   
            }
        });
    }
}

module.exports = new public_handler();