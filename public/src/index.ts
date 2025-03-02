import express, { Request, Response } from 'express'; // Import Request and Response types
import Stripe from 'stripe';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path'; // Import the path module
import { body, validationResult } from 'express-validator'; // Import express-validator

// Load environment variables from .env file
dotenv.config();

/*
 * STEPS REQUIRED TO USE THIS CODE:
 * 1. Create a Stripe account (https://stripe.com).
 * 2. Obtain the API keys:
 *    - Go to the Stripe dashboard.
 *    - In the sidebar, select "Developers" > "API keys".
 *    - Copy your "Publishable Key" and "Secret Key".
 * 3. Create a `.env` file in the root of the project and add the keys:
 *      STRIPE_PUBLIC_KEY=pk_test_YOUR_PUBLISHABLE_KEY
 *      STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
 * 4. Make sure the `.env` file is in your `.gitignore` to avoid exposing your keys.
 * 5. Run the server, and you're ready to go!
 */

// Check if required environment variables are present
if (!process.env.YOUR_STRIPE_SECRET_KEY || !process.env.YOUR_STRIPE_PUBLIC_KEY) {
    console.error('Missing Stripe API keys. Please check your .env file.');
    process.exit(1); // Exit the process if keys are missing
}

const app = express();
const port = process.env.PORT || 3000;

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.YOUR_STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia', // Use the latest Stripe API version
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, '../public')));

// API route to create a Payment Intent
app.post('/create-payment-intent', [
    body('paymentMethodId').isString().notEmpty().withMessage('Payment method ID is required'),
    body('amount').isNumeric().isInt({ gt: 0 }).withMessage('Amount must be a positive integer'),
    body('currency').isString().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
], async (req: Request, res: Response): Promise<void> => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ error: errors.array() });
        return;
    }

    const { paymentMethodId, amount, currency } = req.body;

    try {
        // Create a Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount, // Amount in cents
            currency, // Currency code (e.g., 'usd')
            payment_method: paymentMethodId,
            confirm: true, // Automatically confirm the payment
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never',
            },
        });

        // Send success response
        res.status(200).json({ success: true, paymentIntent });
    } catch (error) {
        console.error('Error creating Payment Intent:', error);

        // Handle Stripe errors
        if (error instanceof Stripe.errors.StripeError) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'An unknown error occurred.' });
        }
    }
});

// API route to get the Stripe public key
app.get('/api/stripe-key', (req: Request, res: Response): void => {
    res.status(200).json({ publicKey: process.env.YOUR_STRIPE_PUBLIC_KEY });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Info Note: 
/*
 * PAYMENT METHOD CONFIGURATION FOR REAL ACCOUNTS
 *
 * To ensure that payments processed through Stripe are reflected in a real bank account, follow these steps:
 *
 * 1. **Create a Stripe account**:
 *    - Visit [Stripe](https://stripe.com) and sign up for an account.
 *
 * 2. **Verify your account**:
 *    - Complete the account verification process by providing the required information, such as your name, address, and bank account details.
 *
 * 3. Create a `.env` file in the root of the project and add the keys:
 *      STRIPE_PUBLIC_KEY=pk_test_YOUR_PUBLISHABLE_KEY
 *      STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
 *
 * 4. **Obtain your API keys**:
 *    - In the Stripe dashboard, go to "Developers" > "API keys."
 *    - Copy your "Secret Key" and "Publishable Key" to use in your application.
 *
 * 5. **Configure the production environment**:
 *    - Ensure that your application is set up to use the production keys instead of the test keys.
 *    - Replace the keys in your `.env` file:
 *      STRIPE_PUBLISHABLE_KEY= Your Publishable Key
 *      STRIPE_SECRET_KEY= Your Secret Key
 *
 * 6. **Test the payment flow**:
 *    - Perform tests using test cards provided by Stripe to ensure everything works correctly before accepting real payments.
 *
  * 7. **Comply with regulations**:
 *    - Make sure to comply with local regulations and Stripe's policies regarding payment processing.
 *
 * Once you have completed these steps, payments made through your application will be reflected in your personal bank account according to Stripe's payout schedule.
 */