/**
 * Payment Server API Endpoints
 * Handles Stripe, PayPal, Crypto, and Regional Payment Processing
 */

const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const config = {
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    },
    paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
        mode: process.env.PAYPAL_MODE || 'sandbox' // 'live' for production
    },
    crypto: {
        coingate: {
            apiKey: process.env.COINGATE_API_KEY,
            mode: process.env.COINGATE_MODE || 'sandbox'
        }
    },
    regional: {
        midtrans: {
            serverKey: process.env.MIDTRANS_SERVER_KEY,
            clientKey: process.env.MIDTRANS_CLIENT_KEY,
            mode: process.env.MIDTRANS_MODE || 'sandbox'
        },
        razorpay: {
            keyId: process.env.RAZORPAY_KEY_ID,
            keySecret: process.env.RAZORPAY_KEY_SECRET
        }
    }
};

// Stripe Payment Intent
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency, customer_email, metadata } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
            customer_email: customer_email,
            metadata: metadata,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({
            client_secret: paymentIntent.client_secret,
            payment_intent_id: paymentIntent.id
        });
    } catch (error) {
        console.error('Stripe payment intent error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Stripe Webhook
app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, config.stripe.webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('Payment succeeded:', paymentIntent.id);
            // Grant access to customer
            grantAccess(paymentIntent.customer_email, paymentIntent.metadata);
            break;
        case 'payment_intent.payment_failed':
            console.log('Payment failed:', event.data.object.id);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
});

// PayPal Payment
app.post('/api/create-paypal-order', async (req, res) => {
    try {
        const { amount, currency, customer_email } = req.body;
        
        // PayPal SDK integration would go here
        // This is a simplified example
        const order = {
            id: 'PAYPAL_ORDER_' + Date.now(),
            status: 'CREATED',
            amount: amount,
            currency: currency,
            customer_email: customer_email
        };

        res.json(order);
    } catch (error) {
        console.error('PayPal order creation error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Crypto Payment (CoinGate)
app.post('/api/create-crypto-payment', async (req, res) => {
    try {
        const { amount, currency, customer_email, success_url, cancel_url } = req.body;
        
        // CoinGate API integration
        const coingate = require('coingate-v2');
        const client = coingate(config.crypto.coingate.apiKey, config.crypto.coingate.mode === 'live');
        
        const order = await client.createOrder({
            order_id: 'CRYPTO_' + Date.now(),
            price_amount: amount,
            price_currency: currency,
            receive_currency: 'USD',
            title: 'ARIBUY Presets Collection',
            description: 'Professional Lightroom Presets',
            callback_url: `${process.env.BASE_URL}/api/crypto-callback`,
            success_url: success_url,
            cancel_url: cancel_url,
            buyer_email: customer_email
        });

        res.json({
            payment_url: order.payment_url,
            payment_id: order.id
        });
    } catch (error) {
        console.error('Crypto payment creation error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Crypto Payment Callback
app.post('/api/crypto-callback', (req, res) => {
    try {
        const { id, status, price_amount, buyer_email } = req.body;
        
        if (status === 'paid') {
            console.log('Crypto payment completed:', id);
            grantAccess(buyer_email, { payment_method: 'crypto', amount: price_amount });
        }
        
        res.json({ received: true });
    } catch (error) {
        console.error('Crypto callback error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Bank Transfer
app.post('/api/create-bank-transfer', async (req, res) => {
    try {
        const { amount, currency, customer_email, country } = req.body;
        
        // Generate unique reference
        const reference = 'BT' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
        
        // Get bank details based on country
        const bankDetails = getBankDetails(country);
        
        const transfer = {
            transfer_id: reference,
            instructions: {
                bank_name: bankDetails.bank_name,
                account_number: bankDetails.account_number,
                routing_number: bankDetails.routing_number,
                swift_code: bankDetails.swift_code,
                amount: amount,
                currency: currency,
                reference: reference,
                beneficiary: 'ARIBUY LLC'
            }
        };
        
        // Store pending transfer
        storePendingTransfer(transfer, customer_email);
        
        res.json(transfer);
    } catch (error) {
        console.error('Bank transfer creation error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Regional Payment Methods
app.post('/api/create-regional-payment', async (req, res) => {
    try {
        const { method, amount, currency, customer_email, country } = req.body;
        
        let paymentResult;
        
        switch (method) {
            case 'midtrans':
                paymentResult = await createMidtransPayment(amount, currency, customer_email);
                break;
            case 'razorpay':
                paymentResult = await createRazorpayPayment(amount, currency, customer_email);
                break;
            case 'gopay':
            case 'ovo':
            case 'dana':
                paymentResult = await createIndonesianWalletPayment(method, amount, currency, customer_email);
                break;
            case 'gcash':
            case 'paymaya':
                paymentResult = await createPhilippinesPayment(method, amount, currency, customer_email);
                break;
            case 'pix':
                paymentResult = await createPixPayment(amount, currency, customer_email);
                break;
            default:
                throw new Error(`Payment method ${method} not supported`);
        }
        
        res.json(paymentResult);
    } catch (error) {
        console.error('Regional payment creation error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Midtrans Payment (Indonesia)
async function createMidtransPayment(amount, currency, customer_email) {
    const midtrans = require('midtrans-client');
    
    const snap = new midtrans.Snap({
        isProduction: config.regional.midtrans.mode === 'production',
        serverKey: config.regional.midtrans.serverKey
    });
    
    const parameter = {
        transaction_details: {
            order_id: 'MIDTRANS_' + Date.now(),
            gross_amount: amount
        },
        credit_card: {
            secure: true
        },
        customer_details: {
            email: customer_email
        }
    };
    
    const transaction = await snap.createTransaction(parameter);
    
    return {
        payment_url: transaction.redirect_url,
        payment_id: parameter.transaction_details.order_id,
        token: transaction.token
    };
}

// Razorpay Payment (India)
async function createRazorpayPayment(amount, currency, customer_email) {
    const Razorpay = require('razorpay');
    
    const razorpay = new Razorpay({
        key_id: config.regional.razorpay.keyId,
        key_secret: config.regional.razorpay.keySecret
    });
    
    const order = await razorpay.orders.create({
        amount: amount * 100, // Amount in paise
        currency: currency,
        receipt: 'RAZORPAY_' + Date.now(),
        notes: {
            customer_email: customer_email
        }
    });
    
    return {
        payment_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: config.regional.razorpay.keyId
    };
}

// Indonesian Wallet Payments
async function createIndonesianWalletPayment(method, amount, currency, customer_email) {
    // Integration with Indonesian payment gateways
    const paymentId = method.toUpperCase() + '_' + Date.now();
    
    return {
        payment_id: paymentId,
        payment_url: `https://payment-gateway.id/${method}/pay?id=${paymentId}`,
        qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${paymentId}`
    };
}

// Philippines Payment Methods
async function createPhilippinesPayment(method, amount, currency, customer_email) {
    const paymentId = method.toUpperCase() + '_' + Date.now();
    
    return {
        payment_id: paymentId,
        payment_url: `https://payment-gateway.ph/${method}/pay?id=${paymentId}`,
        reference_number: paymentId
    };
}

// PIX Payment (Brazil)
async function createPixPayment(amount, currency, customer_email) {
    const paymentId = 'PIX_' + Date.now();
    
    // Generate PIX QR Code
    const pixKey = process.env.PIX_KEY || 'your-pix-key@email.com';
    const pixCode = generatePixCode(pixKey, amount, paymentId);
    
    return {
        payment_id: paymentId,
        pix_code: pixCode,
        qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`
    };
}

// Helper Functions
function getBankDetails(country) {
    const bankDetails = {
        'US': {
            bank_name: 'Chase Bank',
            account_number: '1234567890',
            routing_number: '021000021',
            swift_code: 'CHASUS33'
        },
        'GB': {
            bank_name: 'HSBC UK',
            account_number: '12345678',
            sort_code: '40-02-02',
            swift_code: 'HBUKGB4B'
        },
        'EU': {
            bank_name: 'Deutsche Bank',
            account_number: 'DE89370400440532013000',
            swift_code: 'DEUTDEFF'
        }
    };
    
    return bankDetails[country] || bankDetails['US'];
}

function generatePixCode(pixKey, amount, paymentId) {
    // Simplified PIX code generation
    return `00020126580014BR.GOV.BCB.PIX0136${pixKey}52040000530398654${amount.toFixed(2)}5802BR5913ARIBUY LLC6009SAO PAULO62070503${paymentId}6304`;
}

function storePendingTransfer(transfer, customer_email) {
    // Store in database for manual verification
    console.log('Pending transfer stored:', transfer.transfer_id, customer_email);
}

function grantAccess(customer_email, metadata) {
    // Grant access to customer
    console.log('Granting access to:', customer_email, metadata);
    
    // Send welcome email with download links
    // Update customer database
    // Trigger fulfillment process
}

// Currency Conversion
app.get('/api/convert-currency/:from/:to/:amount', async (req, res) => {
    try {
        const { from, to, amount } = req.params;
        
        // Use exchange rate API
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
        const data = await response.json();
        const rate = data.rates[to];
        
        const convertedAmount = parseFloat(amount) * rate;
        
        res.json({
            from_currency: from,
            to_currency: to,
            original_amount: parseFloat(amount),
            converted_amount: Math.round(convertedAmount * 100) / 100,
            exchange_rate: rate
        });
    } catch (error) {
        console.error('Currency conversion error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`💳 Payment server running on port ${PORT}`);
});

module.exports = app;