/*
 * Frontend Logic for application
 *
 */
//container for utility functions and helper functions
var utils = {};
utils.showmessage = function(message){
  let display = "";
  var x = document.getElementById("toast");
  if(typeof(message) == "string") display = message;
  else if (typeof(message) == "object"){
    if(message.success){
      display = message.success;
      x.children[0].style.backgroundColor = "#217844";
    }
    else if (message.error){
      display = message.error;
      x.children[0].style.backgroundColor = "#c83737";
    }
    else display = JSON.stringify(message);
  }
  x.children[0].innerHTML = display.charAt(0).toUpperCase() + display.substr(1);
  x.className = "show";
  setTimeout(()=>{
    x.className = x.className.replace("show", "");
  }, 5000);
}

// Container for frontend application
var app = {};

// Config
app.config = {
  'sessionToken' : false
};

// AJAX Client (for RESTful API)
app.client = {}

// Interface for making API calls
app.client.request = function(headers,path,method,queryStringObject,payload,callback){

  // Set defaults
  headers = typeof(headers) == 'object' && headers !== null ? headers : {};
  path = typeof(path) == 'string' ? path : '/';
  method = typeof(method) == 'string' && ['POST','GET','PUT','DELETE'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET';
  queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
  payload = typeof(payload) == 'object' && payload !== null ? payload : {};
  callback = typeof(callback) == 'function' ? callback : false;

  // For each query string parameter sent, add it to the path
  var requestUrl = path+'?';
  var counter = 0;
  for(var queryKey in queryStringObject){
     if(queryStringObject.hasOwnProperty(queryKey)){
       counter++;
       // If at least one query string parameter has already been added, preprend new ones with an ampersand
       if(counter > 1){
         requestUrl+='&';
       }
       // Add the key and value
       requestUrl+=queryKey+'='+queryStringObject[queryKey];
     }
  }

  // Form the http request as a JSON type
  var xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl, true);
  xhr.setRequestHeader("Content-type", "application/json");

  // For each header sent, add it to the request
  for(var headerKey in headers){
     if(headers.hasOwnProperty(headerKey)){
       xhr.setRequestHeader(headerKey, headers[headerKey]);
     }
  }

  // If there is a current session token set, add that as a header
  if(app.config.sessionToken){
    xhr.setRequestHeader("token", app.config.sessionToken.id);
  }

  // When the request comes back, handle the response
  xhr.onreadystatechange = function() {
      if(xhr.readyState == XMLHttpRequest.DONE) {
        var statusCode = xhr.status;
        var responseReturned = xhr.responseText;

        // Callback if requested
        if(callback){
          try{
            var parsedResponse = JSON.parse(responseReturned);
            callback(statusCode,parsedResponse);
          } catch(e){
            callback(statusCode,false);
          }

        }
      }
  }

  // Send the payload as JSON
  var payloadString = JSON.stringify(payload);
  xhr.send(payloadString);

};

// Bind the logout button
app.bindLogoutButton = function(){
  document.getElementById("logoutButton").addEventListener("click", function(e){

    // Stop it from redirecting anywhere
    e.preventDefault();

    // Log the user out
    app.logUserOut();

  });
};

// Bind the logout button
app.bindSizeListtoPriceChange = function(){
  var allSelectTags = document.querySelectorAll("select");
  for(var i = 0; i < allSelectTags.length; i++){
    allSelectTags[i].addEventListener("change", function(e){
      e.preventDefault();
      console.log(this.value);
      var currentSize = this.value;
      var currentPrice;
      for(var j = 0; j < this.children.length; j++){
        if(this.children[j].value == currentSize) currentPrice = this.children[j].attributes.price.value;
      }
      //update the price displayed
      this.parentNode.parentNode.children[4].innerHTML = "INR " + currentPrice;
    });
  }
};

// Log the user out then redirect them
app.logUserOut = function(redirectUser){
  // Set redirectUser to default to true
  redirectUser = typeof(redirectUser) == 'boolean' ? redirectUser : true;

  // Get the current token id
  var tokenId = typeof(app.config.sessionToken.token) == 'string' ? app.config.sessionToken.token : false;

  // Send the current token to the tokens endpoint to delete it
  var queryStringObject = {
    'token' : tokenId
  };
  app.client.request(undefined,'api/tokens','DELETE',queryStringObject,undefined,function(statusCode,responsePayload){
    // Set the app.config token as false
    app.setSessionToken(false);

    // Send the user to the logged out page
    if(redirectUser){
      window.location = '/session/deleted';
    }

  });
};

// Bind the forms
app.bindForms = function(){
  if(document.querySelector("form")){

    var allForms = document.querySelectorAll("form");
    for(var i = 0; i < allForms.length; i++){
        allForms[i].addEventListener("submit", function(e){

        // Stop it from submitting
        e.preventDefault();
        var formId = this.id;
        var path = this.action;
        var method = this.method.toUpperCase();
        var headers = this.classList.contains("tokenRequest") ? {"x-token": app.config.sessionToken.token} : {};


        // Turn the inputs into a payload
        var payload = {};
        var elements = this.elements;
        for(var i = 0; i < elements.length; i++){
          if(elements[i].type !== 'submit'){
            // Determine class of element and set value accordingly
            var classOfElement = typeof(elements[i].classList.value) == 'string' && elements[i].classList.value.length > 0 ? elements[i].classList.value : '';
            var valueOfElement = elements[i].type == 'checkbox' && classOfElement.indexOf('multiselect') == -1 ? elements[i].checked : classOfElement.indexOf('intval') == -1 ? elements[i].value : parseInt(elements[i].value);
            var elementIsChecked = elements[i].checked;
            // Override the method of the form if the input's name is _method
            var nameOfElement = elements[i].name;
            if(nameOfElement == '_method'){
              method = valueOfElement;
            } else {
              // Create an payload field named "method" if the elements name is actually httpmethod
              if(nameOfElement == 'httpmethod'){
                nameOfElement = 'method';
              }
              // Create an payload field named "id" if the elements name is actually uid
              if(nameOfElement == 'uid'){
                nameOfElement = 'id';
              }
              // If the element has the class "multiselect" add its value(s) as array elements
              if(classOfElement.indexOf('multiselect') > -1){
                if(elementIsChecked){
                  payload[nameOfElement] = typeof(payload[nameOfElement]) == 'object' && payload[nameOfElement] instanceof Array ? payload[nameOfElement] : [];
                  payload[nameOfElement].push(valueOfElement);
                }
              } else {
                payload[nameOfElement] = valueOfElement;
              }

            }
          }
        }


        // If the method is DELETE, the payload should be a queryStringObject instead
        var queryStringObject = method == 'DELETE' ? payload : {};

        // Call the API
        app.client.request(headers,path,method,queryStringObject,payload,function(statusCode,responsePayload){
          // Display an error on the form if needed
          if(statusCode !== 200){

            if(statusCode == 403){
              // log the user out
              app.logUserOut();

            } else {
              utils.showmessage(responsePayload);
            }
          } else {
            // If successful, send to form response processor
            app.formResponseProcessor(formId,payload,responsePayload);
          }

        });
      });
    }
  }
};

// Form response processor
app.formResponseProcessor = function(formId,requestPayload,responsePayload){
  var functionToCall = false;
  // If account creation was successful, try to immediately log the user in
  if(formId == 'accountCreate'){
    // Take the email_id and password, and use it to log the user in
    var newPayload = {
      'email_id' : requestPayload.email_id,
      'password' : requestPayload.password
    };

    app.client.request(undefined,'api/tokens','POST',undefined,newPayload,function(newStatusCode,newResponsePayload){
      // Display an error on the form if needed
      if(newStatusCode !== 200){

        utils.showmessage(responsePayload);

      } else {
        // If successful, set the token and redirect the user
        app.setSessionToken(newResponsePayload.data);
        window.location = '/';
      }
    });
  }
  // If login was successful, set the token in localstorage and redirect the user
  if(formId == 'sessionCreate'){
    app.setSessionToken(responsePayload.data);
    window.location = '/';
  }

  // If account edit was successful
  if(formId == 'accountEdit1'){
    utils.showmessage({success: "Your Changes Have Been Saved"});
  }

  // If password change was successful
  if(formId == 'accountEdit2'){
    utils.showmessage({success: "Your New Password Has Been Saved"});
  }

  // If the user just deleted their account, redirect them to the account-delete page
  if(formId == 'accountEdit3'){
    app.logUserOut(false);
    window.location = '/account/deleted';
  }

  // If the user just created a successful order, redirect them to the orders page
  if(formId == 'orderCreate'){
    window.location = 'orders/all';
  }

};

// Get the session token from localstorage and set it in the app.config object
app.getSessionToken = function(){
  var tokenString = localStorage.getItem('token');
  if(typeof(tokenString) == 'string'){
    try{
      var token = JSON.parse(tokenString);
      app.config.sessionToken = token;
      if(typeof(token) == 'object'){
        app.setLoggedInClass(true);
      } else {
        app.setLoggedInClass(false);
      }
    }catch(e){
      app.config.sessionToken = false;
      app.setLoggedInClass(false);
    }
  }
};

// Set (or remove) the loggedIn class from the body
app.setLoggedInClass = function(add){
  var target = document.querySelector("body");
  if(add){
    target.classList.add('loggedIn');
  } else {
    target.classList.remove('loggedIn');
  }
};

// Set the session token in the app.config object as well as localstorage
app.setSessionToken = function(token){
  app.config.sessionToken = token;
  var tokenString = JSON.stringify(token);
  localStorage.setItem('token',tokenString);
  if(typeof(token) == 'object'){
    app.setLoggedInClass(true);
  } else {
    app.setLoggedInClass(false);
  }
};

// Renew the token
app.renewToken = function(callback){
  var currentToken = typeof(app.config.sessionToken) == 'object' ? app.config.sessionToken : false;
  if(currentToken){
    // Update the token with a new expiration
    var payload = {
      'token' : currentToken.token,
      'extend' : true,
    };
    app.client.request(undefined,'api/tokens','PUT',undefined,payload,function(statusCode,responsePayload){
      // Display an error on the form if needed
      if(statusCode == 200){
        // Get the new token details
        var queryStringObject = {'token' : currentToken.token};
        app.client.request(undefined,'api/tokens','GET',queryStringObject,undefined,function(statusCode,responsePayload){
          // Display an error on the form if needed
          if(statusCode == 200){
            app.setSessionToken(responsePayload);
            callback(false);
          } else {
            app.setSessionToken(false);
            callback(true);
          }
        });
      } else {
        app.setSessionToken(false);
        callback(true);
      }
    });
  } else {
    app.setSessionToken(false);
    callback(true);
  }
};

// Load data on the page
app.loadDataOnPage = function(){
  // Get the current page from the body class
  var bodyClasses = document.querySelector("body").classList;
  var primaryClass = typeof(bodyClasses[0]) == 'string' ? bodyClasses[0] : false;

  // Logic for home page if logged in
  if(primaryClass == 'index' && bodyClasses.contains("loggedIn")){
    app.loadHomePageMenu();
  }

  // Logic for account settings page
  if(primaryClass == 'accountEdit'){
    app.loadAccountEditPage();
  }
  //logic for cart page
  if(primaryClass == "cartView"){
    app.loadCartPage();
  }

  //logic for orders page
  if(primaryClass == "ordersAll"){
    app.loadOrdersPage();
  }

  //load cart icon
  app.loadCartIcon();
};

app.loadCartIcon = function(){
  app.client.request({'x-token' : app.config.sessionToken.token},'api/carts',"GET",undefined,undefined,(statusCode,responsePayload)=>{
    if(statusCode==200){
      var count = 0;
      responsePayload.items.map(item=>{
        count += item.quantity;
      });
      if(count == 0) document.getElementById("cart-superscript").innerHTML = "0";
      else document.getElementById("cart-superscript").innerHTML = count;
    }
    else{
      document.getElementById("cart-superscript").innerHTML = "!";
    }
  });
}

// add item to cart
app.addToCart = function(e){
  // e.preventDefault()/;
  var pizza_id = e.parentNode.parentNode.children[0].innerHTML.trim();
  var size = e.parentNode.parentNode.children[3].children[0].value;
  var quantity = 1;
  var payload = {
    pizza_id: pizza_id,
    quantity : quantity,
    size : size
  };
  app.client.request({'x-token' : app.config.sessionToken.token},'api/carts',"POST",undefined,payload,(statusCode,responsePayload)=>{
    // Display an error on the form if needed
    if(statusCode == 200){
      utils.showmessage({success: "Added to cart"});
      app.loadCartIcon();
    } else if(statusCode == 403){
      app.logUserOut();
    }
    else{
      utils.showmessage(responsePayload);
    }
  });
}

//load the menu on home page
app.loadHomePageMenu = function(){
  var token = typeof(app.config.sessionToken.token) == 'string' ? app.config.sessionToken.token : false;
  if(token){
    // Fetch the user data
    var headersObject = {
      'x-token' : token
    };
    app.client.request(headersObject, 'api/products', 'GET', undefined, undefined, function(statusCode,responsePayload){
      if(statusCode == 200){
        // Put the menu items into a table
        var table = document.createElement('table');
        //create table headers
        var thead = table.createTHead();
        var headrow = thead.insertRow(-1);

        var headth0 = document.createElement('th');
        headth0.innerHTML = "Pizza ID";
        headrow.appendChild(headth0);

        var headth1 = document.createElement('th');
        headth1.innerHTML = "Title";
        headrow.appendChild(headth1);

        var headth2 = document.createElement('th');
        headth2.innerHTML = "Ingredients";
        headrow.appendChild(headth2);

        var headth3 = document.createElement('th');
        headth3.innerHTML = "Size";
        headrow.appendChild(headth3);

        var headth4 = document.createElement('th');
        headth4.innerHTML = "Price";
        headrow.appendChild(headth4);

        var headth5 = document.createElement('th');
        headth5.innerHTML = "";
        headrow.appendChild(headth5);

        //create table body
        var tbdy = document.createElement('tbody');
        responsePayload.pizzas.forEach(function(pizza){
          var tr = tbdy.insertRow(-1);
          var td0 = tr.insertCell(0);//pizza_id
          var td1 = tr.insertCell(1);//title
          var td2 = tr.insertCell(2);//ingredients
          var td3 = tr.insertCell(3);//size
          var td4 = tr.insertCell(4);//price
          var td5 = tr.insertCell(5);//Add to cart

          td0.innerHTML = pizza.pizza_id;
          td1.innerHTML = pizza.title;
          td2.innerHTML = pizza.ingredients;
          var sizes_html =  '<select>';
          Object.keys(pizza.prices).forEach((key)=>{
            sizes_html+=`
            <option price="${pizza.prices[key]}" value="${key}">
              ${key}
            </option>`;
          });
          sizes_html+= "</select>";
          td3.innerHTML = sizes_html;
          td4.innerHTML = "INR "+pizza.prices[Object.keys(pizza.prices)[0]];
          td5.innerHTML = '<buttton class="cart-add" onclick="app.addToCart(this)">Add to Cart</button>'
        });
        table.appendChild(tbdy);
        document.getElementById("pizzaMenu").appendChild(table);

        // bind price to function of size
        app.bindSizeListtoPriceChange();
      } else {
        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
        app.logUserOut();
      }
    });
  } else {
    app.logUserOut();
  }
}

// Load the account edit page specifically
app.loadAccountEditPage = function(){
  // Get the email_id from the current token, or log the user out if none is there
  var email_id = typeof(app.config.sessionToken.email_id) == 'string' ? app.config.sessionToken.email_id : false;
  var token = typeof(app.config.sessionToken.token) == 'string' ? app.config.sessionToken.token : false;
  if(email_id && token){
    // Fetch the user data
    var queryStringObject = {
      'email_id' : email_id
    };
    var headersObject = {
      'x-token' : token
    }
    app.client.request(headersObject,'api/users','GET',queryStringObject,undefined,function(statusCode,responsePayload){
      if(statusCode == 200){
        // Put the data into the forms as values where needed
        document.querySelector("#accountEdit1 .firstNameInput").value = responsePayload.first_name;
        document.querySelector("#accountEdit1 .lastNameInput").value = responsePayload.last_name;
        document.querySelector("#accountEdit1 .displayEmailInput").value = responsePayload.email_id;
        document.querySelector("#accountEdit1 .streetAddressInput").value = responsePayload.street_address;

        // Put the hidden email_id field into both forms
        var hiddenEmailInputs = document.querySelectorAll("input.hiddenEmailInput");
        for(var i = 0; i < hiddenEmailInputs.length; i++){
            hiddenEmailInputs[i].value = responsePayload.email_id;
        }

      } else {
        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
        app.logUserOut();
      }
    });
  } else {
    app.logUserOut();
  }
};

app.loadCartPage = function(){
  var token = typeof(app.config.sessionToken.token) == 'string' ? app.config.sessionToken.token : false;
  if(token){
    // Fetch the user data
    var headersObject = {
      'x-token' : token
    };
    app.client.request(headersObject, 'api/carts', 'GET', undefined, undefined, function(statusCode,cartResponse){
      if(statusCode == 200){
        app.client.request(headersObject, 'api/products', 'GET', undefined, undefined, function(statusCode,pizzaResponse){
          if(statusCode == 200){
            //create table body
            var tbdy = document.getElementById('cartbody');
            tbdy.innerHTML = "";
            cartResponse.items.map(function(item, index){
              var tr = tbdy.insertRow(-1);
              var td0 = tr.insertCell(0);//pizza title
              var td1 = tr.insertCell(1);//size
              var td2 = tr.insertCell(2);//price
              var td3 = tr.insertCell(3);//quantity
              var td4 = tr.insertCell(4);//total
              
              //get title and price from products api response
              var item_title = pizzaResponse.pizzas.filter(x=>{
                return (x.pizza_id == item.pizza_id);
              })[0].title; 
              var item_price = pizzaResponse.pizzas.filter(x=>{
                return (x.pizza_id == item.pizza_id);
              })[0].prices[item.size];
              
              td0.innerHTML = item_title
              td1.innerHTML = item.size;
              td2.innerHTML = "INR "+item_price;
              td3.innerHTML = `
                <button class="qty qty-minus" onclick="app.updateCartItems(${index},${item.quantity-1})">-</button>
                  <input type="numeric" value="${item.quantity}" />
                <button class="qty qty-plus" onclick="app.updateCartItems(${index},${item.quantity+1})">+</button>
              `;;
              td4.innerHTML = "INR "+item_price*item.quantity;
            });
            document.getElementById("cart-total").innerHTML = "INR "+cartResponse.total_price;
            if(cartResponse.items.length == 0){
              document.getElementById("submit-cart").disabled = true;
            }
            else{
              document.getElementById("submit-cart").disabled = false;
              // bind modal functionalities
              //get order modal
              var modal = document.getElementById('order-modal');
              //get submit cart button
              var btn = document.getElementById("submit-cart");
              //get close button that closes
              var span = document.getElementsByClassName("modal-close")[0];

              //open modal on button click
              btn.onclick = ()=>{
                modal.style.display = "block";
              };
              //close modal on close
              span.onclick = function() {
                modal.style.display = "none";
              }
              //close modal if user clicks outside modal
              window.onclick = function(event) {
                if (event.target == modal) {
                  modal.style.display = "none";
                }
              } 
            }
          }
          else{
            // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
            app.logUserOut();    
          }
        });
      } else {
        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
        app.logUserOut();
      }
    });
  } else {
    app.logUserOut();
  }
}

app.loadOrdersPage = function(){
  var email_id = typeof(app.config.sessionToken.email_id) == 'string' ? app.config.sessionToken.email_id : false;
  var token = typeof(app.config.sessionToken.token) == 'string' ? app.config.sessionToken.token : false;
  if(token && email_id){
    // Fetch the user data
    var headersObject = {
      'x-token' : token
    };
    var queryStringObject = {
      email_id : email_id
    }
    app.client.request(headersObject, 'api/users', 'GET', queryStringObject, undefined, (statusCode,userResponse)=>{
      if(statusCode == 403){
        app.logUserOut();
        return;
      }
      if(statusCode != 200){
        utils.showmessage(userResponse);
        return;
      }
      //get the orders from userResponse
      var orders = userResponse.orders.reverse();
      var accordions = document.getElementById("accordions");
      accordions.innerHTML = "";
      orders.map(order=>{
        //create accordion for this order. on click expand
        accordions.innerHTML += `
          <button class="accordion" >OrderId: ${order}</button>
          <div class="accordion-panel">
          </div>
        `;
      });
      //add onlick buttons for each accordion
      var accordion_list = document.getElementsByClassName("accordion");
      for(var i = 0;i<accordion_list.length; i++){
        accordion_list[i].addEventListener("click", function(){
          //toggle active class
          this.classList.toggle("active");
          var accordion_panel = this.nextElementSibling;
          if (accordion_panel.style.display === "block") {
            //if visible hide it
            accordion_panel.style.display = "none";
          } else {
            //fetch data for that particular order
            var order_id = this.innerHTML.replace("OrderId: ","").trim();
            app.client.request(headersObject, 'api/orders', 'GET', {order_id: order_id},undefined,(statusCode, orderResponse)=>{
              if(statusCode == 200){
                //create html for displaying the order details
                var html_string = `
                  <p>
                    Order Id: ${orderResponse.order_id}
                  </p>
                  <br>
                  <p>
                    Order Created: ${(new Date(orderResponse.order_created*1000)).toDateString()}, ${(new Date(orderResponse.order_created*1000)).toTimeString()}
                  </p>
                  <br>
                  <p>
                    Delivery Address: ${orderResponse.delivery_address}
                  </p>
                  <br>
                  <p>
                    Payment ID: ${orderResponse.payment_id}
                  </p>
                  <br>
                  <p>
                    Total Price: INR ${orderResponse.total_price}
                  </p>
                  <br>
                  <p>
                  Order Details: 
                  <table>
                    <thead>
                      <tr>
                        <th>Pizza ID</th>
                        <th>Size</th>
                        <th>Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                `;
                orderResponse.items.map(item=>{
                  html_string+= `
                      <tr>
                        <td>${item.pizza_id}</td>
                        <td>${item.size}</td>
                        <td>${item.quantity}</td>
                      </tr>
                  `;
                });
                html_string+= `
                    </tbody>
                  </table>
                  </p>
                `;
                if(orderResponse.deleted){
                  html_string+= `
                  <br>
                  <p>
                    This order was cancelled.
                  </p>
                  `;
                }
                else{
                  html_string+= `
                  <p>
                    Cancel this order?
                    <br>
                    <small>Order can only be cancelled within 15 minutes of being placed</small>
                    <br>
                    <button onclick="app.deleteOrder('${orderResponse.order_id}')" >Cancel</button>
                  </p>
                  `;
                }
                accordion_panel.innerHTML = html_string;
              }
              else if(statusCode == 403){
                //log user out
                app.logUserOut();
              }
              else{
                //show error
                utils.showmessage(orderResponse);
              }
              accordion_panel.style.display = "block";
            });
          }
        });
      }
    });
  }
  else{
    //logout user
    app.logUserOut();
  }
}

app.updateCartItems = function(cart_id, quantity){
  var token = typeof(app.config.sessionToken.token) == 'string' ? app.config.sessionToken.token : false;
  var headersObject = {'x-token' : token};
  var method = quantity > 0 ? 'PUT' : 'DELETE';
  var payload = {cart_id : cart_id};
  if(quantity>0) payload.quantity = quantity;
  app.client.request(headersObject, 'api/carts', method, undefined, payload,(statusCode, responsePayload)=>{
    if(statusCode == 200){
      app.loadCartPage();
      app.loadCartIcon();
    }
    else if(statusCode == 403){
      //log user out
      app.logUserOut();
    }
    else{
      utils.showmessage(responsePayload);
    }
  });
}

app.deleteOrder = function(order_id){
  var token = typeof(app.config.sessionToken.token) == 'string' ? app.config.sessionToken.token : false;
  var headersObject = {'x-token' : token};
  var method = 'DELETE';
  var payload = {order_id : order_id, delete_order: true};
  app.client.request(headersObject, 'api/orders', method, undefined, payload,(statusCode, responsePayload)=>{
    if(statusCode == 200){
      app.loadOrdersPage();
      utils.showmessage({success: "Your order was successfully cancelled"});
    }
    else if(statusCode == 403){
      //log user out
      app.logUserOut();
    }
    else{
      utils.showmessage(responsePayload);
    }
  });
}

// Loop to renew token often
app.tokenRenewalLoop = function(){
  setInterval(function(){
    app.renewToken(function(err){
      if(!err){
        console.log("Token renewed successfully @ "+Date.now());
      }
    });
  },1000 * 60);
};

// Init (bootstrapping)
app.init = function(){

  // Bind all form submissions
  app.bindForms();

  // Bind logout logout button
  app.bindLogoutButton();
  // Get the token from localstorage
  app.getSessionToken();
  // Renew token
  app.tokenRenewalLoop();
  // Load data on page
  app.loadDataOnPage();

};

// Call the init processes after the window loads
window.onload = function(){
  app.init();
};
