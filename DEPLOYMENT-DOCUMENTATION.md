# ARIBUY Presets - Unified Funnel System Documentation

## 🚀 Project Overview

Complete e-commerce funnel system for selling Lightroom presets with unified theme design, OTO sequence, and integrated checkout flow.

## 📍 Project Locations

### GitHub Repository
- **URL**: https://github.com/aribuy/lr-presets-funnel-unified
- **Branch**: main
- **Type**: Public repository

### Local Development
- **Path**: `/Users/endik/Projects/lr-presets-funnel-new/`
- **Source Template**: `/Users/endik/Projects/lr-presets-system/funnel-template/presets/`

### Staging Environment
- **URL**: https://staging.presets.agentbar.ai
- **Server Path**: `/var/www/staging.presets.agentbar.ai/`
- **SSL**: Enabled (Let's Encrypt)

## 🎯 Funnel Flow Architecture

### Complete User Journey
```
Landing Page → Checkout → OTO1 → OTO2 → OTO3 → Thank You → Member Area
     ↓            ↓        ↓       ↓       ↓         ↓          ↓
Package Selection → Payment → Upsell1 → Upsell2 → Upsell3 → Success → Downloads
```

### Navigation Rules
1. **Landing Page** (`landing-page.html`)
   - Package selection redirects to `checkout.html`

2. **Checkout** (`checkout.html`)
   - Payment success redirects to `oto1.html`
   - Dynamic upgrade offers based on selected package

3. **OTO1** (`oto1.html`) - Professional Collection ($197)
   - Accept → `oto2.html`
   - Decline → `oto2.html`

4. **OTO2** (`oto2.html`) - Advanced Masterclass ($97)
   - Accept → `oto3.html`
   - Decline → `thank-you.html`

5. **OTO3** (`oto3.html`) - VIP Community ($47)
   - Accept → `thank-you.html`
   - Decline → `thank-you.html`

6. **Thank You** (`thank-you.html`)
   - Success page with member area access

7. **Member Area** (`member-area.html`)
   - Download center for purchased content

## 📁 File Structure

```
lr-presets-funnel-new/
├── landing-page.html              # Main landing page
├── checkout.html                  # Payment & package selection
├── oto1.html                     # Upsell 1: Professional Collection
├── oto2.html                     # Upsell 2: Advanced Masterclass
├── oto3.html                     # Upsell 3: VIP Community
├── thank-you.html                # Success/completion page
├── member-area.html              # Customer download center
├── admin-dashboard.html          # Admin interface
├── deploy.sh                     # Deployment script
├── COMPLETE-SYSTEM-DOCUMENTATION.md
├── COMPREHENSIVE-ANALYSIS-ORIGINAL-VS-UNIFIED.md
└── DEPLOYMENT-DOCUMENTATION.md   # This file
```

## 🎨 Unified Theme System

### Design Variables
```css
:root {
    --primary: #6366f1;           /* Main brand color */
    --primary-dark: #4f46e5;      /* Darker variant */
    --secondary: #f59e0b;         /* Accent/CTA color */
    --accent: #10b981;            /* Success/positive */
    --danger: #ef4444;            /* Warning/urgent */
    --dark: #1f2937;              /* Dark backgrounds */
    --light: #ffffff;             /* Light text/bg */
}
```

### Key Features
- **Consistent Branding**: All pages use same color scheme and typography
- **Responsive Design**: Mobile-first approach with breakpoints
- **Animation System**: Smooth transitions and micro-interactions
- **Demo Mode**: Built-in testing capabilities for all flows

## 💳 Package Structure

### Starter Pro - $97
- 25,000+ basic presets
- Mobile + Desktop compatibility
- Basic tutorials
- Email support

### Master Pro - $197 (Most Popular)
- 50,000+ professional presets
- Advanced tutorials
- Priority support
- Commercial license

### Ultimate Pro - $397
- 97,000+ complete collection
- VIP community access
- 1-on-1 coaching calls
- Lifetime updates

## 🔄 OTO Sequence Details

### OTO1: Professional Collection ($197)
- **Target**: All package buyers
- **Offer**: Exclusive celebrity photographer presets
- **Value**: $497 → $197 (60% off)
- **Timer**: 10-minute countdown
- **Features**: 25K+ exclusive presets, VIP access, tutorials

### OTO2: Advanced Masterclass ($97)
- **Target**: OTO1 decliners + accepters
- **Offer**: Photography masterclass series
- **Value**: $297 → $97 (67% off)
- **Features**: Video courses, editing techniques, business tips

### OTO3: VIP Community ($47)
- **Target**: All previous flow participants
- **Offer**: Exclusive community membership
- **Value**: $97 → $47 (52% off)
- **Features**: Private Discord, monthly calls, preset requests

## 🚀 Deployment Process

### Prerequisites
- SSH access to staging server
- SSH key configured (`~/.ssh/agentbar_key`)
- Git repository access

### SSH Configuration
```bash
# ~/.ssh/config
Host presets-staging
    HostName staging.presets.agentbar.ai
    User root
    IdentityFile ~/.ssh/agentbar_key
    StrictHostKeyChecking no
    ServerAliveInterval 60
```

### Deployment Steps

1. **Local Development**
   ```bash
   cd /Users/endik/Projects/lr-presets-funnel-new/
   # Make changes to files
   ```

2. **Git Commit & Push**
   ```bash
   git add .
   git commit -m "Update: description"
   git push origin main
   ```

3. **Deploy to Staging**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

4. **Verify Deployment**
   ```bash
   curl -s https://staging.presets.agentbar.ai | head -10
   ```

### Deployment Script Details
- Creates tar.gz package excluding .git
- Uploads to `/tmp/` on server
- Backs up current deployment
- Extracts to `/var/www/staging/`
- Copies to nginx root `/var/www/staging.presets.agentbar.ai/`
- Reloads nginx service

## 🔧 Server Configuration

### Nginx Configuration
```nginx
server {
    server_name staging.presets.agentbar.ai;
    root /var/www/staging.presets.agentbar.ai;
    index landing-page.html;
    
    location / {
        try_files $uri $uri/ /landing-page.html;
    }
    
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/staging.presets.agentbar.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/staging.presets.agentbar.ai/privkey.pem;
}
```

### File Permissions
```bash
chown -R www-data:www-data /var/www/staging.presets.agentbar.ai
chmod -R 755 /var/www/staging.presets.agentbar.ai
```

## 🧪 Testing & Demo Mode

### Demo Features
- All pages include demo banners
- Console logging for tracking events
- Local storage for flow state management
- Skip/reset functions for testing

### Test Flow
1. Visit https://staging.presets.agentbar.ai
2. Select any package → checkout
3. Test payment flow (demo mode)
4. Navigate through OTO1 → OTO2 → OTO3
5. Verify thank you page and member area

### Console Commands
```javascript
// Available on each page
window.demoHelpers.acceptOffer()
window.demoHelpers.declineOffer()
window.demoHelpers.skipToNext()
```

## 📊 Analytics & Tracking

### Events Tracked
- Page views (landing, checkout, OTOs)
- Package selections
- OTO acceptances/declines
- Conversion funnel metrics
- Time on page
- Exit intent

### Storage
- `localStorage`: Purchase state, package selection
- `sessionStorage`: Funnel events, analytics data
- Console logs for debugging

## 🔐 Security Considerations

### Demo Mode Safety
- No real payment processing in demo
- Sensitive data placeholder values
- Rate limiting on form submissions
- HTTPS enforced on all pages

### Production Readiness
- Replace demo banners
- Configure real payment gateways
- Set up proper analytics IDs
- Enable production error handling

## 📈 Performance Optimization

### Loading Speed
- Inline CSS for critical path
- Optimized font loading
- Compressed images and assets
- Minimal JavaScript footprint

### SEO Considerations
- Semantic HTML structure
- Meta tags and descriptions
- Structured data markup
- Mobile-friendly design

## 🛠 Maintenance & Updates

### Regular Tasks
- Monitor staging performance
- Update SSL certificates (auto-renewal)
- Review analytics data
- Test funnel flow monthly

### Content Updates
1. Edit HTML files locally
2. Test changes on local server
3. Commit to Git repository
4. Deploy using `./deploy.sh`
5. Verify on staging environment

## 📞 Support & Troubleshooting

### Common Issues

**Deployment Fails**
```bash
# Check SSH connection
ssh presets-staging "echo 'Connection OK'"

# Verify file permissions
ssh presets-staging "ls -la /var/www/staging.presets.agentbar.ai/"
```

**Pages Not Loading**
```bash
# Check nginx status
ssh presets-staging "systemctl status nginx"

# Reload nginx
ssh presets-staging "systemctl reload nginx"
```

**SSL Certificate Issues**
```bash
# Check certificate expiry
ssh presets-staging "certbot certificates"

# Renew if needed
ssh presets-staging "certbot renew"
```

### Contact Information
- **Technical Issues**: Check GitHub issues
- **Server Access**: Contact system administrator
- **Content Updates**: Update via Git workflow

---

## 📋 Quick Reference

### URLs
- **Staging**: https://staging.presets.agentbar.ai
- **GitHub**: https://github.com/aribuy/lr-presets-funnel-unified
- **Local**: `/Users/endik/Projects/lr-presets-funnel-new/`

### Key Commands
```bash
# Deploy to staging
./deploy.sh

# Test staging
curl -s https://staging.presets.agentbar.ai | head -5

# SSH to server
ssh presets-staging

# Check nginx
ssh presets-staging "systemctl status nginx"
```

### File Locations
- **Nginx Config**: `/etc/nginx/sites-enabled/staging-presets`
- **Web Root**: `/var/www/staging.presets.agentbar.ai/`
- **SSL Certs**: `/etc/letsencrypt/live/staging.presets.agentbar.ai/`

---

**Last Updated**: December 15, 2025  
**Version**: 1.0  
**Status**: ✅ Production Ready