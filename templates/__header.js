module.exports = (data) => {
    return `
<html>
    <head>
    
        <!-- General Settings -->
        <meta charset="utf-8">
        <meta http-equiv="content-language" content="en-us">
        <base href="${data.global.baseUrl}" />
        
        <!-- Meta Tags -->
        <title>${data.head.title} | ${data.global.appName}</title>
        <meta name="description" content="${data.head.description}">
        
        <!-- Static Assets -->
        <link type="image/x-icon" rel="icon" href="public/favicon.ico">
        <script type="text/javascript" charset="utf-8" src="public/pizza.js"></script>
        <link rel="stylesheet" type="text/css" href="public/pizza.css" />
  
    </head>
    <body class="${data.body.class}">
        <!-- Page Wrapper -->
        <div class="wrapper">
            <!-- Header -->
            <div class="header">
                <!-- Logo -->
                <a class="logo" href="/">
                    <img src="public/logo.png" alt="Logo" />
                </a>
                
                <!-- Navigation -->
                <ul class="menu">
                    <li>
                        <a href="/">Home</a>
                    </li>
                    <li class="loggedOut">
                        <a href="/account/create">Signup</a>
                    </li>
                    <li class="loggedOut">
                        <a href="/session/create">Login</a>
                    </li>
                    <li class="loggedIn">
                        <a href="/orders/all">Orders</a>
                    </li>
                    <li class="loggedIn">
                        <div id="cart-superscript" class="cart-superscript"></div>
                        <a href="/cart/view">
                            <img src="public/shopping-cart-512.png" style="height:25px;" alt="View Cart">
                        </a>
                    </li>
                    <li class="loggedIn">
                        <a href="/account/edit">Account Settings</a>
                    </li>
                    <li class="loggedIn">
                        <a href="#" id="logoutButton">Logout</a>
                    </li>
                </ul>
                
                <div class="clear"></div>
            </div>

            <!-- Toast div -->
            <div id="toast">
                <div class="message"></div>
            </div>

            <!-- Page-Specific Content -->
            <div class="content">
    `;
}