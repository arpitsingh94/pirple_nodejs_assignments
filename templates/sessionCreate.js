module.exports = (data) => {
    return `
        <h1>Login To Your Account</h1>
        <h2>Enter your email ID and password</h2>
        
        <div class="formWrapper">
        <form id="sessionCreate" action="/api/tokens" method="POST">
            <div class="formError"></div>
            <div class="inputWrapper">
            <div class="inputLabel">Email ID</div>
            <input type="text" name="email_id" placeholder="xxxxxx@yyy.com" />
            </div>
            <div class="inputWrapper">
            <div class="inputLabel">Your Password</div>
            <input type="password" name="password" placeholder="*********" />
            </div>
            <div class="inputWrapper ctaWrapper">
            <button type="submit" class="cta blue">Login</button>
            </div>
        </form>
        </div>
    `;
}