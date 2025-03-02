"use strict";
//JS alternative

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stripe_1 = __importDefault(require("stripe"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path")); // Import the path module
// Environment variables configuration
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
/*
 * STEPS REQUIRED TO USE THIS CODE:
 * 1. Create a Stripe account (https://stripe.com).
 * 2. Obtain the API keys:
 *    - Go to the Stripe dashboard.
 *    - In the sidebar, select "Developers" > "API keys".
 *    - Copy your "Publishable Key" and "Secret Key".
 * 3. Create a `.env` file in the root of the project and add the keys:
 *      STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx
 *      STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxx
 * 4. Make sure the `.env` file is in your `.gitignore` to avoid exposing your keys.
 * 5. Run the server, and you're ready to go!
 */
// Initialize Stripe with the secret key
const stripe = new stripe_1.default(process.env.YOUR_STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia', // Stripe API version
});
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Serve static files from the "public" folder
app.use(express_1.default.static(path_1.default.join(__dirname, '../')));
// API route
app.get('/api', (req, res) => {
    res.send('Stripe Payment Gateway API is running!');
});
// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
