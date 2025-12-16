#!/bin/bash

# Production deployment script
set -e

echo "🚀 Deploying to PRODUCTION: presets.agentbar.ai..."

# Create production package
tar --exclude='.git' --exclude='*.log' --exclude='content-editor.html' -czf "deploy_production.tar.gz" .

# Deploy to production server
scp "deploy_production.tar.gz" "presets-production:/tmp/"

ssh "presets-production" << 'EOF'
    set -e
    
    # Backup current production
    if [ -d "/var/www/presets.agentbar.ai" ]; then
        mv /var/www/presets.agentbar.ai /var/www/presets.agentbar.ai_backup_$(date +%Y%m%d_%H%M%S)
    fi
    
    # Create fresh production directory
    mkdir -p /var/www/presets.agentbar.ai
    cd /var/www/presets.agentbar.ai
    
    # Extract production deployment
    tar -xzf /tmp/deploy_production.tar.gz
    
    # Remove demo banners and enable production mode
    sed -i 's/🎭 DEMO MODE.*$/🔥 LIVE PRODUCTION - Real Payments Active/g' *.html
    sed -i 's/demoMode.*true/demoMode: false/g' *.html
    
    # Set permissions
    chown -R www-data:www-data /var/www/presets.agentbar.ai
    chmod -R 755 /var/www/presets.agentbar.ai
    
    # Restart services
    systemctl restart nginx
    
    # Cleanup
    rm /tmp/deploy_production.tar.gz
    
    echo "✅ PRODUCTION deployment completed!"
EOF

# Cleanup
rm "deploy_production.tar.gz"

echo "✅ PRODUCTION deployment successful!"
echo "🌐 Live at: https://presets.agentbar.ai"
echo "⚠️  Remember to:"
echo "   - Configure real payment gateways"
echo "   - Update analytics IDs"
echo "   - Test complete funnel flow"