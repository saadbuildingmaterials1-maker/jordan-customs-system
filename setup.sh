#!/bin/bash

# Jordan Customs System - Automated Setup Script
# This script automates the deployment process on Ubuntu VPS

set -e  # Exit on error

echo "========================================="
echo "Jordan Customs System - Setup Script"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   echo -e "${RED}Please run as root (use sudo)${NC}"
   exit 1
fi

echo -e "${GREEN}Step 1: Updating system packages...${NC}"
apt update && apt upgrade -y

echo -e "${GREEN}Step 2: Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo -e "${GREEN}Docker installed successfully${NC}"
else
    echo -e "${YELLOW}Docker already installed${NC}"
fi

echo -e "${GREEN}Step 3: Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    apt install docker-compose -y
    echo -e "${GREEN}Docker Compose installed successfully${NC}"
else
    echo -e "${YELLOW}Docker Compose already installed${NC}"
fi

echo -e "${GREEN}Step 4: Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install nginx -y
    systemctl enable nginx
    echo -e "${GREEN}Nginx installed successfully${NC}"
else
    echo -e "${YELLOW}Nginx already installed${NC}"
fi

echo -e "${GREEN}Step 5: Installing Certbot for SSL...${NC}"
if ! command -v certbot &> /dev/null; then
    apt install certbot python3-certbot-nginx -y
    echo -e "${GREEN}Certbot installed successfully${NC}"
else
    echo -e "${YELLOW}Certbot already installed${NC}"
fi

echo -e "${GREEN}Step 6: Setting up Firewall...${NC}"
ufw --force enable
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
echo -e "${GREEN}Firewall configured${NC}"

echo -e "${GREEN}Step 7: Copying Nginx configuration...${NC}"
if [ -f "nginx.conf" ]; then
    cp nginx.conf /etc/nginx/sites-available/mp3-app.com
    ln -sf /etc/nginx/sites-available/mp3-app.com /etc/nginx/sites-enabled/
    # Remove default site
    rm -f /etc/nginx/sites-enabled/default
    echo -e "${GREEN}Nginx configuration copied${NC}"
else
    echo -e "${RED}nginx.conf not found!${NC}"
    exit 1
fi

echo -e "${GREEN}Step 8: Building and starting Docker containers...${NC}"
docker-compose up -d --build

echo -e "${GREEN}Step 9: Waiting for application to start...${NC}"
sleep 10

echo -e "${GREEN}Step 10: Testing Nginx configuration...${NC}"
nginx -t

echo -e "${GREEN}Step 11: Restarting Nginx...${NC}"
systemctl restart nginx

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Setup completed successfully!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Configure DNS for mp3-app.com to point to this server's IP"
echo "2. Run: sudo certbot --nginx -d mp3-app.com -d www.mp3-app.com"
echo "3. Create admin user (see DEPLOYMENT.md)"
echo "4. Visit https://mp3-app.com"
echo ""
echo -e "${GREEN}Useful commands:${NC}"
echo "- View logs: docker-compose logs -f app"
echo "- Restart app: docker-compose restart app"
echo "- Stop all: docker-compose down"
echo ""
