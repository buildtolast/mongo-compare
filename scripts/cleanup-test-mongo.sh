#!/usr/bin/env bash
# Integration Test Cleanup Script
# This script stops the MongoDB test container

set -e

echo "Stopping MongoDB container..."

if docker ps | grep -q mongo-compare-test; then
  docker stop mongo-compare-test
  echo "MongoDB container stopped."
else
  echo "No MongoDB container running."
fi
