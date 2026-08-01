#!/bin/bash

# MongoDB Compare - Start Application Script
# Starts MongoDB Compare with all services
# Usage: ./start-app.sh [--verbose] [--debug]

set -e

VERBOSE=false
DEBUG=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --debug|-d)
            DEBUG=true
            VERBOSE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--verbose] [--debug]"
            exit 1
            ;;
    esac
done

log_verbose() {
    if [[ "$VERBOSE" == "true" ]]; then
        echo "[VERBOSE] $1"
    fi
}

log_debug() {
    if [[ "$DEBUG" == "true" ]]; then
        echo "[DEBUG] $1"
    fi
}

echo "=========================================="
echo "MongoDB Compare - Starting Application"
echo "=========================================="
echo ""

# Check if Docker is running
log_verbose "Checking if Docker is running..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi
log_verbose "✓ Docker is running"

# Stop any existing containers
log_verbose "Stopping existing containers..."
docker-compose down 2>/dev/null || true
echo "✓ Existing containers stopped"

# Build and start the application
echo "Building and starting MongoDB Compare..."
if [[ "$DEBUG" == "true" ]]; then
    docker-compose up -d --build
else
    docker-compose up -d --build
fi

# Verify Docker build succeeded
if [ $? -ne 0 ]; then
    echo "❌ Docker build failed. Please check the logs above."
    exit 1
fi
echo "✓ Docker build completed"

# Wait for services to initialize
echo "Waiting for services to initialize..."
sleep 30

# Verify containers are running
log_verbose "Checking if containers are running..."
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ Containers are not running. Please check the logs."
    exit 1
fi
log_verbose "✓ Containers are running"

# Verify health checks
log_verbose "Checking service health..."

# Check nginx is responding
if ! curl -s http://localhost:80/health > /dev/null 2>&1; then
    echo "❌ Nginx health check failed"
    exit 1
fi
log_verbose "✓ Nginx is healthy"

# Check MongoDB is responding
if ! docker exec mongo-compare-mongo-1 mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "❌ MongoDB health check failed"
    exit 1
fi
log_verbose "✓ MongoDB is healthy"

# Check Rust backend is responding (backend now binds 127.0.0.1 only inside its
# container, so check from inside the container rather than the host)
if ! docker exec mongo-compare-mongo-diff-1 curl -s http://127.0.0.1:3001/health > /dev/null 2>&1; then
    echo "❌ Backend health check failed"
    exit 1
fi
log_verbose "✓ Backend is healthy"

echo ""
echo "=========================================="
echo "MongoDB Compare is now running!"
echo "=========================================="
echo ""
echo "🌐 Web application: http://localhost:80"
echo "📊 MongoDB: localhost:27017"
echo "🔧 Backend API: http://localhost:80/api (proxied by nginx)"
echo ""
echo "To stop: docker-compose down"
echo ""
