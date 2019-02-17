module.exports = (data) => {
    return `
        <h1>Account Settings</h1>

        <hr />

        <h2>Edit your account details</h2>

        <div class="formWrapper">
        <form id="accountEdit1" class="tokenRequest" action="/api/users" method="PUT">
            <input type="hidden" name="_method" value="PUT"/>
            <div class="formError"></div>
            <div class="formSuccess">Your Changes Have Been Saved</div>
            <input class="hiddenEmailInput"  type="hidden" name="email_id" />
            <div class="inputWrapper">
                <div class="inputLabel">Email ID</div>
                <input class="disabled displayEmailInput" type="text" name="displayEmail" disabled />
            </div>
            <div class="inputWrapper">
                <div class="inputLabel">First Name</div>
                <input class="firstNameInput" type="text" name="first_name" placeholder="John" />
            </div>
            <div class="inputWrapper">
                <div class="inputLabel">Last Name</div>
                <input class="lastNameInput" type="text" name="last_name" placeholder="Smith" />
            </div>
            <div class="inputWrapper">
                <div class="inputLabel">Street Address</div>
                <input class="streetAddressInput" type="text" name="street_address" placeholder="Street X, Area Y" />
            </div>
            <div class="inputWrapper ctaWrapper">
            <button type="submit" class="cta green">Save Changes</button>
            </div>
        </form>
        </div>

        <hr />
        <h2>Change Your Password</h2>
        <div class="formWrapper">
        <form id="accountEdit2" class="tokenRequest" action="/api/users" method="PUT">
            <input type="hidden" name="_method" value="PUT"/>
            <div class="formError"></div>
            <div class="formSuccess">Your New Password Has Been Saved</div>
            <input class="hiddenEmailInput" type="hidden" name="email_id" />
            <div class="inputWrapper">
                <div class="inputLabel">Choose a New Password</div>
                <input type="password" name="password" placeholder="Make it a good one!" />
            </div>
            <div class="inputWrapper ctaWrapper">
            <button type="submit" class="cta green">Save Password</button>
            </div>
        </form>
        </div>


        <hr />
        <h2>Delete Your Account</h2>
        <div class="formWrapper">
        <form id="accountEdit3" class="tokenRequest" action="/api/users" method="DELETE">
            <input type="hidden" name="_method" value="DELETE"/>
            <div class="formError"></div>
            <div class="warning">Warning: This action cannot be undone. Dont click this button on accident!</div>
            <input class="hiddenEmailInput" type="hidden" name="email_id" />
            <div class="inputWrapper ctaWrapper">
            <button type="submit" class="cta red">Delete Account</button>
            </div>
        </form>
        </div>
    `;
}