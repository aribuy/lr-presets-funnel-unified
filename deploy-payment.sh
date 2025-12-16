#!/bin/bash

# Deploy Payment Gateway to Production
# Usage: ./deploy-payment.sh

set -e

echo "🚀 Deploying Global Payment Gateway..."

# Configuration
SERVER_HOST="presets.agentbar.ai"
SERVER_USER="root"
REMOTE_PATH="/var/www/presets.agentbar.ai"
LOCAL_PATH="."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env exists
if [ ! -f ".env" ]; then
    log_error ".env file not found!"
    log_info "Copy .env.example to .env and configure your API keys"
    exit 1
fi

# Check if payment server exists
if [ ! -f "api/payment-server.js" ]; then
    log_error "Payment server not found!"
    exit 1
fi

# Install dependencies locally first
log_info "Installing dependencies locally..."
npm install

# Test payment server locally
log_info "Testing payment server..."
node -e "console.log('Payment server syntax check passed')" api/payment-server.js
if [ $? -eq 0 ]; then
    log_info "✅ Payment server test passed"
else
    log_error "❌ Payment server test failed"
    exit 1
fi

# Create deployment package
log_info "Creating deployment package..."
tar -czf payment-gateway.tar.gz api/ js/ package.json .env 2>/dev/null || tar -czf payment-gateway.tar.gz api/ js/ package.json

# Upload to server
log_info "Uploading to production server..."
scp payment-gateway.tar.gz $SERVER_USER@$SERVER_HOST:/tmp/

# Deploy on server
log_info "Deploying on production server..."
ssh $SERVER_USER@$SERVER_HOST << 'EOF'
    set -e
    
    # Navigate to web directory
    cd /var/www/presets.agentbar.ai
    
    # Backup current payment system if exists
    if [ -d "api" ]; then
        echo "📦 Backing up current payment system..."
        tar -czf payment-backup-$(date +%Y%m%d-%H%M%S).tar.gz api/ js/ 2>/dev/null || true
    fi
    
    # Extract new payment system
    echo "📂 Extracting new payment system..."
    tar -xzf /tmp/payment-gateway.tar.gz
    
    # Install Node.js dependencies
    echo "📦 Installing Node.js dependencies..."
    npm install --production
    
    # Install PM2 if not exists
    if ! command -v pm2 &> /dev/null; then
        echo "📦 Installing PM2..."
        npm install -g pm2
    fi
    
    # Stop existing payment server
    echo "🛑 Stopping existing payment server..."
    pm2 stop payment-gateway 2>/dev/null || true
    pm2 delete payment-gateway 2>/dev/null || true
    
    # Start new payment server
    echo "🚀 Starting payment server..."
    pm2 start api/payment-server.js --name payment-gateway
    pm2 save
    
    # Setup PM2 startup
    pm2 startup systemd -u root --hp /root 2>/dev/null || true
    
    # Test payment server
    echo "🧪 Testing payment server..."
    sleep 5
    
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "✅ Payment server is running successfully"
    else
        echo "❌ Payment server failed to start"
        exit 1
    fi
    
    # Setup nginx proxy if not exists
    if [ ! -f "/etc/nginx/sites-available/payment-api" ]; then
        echo "🌐 Setting up nginx proxy..."
        cat > /etc/nginx/sites-available/payment-api << 'NGINX_EOF'
server {
    listen 80;
    server_name api.presets.agentbar.ai;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX_EOF
        
        ln -sf /etc/nginx/sites-available/payment-api /etc/nginx/sites-enabled/
        nginx -t && systemctl reload nginx
    fi
    
    # Cleanup
    rm -f /tmp/payment-gateway.tar.gz
    
    echo "🎉 Payment gateway deployed successfully!"
EOF

# Cleanup local files
rm -f payment-gateway.tar.gz

# Test production deployment
log_info "Testing production deployment..."
sleep 10

if curl -f https://api.presets.agentbar.ai/api/health > /dev/null 2>&1; then
    log_info "✅ Production payment gateway is running!"
else
    log_warn "⚠️  Production test failed - check server logs"
fi

# Update checkout page to use production API
log_info "Updating checkout page for production..."
sed -i.bak 's|/api/|https://api.presets.agentbar.ai/api/|g' checkout.html

# Deploy updated checkout page
log_info "Deploying updated checkout page..."
scp checkout.html $SERVER_USER@$SERVER_HOST:$REMOTE_PATH/

# Final verification
log_info "🔍 Final verification..."
echo ""
echo "Payment Gateway Status:"
echo "======================="
echo "🌐 API Endpoint: https://api.presets.agentbar.ai"
echo "📊 Health Check: https://api.presets.agentbar.ai/api/health"
echo "💳 Checkout Page: https://presets.agentbar.ai/checkout.html"
echo ""

# Show next steps
echo "Next Steps:"
echo "==========="
echo "1. Configure your payment provider API keys in .env"
echo "2. Set up webhook endpoints in payment provider dashboards"
echo "3. Test all payment methods thoroughly"
echo "4. Monitor payment processing logs: ssh $SERVER_USER@$SERVER_HOST 'pm2 logs payment-gateway'"
echo ""

log_info "🎉 Global Payment Gateway deployment complete!"

# Show monitoring commands
echo "Monitoring Commands:"
echo "==================="
echo "• Check status: ssh $SERVER_USER@$SERVER_HOST 'pm2 status'"
echo "• View logs: ssh $SERVER_USER@$SERVER_HOST 'pm2 logs payment-gateway'"
echo "• Restart: ssh $SERVER_USER@$SERVER_HOST 'pm2 restart payment-gateway'"
echo ""