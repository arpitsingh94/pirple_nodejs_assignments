**Create Order**
----
    Creates an order from the cart items of the logged-in user. Notifies the user of the payment success/failure via email

* **URL**

    /orders

* **Method:**

    `POST`

* **Headers:**

    **Required:**
    
    `Content-Type: application/json`\
    `x-token: <user token>`
    
* **JSON data:**

    **Required:**

    delivery_address: String\
    payment_token: String

* **Success Response:**

    * **Code:** 200 <br />
        **Content:** `{success: "order placed successfully. you should receive a notification by email soon", __order_data: {email_id, items: [{pizza_id, quantity, size}], total_price, delivery_address, payment_id, order_created, order_id } }`
 
* **Error Response:**

    * **Code:** 400 <br />
        **Content:** `{error: "missing or invalid required fields"}`
        
    OR

    * **Code:** 403 <br />
        **Content:** `{error: "you are not authorized for this request"}`

    OR
    
    * **Code:** 500 <br />
        **Content:** `{ error : "some internal error happened" }`


**Fetch Order**
----
    fetches JSON data about a single order

* **URL**

    /orders

* **Method:**

    `GET`

* **Headers:**

    **Required:**
    
    `x-token: <user token>`
    
* **Query params**

    **Required:**

    order_id

* **Success Response:**

    * **Code:** 200 <br />
        **Content:** `{email_id, items: [{pizza_id, quantity, size}], total_price, delivery_address, payment_id, order_created, order_id, deleted }`
 
* **Error Response:**

    * **Code:** 400 <br />
        **Content:** `{error: "missing or invalid required fields"}`

    OR
        
    * **Code:** 403 <br />
        **Content:** `{error: "you are not authorised for this request"}`
        
    OR
    
    * **Code:** 500 <br />
        **Content:** `{ error : "some internal error happened" }`

**Cancel order**
----
    Cancels an order and initiates a refund

* **URL**

    /users

* **Method:**

    `DELETE`

* **Headers:**

    **Required:**
    
    `Content-Type: application/json`\
    `x-token: <user token>`
    
* **JSON data:**

    **Required:**

    order_id: String\
    delete_order: Boolean (must be true)

* **Success Response:**

    * **Code:** 200 <br />
        **Content:** `{success:"your order is canceled. amount will be refunded to your account/card.", __latest_order_data: {email_id, items: [{pizza_id, quantity, size}], total_price, delivery_address, payment_id, order_created, order_id, deleted }}`
 
* **Error Response:**

    * **Code:** 400 <br />
        **Content:** `{error: "missing or invalid required fields"}`

    OR

    * **Code:** 400 <br />
        **Content:** `{error: "you cannot cancel your order now. We apologize for the inconvenience"}`

    OR
        
    * **Code:** 403 <br />
        **Content:** `{error: "you are not authorised for this request"}`
        
    OR
    
    * **Code:** 500 <br />
        **Content:** `{ error : "some internal error happened" }`
