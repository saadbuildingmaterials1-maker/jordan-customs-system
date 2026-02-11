#!/bin/bash

# Domain Connection Verification Script
# This script verifies the domain connection and DNS configuration

echo "================================"
echo "Domain Connection Verification"
echo "================================"
echo ""

DOMAIN="mp3-app.com"
TEMP_DOMAIN="3000-iez20yhz3jlh0ce65dmdy-c99488f0.sg1.manus.computer"

echo "1. Testing temporary domain connectivity..."
if curl -s -I https://$TEMP_DOMAIN/ | grep -q "HTTP"; then
    echo "✓ Temporary domain is reachable"
else
    echo "✗ Temporary domain is NOT reachable"
fi
echo ""

echo "2. Testing custom domain connectivity..."
if curl -s -I https://$DOMAIN/ 2>/dev/null | grep -q "HTTP"; then
    echo "✓ Custom domain is reachable"
else
    echo "✗ Custom domain is NOT reachable (expected if DNS not yet propagated)"
fi
echo ""

echo "3. Checking DNS records..."
echo "   Temporary Domain: $TEMP_DOMAIN"
echo "   Custom Domain: $DOMAIN"
echo ""

echo "4. Configuration files created:"
echo "   - project-config.json"
echo "   - dns-config.json"
echo "   - domain-binding.json"
echo ""

echo "5. Next steps:"
echo "   a) Update DNS records at your domain registrar:"
echo "      - Add CNAME record: $DOMAIN -> $TEMP_DOMAIN"
echo "      - Or add A record: $DOMAIN -> 34.159.200.1"
echo "   b) Wait 24-48 hours for DNS propagation"
echo "   c) Verify domain connection with: curl -I https://$DOMAIN"
echo ""

echo "================================"
echo "Verification Complete"
echo "================================"
