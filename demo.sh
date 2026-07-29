#!/bin/bash

# Build and serve the MongoDB Compare demo

echo "=========================================="
echo "MongoDB Compare Demo Builder"
echo "=========================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✓ Docker is running"

# Build the application
echo ""
echo "Building application..."
docker-compose build mongo-diff 2>&1 | tail -5

# Start the application
echo ""
echo "Starting application..."
docker-compose up -d 2>&1 | grep -v "WARNING" || true

# Wait for containers to be ready
echo ""
echo "Waiting for containers to be ready..."
sleep 15

# Open the demo in browser
echo ""
echo "Opening demo in browser..."
if command -v open &> /dev/null; then
    open http://localhost:80
    open demo.html
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:80
    xdg-open demo.html
elif command -v start &> /dev/null; then
    start http://localhost:80
    start demo.html
else
    echo "Open http://localhost:80 in your browser"
    echo "Open demo.html in your browser"
fi

echo ""
echo "=========================================="
echo "Demo is ready!"
echo "=========================================="
echo ""
echo "Application: http://localhost:80"
echo "Demo Page:   demo.html"
echo ""
echo "Press Ctrl+C to stop the application"
echo ""

# Keep the script running
docker-compose logs -f mongo-diff
