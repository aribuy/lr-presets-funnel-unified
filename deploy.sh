#!/bin/bash

# Direct deployment to staging - replace everything
set -e

echo "🚀 Deploying to staging.presets.agentbar.ai..."

# Create deployment package
tar --exclude='.git' --exclude='*.log' -czf "deploy_new.tar.gz" .

# Deploy to server - REPLACE EVERYTHING
scp "deploy_new.tar.gz" "presets-staging:/tmp/"

ssh "presets-staging" << 'EOF'
    set -e
    
    # Backup current deployment
    if [ -d "/var/www/staging" ]; then
        mv /var/www/staging /var/www/staging_backup_$(date +%Y%m%d_%H%M%S)
    fi
    
    # Create fresh deployment directory
    mkdir -p /var/www/staging
    cd /var/www/staging
    
    # Extract new deployment
    tar -xzf /tmp/deploy_new.tar.gz
    
    # Set permissions
    chown -R www-data:www-data /var/www/staging
    chmod -R 755 /var/www/staging
    
    # Restart services
    systemctl restart nginx
    
    # Cleanup
    rm /tmp/deploy_new.tar.gz
    
    echo "✅ Fresh deployment completed!"
EOF

# Cleanup
rm "deploy_new.tar.gz"

echo "✅ Deployment completed successfully!"
echo "🌐 Visit: https://staging.presets.agentbar.ai"