#!/bin/bash

# MongoDB Compare - End-to-End Test Script
# Starts the application with MongoDB and runs integration tests

set -e

echo "=========================================="
echo "MongoDB Compare - End-to-End Test"
echo "=========================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Stop any existing containers
echo "Stopping existing containers..."
docker-compose down -v 2>/dev/null || true
echo "✓ Existing containers stopped"
echo ""

# Build and start the application
echo "Building and starting MongoDB Compare..."
docker-compose up -d --build 2>&1 | grep -v "WARNING" || true

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
