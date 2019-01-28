**Fetch Products**
----
    fetches JSON data about all existing menu items

* **URL**

    /products

* **Method:**

    `GET`

* **Headers:**

    **Required:**
    
    `x-token: <user token>`

* **Success Response:**

    * **Code:** 200 <br />
        **Content:** `{pizzas : [{pizza_id, title, ingredients, prices: {size:price} }], __note: "all prices are in INR"`
 
* **Error Response:**

    * **Code:** 400 <br />
        **Content:** `{error: "invalid token sent"}`

    OR
        
    * **Code:** 403 <br />
        **Content:** `{error: "you are not authorised for this request"}`
        
    OR
    
    * **Code:** 500 <br />
        **Content:** `{ error : "some internal error happened" }`