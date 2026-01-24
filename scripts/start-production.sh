#!/bin/bash

# ===================================
# Start Production Environment Script
# ===================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Confirm production deployment
log_warn "⚠️  WARNING: You are about to start the PRODUCTION environment!"
log_warn "This will deploy the application to production servers."
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    log_info "Production deployment cancelled."
    exit 0
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    log_error ".env.production file not found. Please create it first."
fi

log_info "Starting Production environment..."

# Load environment variables
export $(cat .env.production | grep -v '#' | xargs)

# Create logs directory
mkdir -p logs/production

# Build Docker image
log_info "Building Docker image..."
docker build -t customs-system:production .

if [ $? -eq 0 ]; then
    log_info "Docker image built successfully"
else
    log_error "Failed to build Docker image"
fi

# Create backup before deployment
log_info "Creating database backup..."
mkdir -p scripts/backup
BACKUP_FILE="scripts/backup/backup-$(date +%Y%m%d-%H%M%S).sql"

if docker-compose -f docker-compose-production.yml ps db | grep -q "Up"; then
    docker-compose -f docker-compose-production.yml exec -T db \
        mysqldump -u root -p"${PRODUCTION_DB_ROOT_PASSWORD}" \
        customs_prod > "$BACKUP_FILE"
    log_info "Backup created: $BACKUP_FILE"
else
    log_warn "Database is not running, skipping backup"
fi

# Start services
log_info "Starting services..."
docker-compose -f docker-compose-production.yml up -d

if [ $? -eq 0 ]; then
    log_info "Services started successfully"
else
    log_error "Failed to start services"
fi

# Wait for services to be ready
log_info "Waiting for services to be ready..."
sleep 15

# Run migrations
log_info "Running database migrations..."
docker-compose -f docker-compose-production.yml exec -T app pnpm db:push

if [ $? -eq 0 ]; then
    log_info "Migrations completed successfully"
else
    log_error "Migrations failed - rolling back"
    exit 1
fi

# Health check
log_info "Performing health checks..."
for i in {1..30}; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        log_info "Health check passed"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "Health check failed after 30 attempts"
    fi
    sleep 1
done

log_info ""
log_info "=========================================="
log_info "✅ Production environment is ready!"
log_info "=========================================="
log_info ""
log_info "Application URL: https://customs-system.example.com"
log_info "Database: localhost:3306"
log_info "Redis: localhost:6379"
log_info ""
log_info "View logs:"
log_info "  docker-compose -f docker-compose-production.yml logs -f app"
log_info ""
log_info "Monitor resources:"
log_info "  docker stats"
log_info ""
log_info "Backup location: $BACKUP_FILE"
log_info ""
