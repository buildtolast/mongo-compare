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

# Verify CSS build
if ! ./check-css.sh > /dev/null 2>&1; then
    echo "❌ CSS verification failed. Building UI..."
    cd mongo-diff-ui && npm run build > /dev/null 2>&1
    cd ..
fi

# Build and start the application
echo "Building and starting MongoDB Compare..."
if [[ "$DEBUG" == "true" ]]; then
    docker-compose up -d --build 2>&1 | grep -v "WARNING" || true
else
    docker-compose up -d --build > /dev/null 2>&1 || true
fi

echo "Waiting for services to initialize (30 seconds)..."
sleep 30

echo ""
echo "=========================================="
echo "MongoDB Compare is now running!"
echo "=========================================="
echo ""
echo "🌐 Access the web application at: http://localhost:80"
echo "📊 MongoDB is running on: localhost:27017"
echo "🔧 MongoDB Compare API is running on: http://localhost:3001"
echo ""
echo "To stop the application, run: docker-compose down"
echo ""
