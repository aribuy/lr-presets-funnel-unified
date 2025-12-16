# Global Payment Gateway Setup Guide

## Overview
This payment system supports global markets with multiple payment methods:
- **Stripe** (Global credit cards)
- **PayPal** (Global digital wallet)
- **Cryptocurrency** (Bitcoin, Ethereum, USDT)
- **Regional Methods** (GoPay, PIX, UPI, etc.)
- **Bank Transfer** (All countries)

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
# Edit .env with your actual API keys
```

### 3. Start Payment Server
```bash
npm start
# or for development
npm run dev
```

## Payment Method Configuration

### Stripe (Global)
1. Create account at [stripe.com](https://stripe.com)
2. Get API keys from Dashboard > Developers > API keys
3. Set webhook endpoint: `https://yourdomain.com/api/stripe-webhook`
4. Add keys to `.env`:
```env
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### PayPal (Global)
1. Create account at [developer.paypal.com](https://developer.paypal.com)
2. Create app and get Client ID/Secret
3. Add to `.env`:
```env
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=live
```

### Cryptocurrency (CoinGate)
1. Create account at [coingate.com](https://coingate.com)
2. Get API key from Settings > API
3. Add to `.env`:
```env
COINGATE_API_KEY=your_api_key
COINGATE_MODE=live
```

## Regional Payment Methods

### Indonesia
**Midtrans** - Credit cards, bank transfer, e-wallets
```env
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_MODE=production
```

**Supported methods:**
- GoPay (e-wallet)
- OVO (e-wallet)  
- DANA (e-wallet)
- Bank Transfer (BCA, Mandiri, BNI, BRI)

### India
**Razorpay** - UPI, cards, wallets, net banking
```env
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

**Supported methods:**
- UPI (Google Pay, PhonePe, Paytm)
- Credit/Debit Cards
- Net Banking
- Wallets (Paytm, Mobikwik)

### Malaysia
**iPay88** - FPX, credit cards, e-wallets
```env
IPAY88_MERCHANT_CODE=your_merchant_code
IPAY88_MERCHANT_KEY=your_merchant_key
```

### Singapore
**PayNow** - Instant bank transfers
```env
PAYNOW_UEN=your_uen
PAYNOW_MERCHANT_NAME=ARIBUY LLC
```

### Thailand
**2C2P** - Credit cards, internet banking, e-wallets
```env
2C2P_MERCHANT_ID=your_merchant_id
2C2P_SECRET_KEY=your_secret_key
```

### Philippines
**PayMongo** - Credit cards, GCash, GrabPay
```env
PAYMONGO_PUBLIC_KEY=your_public_key
PAYMONGO_SECRET_KEY=your_secret_key
```

### Brazil
**PIX** - Instant payments
```env
PIX_KEY=your_pix_key
PIX_MERCHANT_NAME=ARIBUY LLC
PIX_MERCHANT_CITY=SAO PAULO
```

### Mexico
**Conekta** - Cards, OXXO, SPEI
```env
CONEKTA_PUBLIC_KEY=your_public_key
CONEKTA_PRIVATE_KEY=your_private_key
```

### China
**Alipay & WeChat Pay**
```env
ALIPAY_APP_ID=your_app_id
ALIPAY_PRIVATE_KEY=your_private_key
WECHAT_APP_ID=your_app_id
WECHAT_MCH_ID=your_mch_id
WECHAT_API_KEY=your_api_key
```

## Currency Support

The system automatically detects user location and shows relevant payment methods with local currency:

- **USD** - United States, Global
- **EUR** - European Union
- **GBP** - United Kingdom
- **IDR** - Indonesia
- **INR** - India
- **MYR** - Malaysia
- **SGD** - Singapore
- **THB** - Thailand
- **PHP** - Philippines
- **BRL** - Brazil
- **MXN** - Mexico
- **CNY** - China
- **JPY** - Japan
- **KRW** - South Korea

## Bank Transfer Details

Configure bank accounts for different regions in `.env`:

```env
# US Bank Details
BANK_NAME_US=Chase Bank
BANK_ACCOUNT_US=1234567890
BANK_ROUTING_US=021000021
BANK_SWIFT_US=CHASUS33

# EU Bank Details
BANK_NAME_EU=Deutsche Bank
BANK_ACCOUNT_EU=DE89370400440532013000
BANK_SWIFT_EU=DEUTDEFF

# UK Bank Details
BANK_NAME_UK=HSBC UK
BANK_ACCOUNT_UK=12345678
BANK_SORT_CODE_UK=40-02-02
BANK_SWIFT_UK=HBUKGB4B
```

## Testing

### Test Cards (Stripe)
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

### Test PayPal
Use PayPal sandbox accounts for testing.

### Test Regional Methods
Most regional providers offer sandbox/test environments.

## Security Features

- SSL/TLS encryption
- PCI DSS compliance (via Stripe)
- Webhook signature verification
- Rate limiting
- Input validation
- CSRF protection

## Deployment

### Production Checklist
1. ✅ Set all API keys to live/production mode
2. ✅ Configure SSL certificate
3. ✅ Set up webhook endpoints
4. ✅ Test all payment methods
5. ✅ Configure monitoring and alerts
6. ✅ Set up backup payment processors

### Server Requirements
- Node.js 16+
- SSL certificate
- Database (PostgreSQL recommended)
- Redis (for session management)

### Deploy Commands
```bash
# Install PM2 for production
npm install -g pm2

# Start payment server
npm run deploy

# Monitor
pm2 status
pm2 logs payment-gateway
```

## Monitoring & Analytics

Track payment performance:
- Conversion rates by country
- Payment method preferences
- Failed payment reasons
- Revenue by region

## Support

For payment integration support:
- Stripe: [stripe.com/support](https://stripe.com/support)
- PayPal: [developer.paypal.com/support](https://developer.paypal.com/support)
- Regional providers: Check respective documentation

## Compliance

Ensure compliance with:
- PCI DSS (payment card security)
- GDPR (EU data protection)
- Local financial regulations
- Tax requirements per country