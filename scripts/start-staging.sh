#!/bin/bash

# ===================================
# Start Staging Environment Script
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

# Check if .env.staging exists
if [ ! -f ".env.staging" ]; then
    log_error ".env.staging file not found. Please create it first."
fi

log_info "Starting Staging environment..."

# Load environment variables
export $(cat .env.staging | grep -v '#' | xargs)

# Create logs directory
mkdir -p logs/staging

# Build Docker image
log_info "Building Docker image..."
docker build -t customs-system:staging .

if [ $? -eq 0 ]; then
    log_info "Docker image built successfully"
else
    log_error "Failed to build Docker image"
fi

# Start services
log_info "Starting services..."
docker-compose -f docker-compose-staging.yml up -d

if [ $? -eq 0 ]; then
    log_info "Services started successfully"
else
    log_error "Failed to start services"
fi

# Wait for services to be ready
log_info "Waiting for services to be ready..."
sleep 10

# Run migrations
log_info "Running database migrations..."
docker-compose -f docker-compose-staging.yml exec -T app pnpm db:push

if [ $? -eq 0 ]; then
    log_info "Migrations completed successfully"
else
    log_warn "Migrations may have failed - check logs"
fi

# Health check
log_info "Performing health checks..."
for i in {1..30}; do
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
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
log_info "Staging environment is ready!"
log_info "=========================================="
log_info ""
log_info "Application URL: http://localhost:3001"
log_info "Database: localhost:3307"
log_info "Redis: localhost:6380"
log_info "Adminer (DB UI): http://localhost:8080"
log_info "Redis Commander: http://localhost:8081"
log_info ""
log_info "View logs:"
log_info "  docker-compose -f docker-compose-staging.yml logs -f app"
log_info ""
log_info "Stop services:"
log_info "  docker-compose -f docker-compose-staging.yml down"
log_info ""
