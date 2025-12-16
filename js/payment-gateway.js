/**
 * Global Payment Gateway Integration
 * Supports: Stripe, PayPal, Crypto, Regional Payment Methods
 */

class PaymentGateway {
    constructor() {
        this.config = {
            stripe: {
                publishableKey: 'pk_live_51234567890abcdef', // Replace with your real key
                currency: 'USD'
            },
            paypal: {
                clientId: 'AYourPayPalClientID123', // Replace with your real client ID
                currency: 'USD'
            },
            crypto: {
                enabled: true,
                currencies: ['BTC', 'ETH', 'USDT']
            },
            regional: {
                enabled: true,
                methods: {
                    'ID': ['midtrans', 'gopay', 'ovo', 'dana'], // Indonesia
                    'MY': ['fpx', 'grabpay'], // Malaysia
                    'SG': ['paynow', 'grabpay'], // Singapore
                    'TH': ['promptpay', 'truemoney'], // Thailand
                    'VN': ['momo', 'zalopay'], // Vietnam
                    'PH': ['gcash', 'paymaya'], // Philippines
                    'IN': ['upi', 'paytm', 'razorpay'], // India
                    'BR': ['pix', 'boleto'], // Brazil
                    'MX': ['oxxo', 'spei'], // Mexico
                    'CN': ['alipay', 'wechatpay'] // China
                }
            }
        };
        
        this.currentMethod = 'stripe';
        this.userCountry = 'US';
        this.stripe = null;
        this.paypal = null;
        
        this.init();
    }

    async init() {
        // Detect user country
        await this.detectUserCountry();
        
        // Initialize payment methods
        await this.initializeStripe();
        await this.initializePayPal();
        
        // Show relevant payment methods
        this.showRelevantPaymentMethods();
        
        console.log('💳 Payment Gateway initialized for country:', this.userCountry);
    }

    async detectUserCountry() {
        try {
            // Try multiple IP geolocation services
            const services = [
                'https://ipapi.co/json/',
                'https://ip-api.com/json/',
                'https://ipinfo.io/json'
            ];
            
            for (const service of services) {
                try {
                    const response = await fetch(service);
                    const data = await response.json();
                    
                    if (data.country_code || data.countryCode || data.country) {
                        this.userCountry = data.country_code || data.countryCode || data.country;
                        break;
                    }
                } catch (e) {
                    console.warn('Failed to detect country from:', service);
                }
            }
        } catch (error) {
            console.warn('Country detection failed, using default US');
        }
    }

    async initializeStripe() {
        if (typeof Stripe !== 'undefined') {
            this.stripe = Stripe(this.config.stripe.publishableKey);
            console.log('✅ Stripe initialized');
        }
    }

    async initializePayPal() {
        if (typeof paypal !== 'undefined') {
            this.paypal = paypal.Buttons({
                createOrder: (data, actions) => this.createPayPalOrder(data, actions),
                onApprove: (data, actions) => this.approvePayPalOrder(data, actions),
                onError: (err) => this.handlePayPalError(err)
            });
            console.log('✅ PayPal initialized');
        }
    }

    showRelevantPaymentMethods() {
        const container = document.querySelector('.payment-methods');
        if (!container) return;

        // Clear existing methods
        container.innerHTML = '';

        // Always show Stripe (global)
        this.addPaymentMethod(container, 'stripe', '💳', 'Credit Card', true);

        // Always show PayPal (global)
        this.addPaymentMethod(container, 'paypal', '🟦', 'PayPal', true);

        // Show crypto for supported regions
        if (this.config.crypto.enabled) {
            this.addPaymentMethod(container, 'crypto', '₿', 'Cryptocurrency', true);
        }

        // Show regional payment methods
        const regionalMethods = this.config.regional.methods[this.userCountry];
        if (regionalMethods) {
            regionalMethods.forEach(method => {
                const methodInfo = this.getRegionalMethodInfo(method);
                this.addPaymentMethod(container, method, methodInfo.icon, methodInfo.name, true);
            });
        }

        // Show bank transfer for all countries
        this.addPaymentMethod(container, 'bank', '🏦', 'Bank Transfer', true);
    }

    addPaymentMethod(container, method, icon, name, enabled) {
        const methodEl = document.createElement('div');
        methodEl.className = `payment-method ${enabled ? '' : 'disabled'}`;
        methodEl.onclick = enabled ? () => this.selectPaymentMethod(method) : null;
        
        methodEl.innerHTML = `
            <span class="payment-icon">${icon}</span>
            <span class="payment-label">${name}</span>
        `;
        
        container.appendChild(methodEl);
    }

    getRegionalMethodInfo(method) {
        const methodMap = {
            // Indonesia
            'midtrans': { icon: '🇮🇩', name: 'Midtrans' },
            'gopay': { icon: '💚', name: 'GoPay' },
            'ovo': { icon: '🟣', name: 'OVO' },
            'dana': { icon: '🔵', name: 'DANA' },
            
            // Malaysia
            'fpx': { icon: '🇲🇾', name: 'FPX' },
            'grabpay': { icon: '🟢', name: 'GrabPay' },
            
            // Singapore
            'paynow': { icon: '🇸🇬', name: 'PayNow' },
            
            // Thailand
            'promptpay': { icon: '🇹🇭', name: 'PromptPay' },
            'truemoney': { icon: '🔴', name: 'TrueMoney' },
            
            // Vietnam
            'momo': { icon: '🟣', name: 'MoMo' },
            'zalopay': { icon: '🔵', name: 'ZaloPay' },
            
            // Philippines
            'gcash': { icon: '🔵', name: 'GCash' },
            'paymaya': { icon: '🟢', name: 'PayMaya' },
            
            // India
            'upi': { icon: '🇮🇳', name: 'UPI' },
            'paytm': { icon: '🔵', name: 'Paytm' },
            'razorpay': { icon: '🟦', name: 'Razorpay' },
            
            // Brazil
            'pix': { icon: '🇧🇷', name: 'PIX' },
            'boleto': { icon: '📄', name: 'Boleto' },
            
            // Mexico
            'oxxo': { icon: '🏪', name: 'OXXO' },
            'spei': { icon: '🏦', name: 'SPEI' },
            
            // China
            'alipay': { icon: '🟦', name: 'Alipay' },
            'wechatpay': { icon: '🟢', name: 'WeChat Pay' }
        };
        
        return methodMap[method] || { icon: '💳', name: method.toUpperCase() };
    }

    selectPaymentMethod(method) {
        // Update UI
        document.querySelectorAll('.payment-method').forEach(el => {
            el.classList.remove('active');
        });
        event.target.closest('.payment-method').classList.add('active');
        
        this.currentMethod = method;
        
        // Show/hide relevant form sections
        this.updatePaymentForm(method);
        
        console.log('💳 Payment method selected:', method);
    }

    updatePaymentForm(method) {
        // Hide all payment forms
        document.querySelectorAll('.payment-form-section').forEach(el => {
            el.style.display = 'none';
        });
        
        // Show relevant form
        const formSection = document.getElementById(`${method}-form`);
        if (formSection) {
            formSection.style.display = 'block';
        }
        
        // Update submit button text
        const submitBtn = document.getElementById('submitOrder');
        if (submitBtn) {
            const methodInfo = this.getPaymentMethodInfo(method);
            submitBtn.textContent = `Pay with ${methodInfo.name} - $${this.getCurrentPrice()}`;
        }
    }

    getPaymentMethodInfo(method) {
        const methodMap = {
            'stripe': { name: 'Credit Card', processor: 'stripe' },
            'paypal': { name: 'PayPal', processor: 'paypal' },
            'crypto': { name: 'Cryptocurrency', processor: 'crypto' },
            'bank': { name: 'Bank Transfer', processor: 'bank' }
        };
        
        return methodMap[method] || this.getRegionalMethodInfo(method);
    }

    getCurrentPrice() {
        // Get current price from page context
        const priceEl = document.querySelector('.current-price, .product-price');
        if (priceEl) {
            return priceEl.textContent.replace(/[^0-9.]/g, '');
        }
        return '47'; // Default price
    }

    async processPayment(orderData) {
        console.log('💳 Processing payment with method:', this.currentMethod);
        
        try {
            switch (this.currentMethod) {
                case 'stripe':
                    return await this.processStripePayment(orderData);
                case 'paypal':
                    return await this.processPayPalPayment(orderData);
                case 'crypto':
                    return await this.processCryptoPayment(orderData);
                case 'bank':
                    return await this.processBankTransfer(orderData);
                default:
                    return await this.processRegionalPayment(orderData);
            }
        } catch (error) {
            console.error('Payment processing failed:', error);
            throw error;
        }
    }

    async processStripePayment(orderData) {
        if (!this.stripe) {
            throw new Error('Stripe not initialized');
        }

        // Create payment intent on server
        const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: Math.round(parseFloat(this.getCurrentPrice()) * 100), // Convert to cents
                currency: this.config.stripe.currency.toLowerCase(),
                customer_email: orderData.email,
                metadata: {
                    product: orderData.product,
                    country: this.userCountry
                }
            })
        });

        const { client_secret } = await response.json();

        // Confirm payment
        const result = await this.stripe.confirmCardPayment(client_secret, {
            payment_method: {
                card: this.stripe.elements().getElement('card'),
                billing_details: {
                    name: `${orderData.firstName} ${orderData.lastName}`,
                    email: orderData.email,
                    address: {
                        country: orderData.country,
                        postal_code: orderData.zipCode
                    }
                }
            }
        });

        if (result.error) {
            throw new Error(result.error.message);
        }

        return {
            success: true,
            transaction_id: result.paymentIntent.id,
            method: 'stripe'
        };
    }

    async processPayPalPayment(orderData) {
        // PayPal payment handled by PayPal SDK
        return new Promise((resolve, reject) => {
            this.paypalResolve = resolve;
            this.paypalReject = reject;
            
            // Trigger PayPal button click
            document.querySelector('#paypal-button-container button').click();
        });
    }

    async createPayPalOrder(data, actions) {
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: this.getCurrentPrice(),
                    currency_code: this.config.paypal.currency
                },
                description: 'ARIBUY Presets Collection'
            }]
        });
    }

    async approvePayPalOrder(data, actions) {
        const order = await actions.order.capture();
        
        if (this.paypalResolve) {
            this.paypalResolve({
                success: true,
                transaction_id: order.id,
                method: 'paypal'
            });
        }
        
        return order;
    }

    handlePayPalError(err) {
        console.error('PayPal error:', err);
        if (this.paypalReject) {
            this.paypalReject(new Error('PayPal payment failed'));
        }
    }

    async processCryptoPayment(orderData) {
        // Integrate with crypto payment processor (e.g., CoinGate, BitPay)
        const response = await fetch('/api/create-crypto-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: this.getCurrentPrice(),
                currency: 'USD',
                customer_email: orderData.email,
                success_url: window.location.origin + '/thank-you.html',
                cancel_url: window.location.href
            })
        });

        const { payment_url, payment_id } = await response.json();
        
        // Redirect to crypto payment page
        window.location.href = payment_url;
        
        return {
            success: true,
            transaction_id: payment_id,
            method: 'crypto',
            redirect: true
        };
    }

    async processBankTransfer(orderData) {
        // Generate bank transfer instructions
        const response = await fetch('/api/create-bank-transfer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: this.getCurrentPrice(),
                currency: 'USD',
                customer_email: orderData.email,
                country: this.userCountry
            })
        });

        const { transfer_id, instructions } = await response.json();
        
        // Show bank transfer instructions
        this.showBankTransferInstructions(instructions);
        
        return {
            success: true,
            transaction_id: transfer_id,
            method: 'bank_transfer',
            pending: true
        };
    }

    async processRegionalPayment(orderData) {
        // Process regional payment methods
        const response = await fetch('/api/create-regional-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                method: this.currentMethod,
                amount: this.getCurrentPrice(),
                currency: this.getRegionalCurrency(),
                customer_email: orderData.email,
                country: this.userCountry
            })
        });

        const { payment_url, payment_id } = await response.json();
        
        if (payment_url) {
            // Redirect to regional payment page
            window.location.href = payment_url;
        }
        
        return {
            success: true,
            transaction_id: payment_id,
            method: this.currentMethod,
            redirect: !!payment_url
        };
    }

    getRegionalCurrency() {
        const currencyMap = {
            'ID': 'IDR', 'MY': 'MYR', 'SG': 'SGD', 'TH': 'THB',
            'VN': 'VND', 'PH': 'PHP', 'IN': 'INR', 'BR': 'BRL',
            'MX': 'MXN', 'CN': 'CNY', 'JP': 'JPY', 'KR': 'KRW'
        };
        
        return currencyMap[this.userCountry] || 'USD';
    }

    showBankTransferInstructions(instructions) {
        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>🏦 Bank Transfer Instructions</h3>
                <div class="transfer-details">
                    <p><strong>Bank:</strong> ${instructions.bank_name}</p>
                    <p><strong>Account:</strong> ${instructions.account_number}</p>
                    <p><strong>Amount:</strong> $${instructions.amount}</p>
                    <p><strong>Reference:</strong> ${instructions.reference}</p>
                </div>
                <p class="transfer-note">
                    Please include the reference number in your transfer.
                    Access will be granted within 24 hours of payment confirmation.
                </p>
                <button onclick="this.parentElement.parentElement.remove()">
                    I Understand
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // Currency conversion for international markets
    async convertCurrency(amount, fromCurrency, toCurrency) {
        try {
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
            const data = await response.json();
            const rate = data.rates[toCurrency];
            
            return Math.round(amount * rate * 100) / 100;
        } catch (error) {
            console.warn('Currency conversion failed:', error);
            return amount;
        }
    }

    // Get localized pricing
    async getLocalizedPrice(basePrice = 47) {
        const localCurrency = this.getRegionalCurrency();
        
        if (localCurrency === 'USD') {
            return { amount: basePrice, currency: 'USD', symbol: '$' };
        }
        
        const convertedAmount = await this.convertCurrency(basePrice, 'USD', localCurrency);
        const symbol = this.getCurrencySymbol(localCurrency);
        
        return {
            amount: convertedAmount,
            currency: localCurrency,
            symbol: symbol
        };
    }

    getCurrencySymbol(currency) {
        const symbols = {
            'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥',
            'IDR': 'Rp', 'MYR': 'RM', 'SGD': 'S$', 'THB': '฿',
            'VND': '₫', 'PHP': '₱', 'INR': '₹', 'BRL': 'R$',
            'MXN': '$', 'CNY': '¥', 'KRW': '₩'
        };
        
        return symbols[currency] || currency;
    }
}

// Initialize payment gateway
window.paymentGateway = new PaymentGateway();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaymentGateway;
}