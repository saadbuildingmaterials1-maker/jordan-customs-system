# نظام إدارة تكاليف الشحن والجمارك الأردنية
# Domain Setup Guide - دليل إعداد النطاق المخصص

## Overview
This guide explains how to connect the custom domain `mp3-app.com` to the Jordan Customs System application.

## Current Status

### ✓ Temporary Domain (Working)
- **URL**: https://3000-iez20yhz3jlh0ce65dmdy-c99488f0.sg1.manus.computer
- **Status**: Active and Running
- **Server**: Manus Cloud Platform
- **SSL**: Enabled (Let's Encrypt)

### ⏳ Custom Domain (Pending)
- **Domain**: mp3-app.com
- **Status**: Configuration Created, Awaiting DNS Update
- **Target**: 3000-iez20yhz3jlh0ce65dmdy-c99488f0.sg1.manus.computer
- **SSL**: Ready (Auto-provisioned)

## Configuration Files Created

### 1. Project Configuration (`project-config.json`)
- Contains project metadata and domain settings
- Defines primary domain as `mp3-app.com`
- Specifies server location and features

### 2. DNS Configuration (`dns-config.json`)
- CNAME record pointing to Manus server
- A record for fallback DNS resolution
- MX records for email support
- TXT records for SPF authentication
- SSL certificate configuration with auto-renewal

### 3. Domain Binding (`domain-binding.json`)
- Routing configuration for domain traffic
- SSL/TLS settings with certificate details
- Security headers (HSTS, X-Frame-Options, etc.)
- Caching rules for performance
- Health check monitoring

## DNS Update Instructions

### Step 1: Access Your Domain Registrar
1. Log in to your domain registrar (e.g., Namecheap, GoDaddy, Cloudflare)
2. Navigate to DNS settings for `mp3-app.com`

### Step 2: Add DNS Records

#### Option A: Using CNAME (Recommended)
```
Type: CNAME
Name: mp3-app.com (or @ for root)
Value: 3000-iez20yhz3jlh0ce65dmdy-c99488f0.sg1.manus.computer
TTL: 3600 (1 hour)
```

#### Option B: Using A Record (Alternative)
```
Type: A
Name: @ (root domain)
Value: 34.159.200.1
TTL: 3600 (1 hour)
```

### Step 3: Optional - Add www Subdomain
```
Type: CNAME
Name: www
Value: 3000-iez20yhz3jlh0ce65dmdy-c99488f0.sg1.manus.computer
TTL: 3600 (1 hour)
```

### Step 4: Wait for DNS Propagation
- DNS changes typically propagate within **24-48 hours**
- You can check propagation status at: https://www.whatsmydns.net/
- Search for: `mp3-app.com`

## Verification Steps

### Step 1: Check DNS Resolution
```bash
# Check DNS records
nslookup mp3-app.com
dig mp3-app.com

# Expected output should show the CNAME or A record you added
```

### Step 2: Test HTTPS Connection
```bash
# Test domain connectivity
curl -I https://mp3-app.com

# Expected response: HTTP/2 200
```

### Step 3: Verify SSL Certificate
```bash
# Check SSL certificate
openssl s_client -connect mp3-app.com:443

# Expected: Certificate issued for mp3-app.com
```

### Step 4: Test Application Features
1. Open https://mp3-app.com in your browser
2. Verify all pages load correctly
3. Test authentication and login
4. Verify database connectivity
5. Test file uploads and PDF processing
6. Verify payment processing (if applicable)

## Troubleshooting

### Issue: Domain Not Resolving
**Solution:**
1. Verify DNS records are correctly added
2. Wait for DNS propagation (up to 48 hours)
3. Clear browser cache: Ctrl+Shift+Delete
4. Try accessing from different network
5. Check DNS propagation at whatsmydns.net

### Issue: SSL Certificate Error
**Solution:**
1. Ensure domain is correctly pointing to Manus server
2. Wait for SSL certificate auto-provisioning (5-10 minutes)
3. Clear browser cache
4. Try accessing with www prefix

### Issue: Application Not Loading
**Solution:**
1. Verify temporary domain works: https://3000-iez20yhz3jlh0ce65dmdy-c99488f0.sg1.manus.computer
2. Check DNS records are correctly configured
3. Verify domain is pointing to correct server
4. Check browser console for errors (F12)
5. Contact support if issue persists

## Security Configuration

### SSL/TLS Settings
- **Provider**: Let's Encrypt
- **Certificate**: mp3-app.com + www.mp3-app.com
- **Validity**: 1 year (auto-renewal enabled)
- **Protocol**: TLS 1.2+
- **Cipher**: Modern ciphers only

### Security Headers
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### CORS Configuration
- Enabled for trusted origins
- Credentials allowed for same-origin requests
- Preflight requests cached for 1 hour

## Performance Optimization

### Caching Strategy
- **API Endpoints** (`/api/*`): No caching (TTL: 0)
- **Static Assets** (`/static/*`): 24-hour cache (TTL: 86400)
- **Default**: 1-hour cache (TTL: 3600)

### Health Monitoring
- **Interval**: 60 seconds
- **Timeout**: 10 seconds
- **Endpoint**: `/health`
- **Action**: Automatic failover on failure

## Windows Desktop App Configuration

The Windows desktop application can be updated to use the custom domain:

### Update Installer Script
1. Edit the batch installer script
2. Replace temporary domain with `mp3-app.com`
3. Update configuration in Windows registry
4. Reinstall application

### Example Update
```batch
REM Old
set APP_URL=https://3000-iez20yhz3jlh0ce65dmdy-c99488f0.sg1.manus.computer

REM New
set APP_URL=https://mp3-app.com
```

## Rollback Plan

If you need to revert to the temporary domain:

1. Update DNS records back to temporary domain
2. Clear browser cache
3. Restart application
4. Update Windows desktop app configuration

## Support Resources

### Configuration Files Location
- Project Config: `/home/ubuntu/jordan-customs-system/.webdev/project-config.json`
- DNS Config: `/home/ubuntu/jordan-customs-system/.webdev/dns-config.json`
- Domain Binding: `/home/ubuntu/jordan-customs-system/.webdev/domain-binding.json`

### Verification Script
```bash
bash /home/ubuntu/jordan-customs-system/.webdev/verify-domain.sh
```

### Application URLs
- **Temporary**: https://3000-iez20yhz3jlh0ce65dmdy-c99488f0.sg1.manus.computer
- **Custom**: https://mp3-app.com (after DNS propagation)

## Timeline

| Step | Duration | Status |
|------|----------|--------|
| Configuration Created | Immediate | ✓ Complete |
| DNS Records Added | Manual | ⏳ Pending |
| DNS Propagation | 24-48 hours | ⏳ Pending |
| SSL Certificate Issued | 5-10 minutes | ⏳ Pending |
| Domain Verification | Manual | ⏳ Pending |
| Application Testing | 30 minutes | ⏳ Pending |

## Next Steps

1. **Update DNS Records** at your domain registrar (mp3-app.com)
2. **Wait for Propagation** (24-48 hours)
3. **Verify Connection** using provided verification script
4. **Test Application** on custom domain
5. **Update Windows App** configuration (if needed)
6. **Monitor Performance** using health check endpoint

---

**Last Updated**: 2026-02-11
**Application**: Jordan Customs System (نظام إدارة تكاليف الشحن والجمارك الأردنية)
**Status**: Ready for Domain Connection
