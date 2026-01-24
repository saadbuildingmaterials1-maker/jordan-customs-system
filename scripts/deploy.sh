#!/bin/bash

# ===================================
# Deployment Script
# ===================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
DOCKER_REGISTRY=${DOCKER_REGISTRY:-docker.io}
IMAGE_NAME=${IMAGE_NAME:-customs-system}
VERSION=${2:-latest}

# Functions
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

# Check environment
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    log_error "Invalid environment. Use 'staging' or 'production'"
fi

log_info "Starting deployment to $ENVIRONMENT environment..."

# Load environment variables
if [ -f ".env.$ENVIRONMENT" ]; then
    log_info "Loading environment variables from .env.$ENVIRONMENT"
    export $(cat ".env.$ENVIRONMENT" | grep -v '#' | xargs)
else
    log_error ".env.$ENVIRONMENT file not found"
fi

# Build Docker image
log_info "Building Docker image..."
docker build -t "$DOCKER_REGISTRY/$IMAGE_NAME:$VERSION" \
             -t "$DOCKER_REGISTRY/$IMAGE_NAME:$ENVIRONMENT-latest" \
             -f Dockerfile .

if [ $? -eq 0 ]; then
    log_info "Docker image built successfully"
else
    log_error "Failed to build Docker image"
fi

# Push to registry
log_info "Pushing image to registry..."
docker push "$DOCKER_REGISTRY/$IMAGE_NAME:$VERSION"
docker push "$DOCKER_REGISTRY/$IMAGE_NAME:$ENVIRONMENT-latest"

if [ $? -eq 0 ]; then
    log_info "Image pushed successfully"
else
    log_error "Failed to push image"
fi

# Deploy using docker-compose
log_info "Deploying with docker-compose..."
docker-compose -f docker-compose.yml \
               -p "customs-$ENVIRONMENT" \
               up -d "app-$ENVIRONMENT"

if [ $? -eq 0 ]; then
    log_info "Deployment completed successfully"
else
    log_error "Deployment failed"
fi

# Run migrations
log_info "Running database migrations..."
docker-compose -f docker-compose.yml \
               -p "customs-$ENVIRONMENT" \
               exec -T "app-$ENVIRONMENT" \
               pnpm db:push

if [ $? -eq 0 ]; then
    log_info "Migrations completed successfully"
else
    log_warn "Migrations may have failed - check logs"
fi

# Health check
log_info "Performing health checks..."
for i in {1..30}; do
    if curl -f "http://localhost:$([ "$ENVIRONMENT" = "staging" ] && echo 3001 || echo 3000)/health" > /dev/null 2>&1; then
        log_info "Health check passed"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "Health check failed after 30 attempts"
    fi
    sleep 1
done

log_info "Deployment to $ENVIRONMENT completed successfully!"
log_info "Application is now running at http://localhost:$([ "$ENVIRONMENT" = "staging" ] && echo 3001 || echo 3000)"
