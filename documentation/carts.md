**Adds item to cart**
----
    Adds an item to cart of logged-in user

* **URL**

    /carts

* **Method:**

    `POST`

* **Headers:**

    **Required:**
    
    `Content-Type: application/json`\
    `x-token: <user token>`
    
* **JSON data:**

    **Required:**

    pizza_id : String\
    size : String\
    quantity : Number

* **Success Response:**

    * **Code:** 200 <br />
        **Content:** `{success: "item added to cart successfully"}`
 
* **Error Response:**

    * **Code:** 400 <br />
        **Content:** `{error: "missing or invalid required fields"}`
        
    OR

    * **Code:** 403 <br />
    **Content:** `{error: "you are not authorised for this request"}`
        
    OR
    
    * **Code:** 500 <br />
        **Content:** `{ error : "some internal error happened" }`


**Fetch Cart**
----
    fetches JSON data about the cart of logged-in user

* **URL**

    /carts

* **Method:**

    `GET`

* **Headers:**

    **Required:**
    
    `x-token: <user token>`

* **Success Response:**

    * **Code:** 200 <br />
        **Content:** `{email_id, items: [{pizza_id, size, quantity}], total_price}`
 
* **Error Response:**

    * **Code:** 400 <br />
        **Content:** `{error: "missing or invalid required fields"}`

    OR
        
    * **Code:** 403 <br />
        **Content:** `{error: "you are not authorised for this request"}`
        
    OR
    
    * **Code:** 500 <br />
        **Content:** `{ error : "some internal error happened" }`


**Update Cart item**
----
    Updates quantity of a single cart item

* **URL**

    /carts

* **Method:**

    `PUT`

* **Headers:**

    **Required:**
    
    `Content-Type: application/json`\
    `x-token: <user token>`
    
* **JSON data:**

    **Required:**

    cart_id : Number\
    quantity: Number

    **Optional:**

    None

* **Success Response:**

    * **Code:** 200 <br />
        **Content:** `{success: "cart updated successfully", __latest_data: {email_id, items: [{pizza_id, size, quantity}], total_price}}`
 
* **Error Response:**

    * **Code:** 400 <br />
        **Content:** `{error: "missing or invalid required fields."}`

    OR

    * **Code:** 400 <br />
        **Content:** `{error : "invalid cart_id."}`

    OR
        
    * **Code:** 403 <br />
        **Content:** `{error: "you are not authorised for this request"}`
        
    OR
    
    * **Code:** 500 <br />
        **Content:** `{ error : "some internal error happened" }`


**Delete Cart item**
----
    Deletes a single cart item from the user's cart

* **URL**

    /carts

* **Method:**

    `DELETE`

* **Headers:**

    **Required:**
    
    `x-token: <user token>`
    
* **JSON data:**

    **Required:**

    cart_id : Number

* **Success Response:**

    * **Code:** 200 <br />
        **Content:** `{success: "item removed from cart successfully", __latest_data: {email_id, items: [{pizza_id, size, quantity}], total_price}}`
 
* **Error Response:**

    * **Code:** 400 <br />
        **Content:** `{error: "missing or invalid required fields"}`

    OR

    * **Code:** 400 <br />
        **Content:** `{error : "invalid cart_id."}`

    OR
        
    * **Code:** 403 <br />
        **Content:** `{error: "you are not authorised for this request"}`
        
    OR
    
    * **Code:** 500 <br />
        **Content:** `{ error : "some internal error happened" }`
