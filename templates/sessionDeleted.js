module.exports = (data) => {
    return `
        <h1>Logged Out</h1>
        <h2>You have been logged out of your account.</h2>
        
        <div class="ctaWrapper">
        <a class="cta blue" href="session/create">Login Again</a>
        </div>
    `;
}