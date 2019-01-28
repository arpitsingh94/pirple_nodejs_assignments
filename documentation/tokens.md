**Create Token**
----
    Creates a single token from JSON data

* **URL**

    /tokens

* **Method:**

    `POST`

* **Headers:**

    **Required:**
    
    `Content-Type: application/json`
    
* **JSON data:**

    **Required:**

    email_id : String\
    password: String

* **Success Response:**

    * **Code:** 200 <br />
        **Content:** `{success: "token created successfully", data: {token, email_id, expires}}`
 
* **Error Response:**

    * **Code:** 400 <br />
        **Content:** `{error: "missing or invalid required fields"}`
        
    OR

    * **Code:** 400 <br />
        **Content:** `{error: "password does not match"}`

    OR
    
    * **Code:** 500 <br />
        **Content:** `{ error : "some internal error happened" }`


**Fetch Token**
----
    fetches JSON data about token

* **URL**

    /tokens

* **Method:**

    `GET`
    
* **Query params**

    **Required:**

    token

* **Success Response:**

    * **Code:** 200 <br />
        **Content:** `{token, email_id, expires}`
 
* **Error Response:**

    * **Code:** 400 <br />
        **Content:** `{error: "missing or invalid required fields"}`
        
    OR
    
    * **Code:** 500 <br />
        **Content:** `{ error : "some internal error happened" }`


**Update Token**
----
    Extends the expiry of the token by 1 hour from request time

* **URL**

    /tokens

* **Method:**

    `PUT`
    
* **JSON data:**

    **Required:**

    token : String\
    extend: Boolean (should be true)

    **Optional:**

    None

* **Success Response:**

    * **Code:** 200 <br />
        **Content:** `{success: "data updated successfully", __latest_data: {token, email_id, expires}}`
 
* **Error Response:**

    * **Code:** 400 <br />
        **Content:** `{error: "missing or invalid required fields. extend must be set to true"}`
        
    OR
    
    * **Code:** 500 <br />
        **Content:** `{ error : "some internal error happened" }`


**Delete Token**
----
    Deletes a token

* **URL**

    /tokens

* **Method:**

    `DELETE`
    
* **Query params**

    **Required:**

    token

* **Success Response:**

    * **Code:** 200 <br />
        **Content:** `{success: "successfully deleted token"}`
 
* **Error Response:**

    * **Code:** 400 <br />
        **Content:** `{error: "missing or invalid required fields"}`

    OR
    
    * **Code:** 500 <br />
        **Content:** `{ error : "some internal error happened" }`
