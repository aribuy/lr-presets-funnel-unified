# Go Live Checklist - Payment Gateway

## 🚀 Step 1: Get Real API Keys

### Stripe (Required - Primary Payment)
1. Go to [stripe.com](https://stripe.com) → Create account
2. Complete business verification
3. Dashboard → Developers → API keys
4. Copy **Publishable key** and **Secret key**
5. Replace in `.env`:
   ```
   STRIPE_PUBLISHABLE_KEY=pk_live_your_real_key
   STRIPE_SECRET_KEY=sk_live_your_real_key
   ```

### PayPal (Required - Secondary Payment)
1. Go to [developer.paypal.com](https://developer.paypal.com)
2. Create business account
3. Create live app
4. Copy **Client ID** and **Client Secret**
5. Replace in `.env` and `checkout.html`

## 🚀 Step 2: Deploy Payment System

```bash
# Install dependencies
npm install

# Test locally first
npm start

# Deploy to production
./deploy-payment.sh
```

## 🚀 Step 3: Configure Webhooks

### Stripe Webhooks
1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://api.presets.agentbar.ai/api/stripe-webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook secret to `.env`

### PayPal Webhooks
1. PayPal Developer → Apps → Your App → Webhooks
2. Add webhook: `https://api.presets.agentbar.ai/api/paypal-webhook`
3. Select events: `PAYMENT.CAPTURE.COMPLETED`

## 🚀 Step 4: Test Payments

### Test Cards (Stripe)
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

### Test Flow
1. Go to `https://presets.agentbar.ai/checkout.html`
2. Fill form with test data
3. Use test card numbers
4. Verify payment processing

## 🚀 Step 5: Go Live

1. **Switch to Live Mode**
   - Change all API keys to live/production
   - Update webhook URLs
   - Test with real small amount

2. **Monitor**
   ```bash
   ssh root@presets.agentbar.ai 'pm2 logs payment-gateway'
   ```

3. **Verify**
   - Check https://api.presets.agentbar.ai/api/health
   - Test checkout flow
   - Verify webhook delivery

## 🔧 Quick Commands

```bash
# Check payment server status
ssh root@presets.agentbar.ai 'pm2 status'

# View payment logs
ssh root@presets.agentbar.ai 'pm2 logs payment-gateway --lines 50'

# Restart payment server
ssh root@presets.agentbar.ai 'pm2 restart payment-gateway'

# Test API health
curl https://api.presets.agentbar.ai/api/health
```

## 🌍 Regional Setup (Optional)

Add these for specific markets:

### Indonesia
- Midtrans: [midtrans.com](https://midtrans.com)

### India  
- Razorpay: [razorpay.com](https://razorpay.com)

### Brazil
- Configure PIX key in `.env`

## ⚠️ Important Notes

1. **Replace ALL placeholder keys** in `.env` with real ones
2. **Test thoroughly** before going live
3. **Monitor payment logs** after deployment
4. **Set up alerts** for failed payments
5. **Backup** current system before deployment

## 🎯 Success Metrics

After going live, monitor:
- Payment success rate (target: >95%)
- Average processing time (target: <3s)
- Regional payment adoption
- Conversion rate by payment method