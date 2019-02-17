module.exports = (data) => {
    return `
        <h1>Your Cart</h1>
        
        
        <div class="cart loggedIn" id="cart">
            <table>
                <thead>
                    <tr>
                        <th>Pizza</th>
                        <th>Size</th>
                        <th>Price</th>
                        <th>QTY</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody id="cartbody">
                </tbody>
            </table>
            <hr>
            <div id="cart-total" class="cart-total">
                INR 0
            </div>
            <button id="submit-cart" class="create-order">Create Order</button>
        </div>

        <div id="order-modal" class="modal">
            <!-- Modal content -->
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <div class="formWrapper">
                    <form id="orderCreate" class="tokenRequest" action="/api/orders" method="POST">
                        <div class="formError"></div>
                        <div class="inputWrapper">
                            <div class="inputLabel">Delivery Address</div>
                            <input type="text" name="delivery_address" placeholder="Street X, Area Y" />
                        </div>
                        <div class="inputWrapper">
                            <div class="inputLabel">Payment Method</div>
                            <select name="payment_token">
                                <option value="tok_visa" default>Visa</option>
                                <option value="tok_visa_debit">Visa (debit)</option>
                                <option value="tok_mastercard">Mastercard</option>
                                <option value="tok_mastercard_debit">Mastercard (debit)</option>
                            </select>
                        </div>
                        <div class="inputWrapper ctaWrapper">
                            <button type="submit" class="cta green">Place Order</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `
}