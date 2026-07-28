#!/usr/bin/env bash
# Run Integration Tests with Docker MongoDB
# This script starts a MongoDB container, runs integration tests, and cleans up

set -e

echo "========================================"
echo "Running Integration Tests with Docker"
echo "========================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"

# Start MongoDB container
echo "🐳 Starting MongoDB container..."
CONTAINER_ID=$(docker run -d --name mongo-compare-integration -p 27017:27017 --rm mongo:7.0)
echo "✅ MongoDB container started (ID: ${CONTAINER_ID:0:12})"

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
for i in {1..30}; do
    if docker exec "$CONTAINER_ID" mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo "✅ MongoDB is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ MongoDB failed to start"
        docker stop "$CONTAINER_ID" > /dev/null 2>&1
        exit 1
    fi
    sleep 1
done

# Run integration tests
echo ""
echo "🧪 Running integration tests..."
echo ""
if ! cargo test --test integration; then
    echo ""
    echo "❌ Integration tests failed"
    docker stop "$CONTAINER_ID" > /dev/null 2>&1
    exit 1
fi

echo ""
echo "✅ Integration tests passed"

# Cleanup
echo ""
echo "🗑️  Cleaning up..."
docker stop "$CONTAINER_ID" > /dev/null 2>&1
echo "✅ MongoDB container stopped"

echo ""
echo "========================================"
echo "Integration Tests Complete"
echo "========================================"
