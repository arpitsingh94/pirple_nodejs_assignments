module.exports = (data)=>{
    return `
        <h1>Create Your Account</h1>
        <h2>Signup is easy and only takes a few seconds.</h2>

        <div class="formWrapper">
            <form id="accountCreate" action="/api/users" method="POST">
                <div class="formError"></div>
                <div class="inputWrapper">
                    <div class="inputLabel">First Name</div>
                    <input type="text" name="first_name" placeholder="John" />
                </div>
                <div class="inputWrapper">
                    <div class="inputLabel">Last Name</div>
                    <input type="text" name="last_name" placeholder="Smith" />
                </div>
                <div class="inputWrapper">
                    <div class="inputLabel">Email ID</div>
                    <input type="text" name="email_id" placeholder="xxxxxx@yyy.com" />
                </div>
                <div class="inputWrapper">
                    <div class="inputLabel">Street Address</div>
                    <input type="text" name="street_address" placeholder="Street X, Area Y" />
                </div>
                <div class="inputWrapper">
                    <div class="inputLabel">Choose a Password</div>
                    <input type="password" name="password" placeholder="Make it a good one!" />
                </div>
                <div class="inputWrapper ctaWrapper">
                    <button type="submit" class="cta green">Get Started</button>
                </div>
            </form>
        </div>
    `;
}