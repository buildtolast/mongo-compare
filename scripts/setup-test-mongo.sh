#!/usr/bin/env bash
# Integration Test Setup Script
# This script starts a MongoDB container and loads test data

set -e

echo "Starting MongoDB container for integration tests..."

# Start MongoDB container
docker run -d \
  --name mongo-compare-test \
  -p 27017:27017 \
  --rm \
  mongo:7.0

echo "Waiting for MongoDB to be ready..."
sleep 10

# Check if MongoDB is ready
docker exec mongo-compare-test mongosh --eval "db.adminCommand('ping')" || {
  echo "MongoDB failed to start"
  docker stop mongo-compare-test
  exit 1
}

echo "MongoDB is ready!"
echo "Container ID: $(docker ps -q -f name=mongo-compare-test)"
echo "Connection: mongodb://localhost:27017"

# Load test data for a specific scenario
if [ -n "$1" ]; then
  SCENARIO=$1
  echo "Loading test data for scenario: $SCENARIO"
  
  if [ -d "tests/fixtures/$SCENARIO" ]; then
    mongorestore --host localhost --port 27017 \
      --db mongo-compare-test \
      --drop \
      tests/fixtures/$SCENARIO/
  else
    echo "Scenario directory not found: tests/fixtures/$SCENARIO"
    exit 1
  fi
fi

echo ""
echo "To stop the container: docker stop mongo-compare-test"
echo "To connect: mongosh mongodb://localhost:27017"
