#!/bin/bash

# MongoDB Compare - End-to-End Test Script
# Starts the application with MongoDB and runs integration tests
# Usage: ./demo-e2e.sh [--verbose] [--debug]

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
echo "MongoDB Compare - End-to-End Test"
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
docker-compose down -v 2>/dev/null || true
echo "✓ Existing containers stopped"
echo ""

# Build and start the application
echo "Building and starting MongoDB Compare..."
if [[ "$DEBUG" == "true" ]]; then
    docker-compose up -d --build 2>&1 | grep -v "WARNING" || true
else
    docker-compose up -d --build > /dev/null 2>&1 || true
fi

echo "Waiting for services to initialize (30 seconds)..."
sleep 30

# Verify services are running
echo ""
echo "Verifying services..."
if ! curl -s http://localhost:80/ > /dev/null 2>&1; then
    echo "❌ MongoDB Compare UI is not running"
    exit 1
fi
echo "✓ MongoDB Compare UI is running on http://localhost:80"

if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "❌ MongoDB Compare API is not running"
    exit 1
fi
echo "✓ MongoDB Compare API is running on port 3001"

if ! docker exec mongo-compare-mongo-1 mongosh --quiet --eval 'db.adminCommand("ping")' > /dev/null 2>&1; then
    echo "❌ MongoDB is not running"
    exit 1
fi
echo "✓ MongoDB is running on port 27017"

echo ""
echo "=========================================="
echo "Running Integration Tests"
echo "=========================================="
echo ""

# Verify CSS build first
echo "Verifying CSS build..."
if ! ./verify-css.sh > /dev/null 2>&1; then
    echo "❌ CSS verification failed!"
    exit 1
fi
echo "✓ CSS verification passed"
echo ""

# Run integration tests
if command -v python3 &> /dev/null; then
    python3 test/run_tests.py
else
    echo "❌ Python 3 is required to run integration tests"
    exit 1
fi

echo ""
echo "=========================================="
echo "End-to-End Test Complete"
echo "=========================================="
echo ""
echo "MongoDB Compare is running at: http://localhost:80"
echo "Use the web UI to configure source/target databases and run comparisons"
echo ""
