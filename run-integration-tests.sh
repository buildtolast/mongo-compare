#!/bin/bash

# MongoDB Compare Integration Test Runner
# Runs comprehensive integration tests without needing to understand the codebase

set -e

echo "=========================================="
echo "MongoDB Compare Integration Tests"
echo "=========================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if application is running
echo "Checking if application is running..."
if ! curl -s http://localhost:80/ > /dev/null 2>&1; then
    echo "❌ Application not running. Starting it..."
    docker-compose up -d 2>&1 | grep -v "WARNING" || true
    sleep 10
fi

echo "✓ Application is running"
echo ""

# Run tests using Python test runner
if command -v python3 &> /dev/null; then
    python3 test/run_tests.py
else
    echo "❌ Python 3 is required to run integration tests"
    echo "Please install Python 3 or use: docker run -it python:3 python3 test/run_tests.py"
    exit 1
fi
