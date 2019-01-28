# Pizza Delivery Service

This project is an API service for a pizza-delivery company. All APIs are RESTful. 

## Installation

Just clone this project and start **app.js** to begin using the API.

```bash
node app.js
```

## Features

The API server allows the following:

1. CRUD operations for users. An instance of a user stores their name, address and email ID.

2. CRUD operations for tokens. Token generation is equivalent to a user logging in and token is required for most API requests.

3. Fetching an item list of pizzas and sizes that a user can add to their cart

4. CRUD operations for the cart of a user.

5. Creating orders. An order is created for the existing items in cart and clears the existing cart on creation. Logged-in users can create an order by sending a payment-token that can be validated via Stripe APIs. A user can fetch their orders and delete an existing order to get a refund provided it is within fifteen minutes of creation.

6. The server is integrated with mailgun.com to email the user on success/failure of order creation as well as payment refunds.

## Documentation

The API specs are provided for each of the resources that can be requested

[users](documentation/users.md)

[tokens](documentation/tokens.md)

[products](documentation/products.md)

[carts](documentation/carts.md)

[orders](documentation/orders.md)


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
