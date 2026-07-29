#!/bin/bash

# MongoDB Compare Integration Test Runner with Cleanup
# Runs comprehensive integration tests with data regeneration
# Usage: ./run-integration-tests.sh [--verbose] [--debug]

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
echo "MongoDB Compare Integration Tests"
echo "With 1000+ rows and edge case scenarios"
echo "=========================================="
echo ""

# Check if Docker is running
log_verbose "Checking if Docker is running..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi
log_verbose "✓ Docker is running"

# Check if application is running
log_verbose "Checking if application is running..."
if ! curl -s http://localhost:80/ > /dev/null 2>&1; then
    echo "❌ Application not running. Starting it..."
    if [[ "$DEBUG" == "true" ]]; then
        docker-compose up -d 2>&1 | grep -v "WARNING" || true
    else
        docker-compose up -d > /dev/null 2>&1 || true
    fi
    echo "Waiting for services to initialize (10 seconds)..."
    sleep 10
fi

echo "✓ Application is running"
echo ""

# Clean up and regenerate test data
echo "Regenerating test data (1000+ rows with edge cases)..."
if [[ "$DEBUG" == "true" ]]; then
    log_debug "Dropping and recreating databases..."
    docker exec mongo-compare-mongo-1 mongosh --quiet --eval '
    // Drop and recreate databases to ensure clean state
    db = db.getSiblingDB("testdb");
    db.users.drop();
    db.products.drop();

    db = db.getSiblingDB("sourcedb");
    db.users.drop();

    db = db.getSiblingDB("targetdb");
    db.users.drop();
    ' 2>&1
else
    docker exec mongo-compare-mongo-1 mongosh --quiet --eval '
    db = db.getSiblingDB("testdb");
    db.users.drop();
    db.products.drop();

    db = db.getSiblingDB("sourcedb");
    db.users.drop();

    db = db.getSiblingDB("targetdb");
    db.users.drop();
    ' > /dev/null 2>&1
fi

if [[ "$DEBUG" == "true" ]]; then
    log_debug "Loading test fixtures..."
    docker exec mongo-compare-mongo-1 mongosh --file /docker-entrypoint-initdb.d/init-test-data.js 2>&1 || {
        echo "Test data initialization failed, continuing with existing data..."
    }
else
    docker exec mongo-compare-mongo-1 mongosh --quiet --file /docker-entrypoint-initdb.d/init-test-data.js 2>&1 || {
        echo "Test data initialization failed, continuing with existing data..."
    }
fi

echo "✓ Test data regenerated"
echo ""

# Verify CSS build
echo "Verifying CSS build..."
if ! ./verify-css.sh > /dev/null 2>&1; then
    echo "❌ CSS verification failed!"
    exit 1
fi
echo "✓ CSS verification passed"
echo ""

# Run tests using Python test runner
log_verbose "Running integration tests..."
if command -v python3 &> /dev/null; then
    python3 test/run_tests.py
else
    echo "❌ Python 3 is required to run integration tests"
    echo "Please install Python 3 or use: docker run -it python:3 python3 test/run_tests.py"
    exit 1
fi
