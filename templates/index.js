module.exports = (data) => {
    return `
        <h1>Pizza Delivery Service</h1>
        <h2>Get your favourite Pizzas now</h2>

        <div class="blurb">Browse through our pizza offerings and order now. Make your payment here itself and we will  notify you immediately.</div>

        <div class="ctaWrapper loggedOut">
        <a class="cta green" href="account/create">Get Started</a>
        <a class="cta blue" href="session/create">Login</a>
        </div>

        <div class="pizzaMenu loggedIn" id="pizzaMenu">
        </div>
    `;
}