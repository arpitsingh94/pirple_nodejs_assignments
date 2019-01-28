**Create User**
----
    Creates a single user from JSON data

* **URL**

    /users

* **Method:**

    `POST`

* **Headers:**

    **Required:**
    
    `Content-Type: application/json`
    
* **JSON data:**

    **Required:**

    first_name : String\
    last_name : String\
    email_id : String\
    street_address: String\
    password: String

* **Success Response:**

    * **Code:** 200 <br />
        **Content:** `{success: "user created successfully"}`
 
* **Error Response:**

    * **Code:** 400 <br />
        **Content:** `{error: "missing or invalid required fields"}`
        
    OR
    
    * **Code:** 500 <br />
        **Content:** `{ error : "some internal error happened" }`


**Fetch User**
----
    fetches JSON data about a single user

* **URL**

    /users

* **Method:**

    `GET`

* **Headers:**

    **Required:**
    
    `x-token: <user token>`
    
* **Query params**

    **Required:**

    email_id

* **Success Response:**

    * **Code:** 200 <br />
        **Content:** `{first_name, last_name, email_id, street_address, orders}`
 
* **Error Response:**

    * **Code:** 400 <br />
        **Content:** `{error: "missing or invalid required fields"}`

    OR
        
    * **Code:** 403 <br />
        **Content:** `{error: "you are not authorised for this request"}`
        
    OR
    
    * **Code:** 500 <br />
        **Content:** `{ error : "some internal error happened" }`


**Update User**
----
    Update information about a single user

* **URL**

    /users

* **Method:**

    `PUT`

* **Headers:**

    **Required:**
    
    `Content-Type: application/json`\
    `x-token: <user token>`
    
* **JSON data:**

    **Required:**

    email_id : String

    **Optional:**

    first_name : String\
    last_name : String\
    street_address: String\
    password: String

* **Success Response:**

    * **Code:** 200 <br />
        **Content:** `{success: "data updated successfully", __latest_data: {first_name, last_name, email_id, street_address, orders}}`
 
* **Error Response:**

    * **Code:** 400 <br />
        **Content:** `{error: "missing or invalid required fields. at least one update field should be sent"}`

    OR
        
    * **Code:** 403 <br />
        **Content:** `{error: "you are not authorised for this request"}`
        
    OR
    
    * **Code:** 500 <br />
        **Content:** `{ error : "some internal error happened" }`


**Delete User**
----
    Deletes a single user and related info

* **URL**

    /users

* **Method:**

    `DELETE`

* **Headers:**

    **Required:**
    
    `x-token: <user token>`
    
* **Query params**

    **Required:**

    email_id

* **Success Response:**

    * **Code:** 200 <br />
        **Content:** `{success: "successfully deleted user"}`
 
* **Error Response:**

    * **Code:** 400 <br />
        **Content:** `{error: "missing or invalid required fields"}`

    OR
        
    * **Code:** 403 <br />
        **Content:** `{error: "you are not authorised for this request"}`
        
    OR
    
    * **Code:** 500 <br />
        **Content:** `{ error : "some internal error happened" }`
