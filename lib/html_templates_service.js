var path = require('path');
var fs = require('fs');
var config = require('./config');

class html_templates_service{
    constructor(){
        this.template_dir = path.join(__dirname, '../templates');
        this.available_routes = {
            "" : this.index.bind(this),
            "account/create" : this.accountCreate.bind(this),
            "account/edit" : this.accountEdit.bind(this),
            "account/deleted" : this.accountDeleted.bind(this),
            "session/create" : this.sessionCreate.bind(this),
            "session/deleted" : this.sessionDeleted.bind(this),
            "orders/all" : this.ordersAll.bind(this),
            "cart/view" : this.cartView.bind(this)
        }
    }

    index(callback){
        let template_data = {
            head : {
                title : 'Pizza Delivery Service',
                description : 'Browse through our pizza offerings and order now'
            },
            body : {
                class : "index"
            }
        };
        var html = this.__render_complete_template("index",template_data);
        if(html){
            callback(200,html,"html");
        }
        else callback(404);
    }
    accountCreate(callback){
        let template_data = {
            head : {
                title : 'Create an Account',
                description : 'Signup is easy and only takes a few seconds.'
            },
            body : {
                class : "accountCreate"
            }
        };
        var html = this.__render_complete_template("accountCreate",template_data);
        if(html){
            callback(200,html,"html");
        }
        else callback(404);
    }
    accountEdit(callback){
        let template_data = {
            head : {
                title : 'Account Settings',
                description : 'Edit your account details. Or delete your account'
            },
            body : {
                class : "accountEdit"
            }
        };
        var html = this.__render_complete_template("accountEdit",template_data);
        if(html){
            callback(200,html,"html");
        }
        else callback(404);
    }
    accountDeleted(callback){
        let template_data = {
            head : {
                title : 'Account Deleted',
                description : 'Your account has been deleted.'
            },
            body : {
                class : "accountDeleted"
            }
        };
        var html = this.__render_complete_template("accountDeleted",template_data);
        if(html){
            callback(200,html,"html");
        }
        else callback(404);
    }
    sessionCreate(callback){
        let template_data = {
            head : {
                title : 'Login to your account.',
                description : 'Please enter your email address and password to access your account.'
            },
            body : {
                class : "sessionCreate"
            }
        };
        var html = this.__render_complete_template("sessionCreate",template_data);
        if(html){
            callback(200,html,"html");
        }
        else callback(404);
    }
    sessionDeleted(callback){
        let template_data = {
            head : {
                title : 'Logged Out',
                description : 'You have been logged out of your account.'
            },
            body : {
                class : "sessionDeleted"
            }
        };
        var html = this.__render_complete_template("sessionDeleted",template_data);
        if(html){
            callback(200,html,"html");
        }
        else callback(404);
    }
    ordersAll(callback){
        let template_data = {
            head : {
                title : 'View Orders',
                description : 'View all your past orders'
            },
            body : {
                class : "ordersAll"
            }
        };
        var html = this.__render_complete_template("ordersAll",template_data);
        if(html){
            callback(200,html,"html");
        }
        else callback(404);
    }
    cartView(callback){
        let template_data = {
            head : {
                title : 'Cart View',
                description : 'View the current state of your cart. Modify quantity of items or remove items from cart.'
            },
            body : {
                class : "cartView"
            }
        };
        var html = this.__render_complete_template("cartView",template_data);
        if(html){
            callback(200,html,"html");
        }
        else callback(404);
    }

    __render_complete_template(template_name, template_data){
        var self = this;
        //assign global values to template_data
        template_data.global = typeof(config.template_globals) == "object" && config.template_globals != null ? config.template_globals : {};
        
        //get all the htmls
        try{
            var header_html = require(path.join(self.template_dir, "__header"))(template_data);
            var content_html = require(path.join(self.template_dir, template_name))(template_data);
            var footer_html = require(path.join(self.template_dir, "__footer"))(template_data);
            return header_html+content_html+footer_html;
        }
        catch(e){
            console.log("html_templates_service#__render_complete_template error ", e, template_name);
            return false;
        }
    }
}

module.exports = new html_templates_service();

/*
{
    //everywhere DELETE tokens, PUT tokens
  '' : handlers.index, //show menu items if logged in, POST cart, GET cart(for item count), GET products
  SIGNUP 'account/create' : handlers.accountCreate, POST users, POST tokens 
  Account settings 'account/edit' : handlers.accountEdit, GET users, PUT users, DELETE users
  'account/deleted' : handlers.accountDeleted,
  login'session/create' : handlers.sessionCreate, POST tokens 
  'session/deleted' : handlers.sessionDeleted,

  'orders/all' : handlers.checksList, //GET orders, DELETE orders
  'orderCreate' : //POST order
  'cart/view' : handlers.checksCreate// PUT carts, DELETE carts

  'favicon.ico' : handlers.favicon,
};*/