#!/bin/bash

# Test Docker Build Script for Dashboard Hub
echo "🐳 Testing Dashboard Hub Docker Build..."

# Clean up any existing containers/images
echo "🧹 Cleaning up existing containers..."
docker stop dashboard-hub-test 2>/dev/null || true
docker rm dashboard-hub-test 2>/dev/null || true
docker rmi dashboard-hub:test 2>/dev/null || true

# Build the Docker image
echo "🔨 Building Docker image..."
docker build -t dashboard-hub:test . --no-cache

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

echo "✅ Docker build successful!"

# Test run the container
echo "🚀 Testing container startup..."
docker run -d \
    --name dashboard-hub-test \
    -p 3001:3000 \
    -e NODE_ENV=production \
    -e NEXT_TELEMETRY_DISABLED=1 \
    dashboard-hub:test

if [ $? -ne 0 ]; then
    echo "❌ Container startup failed!"
    exit 1
fi

# Wait for container to start
echo "⏳ Waiting for container to start..."
sleep 10

# Test health endpoint
echo "🔍 Testing health endpoint..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health)

if [ "$HEALTH_CHECK" = "200" ]; then
    echo "✅ Health check passed! Container is healthy."
    echo "🌐 Test URL: http://localhost:3001"
    echo ""
    echo "📊 Container stats:"
    docker stats dashboard-hub-test --no-stream
    echo ""
    echo "🗂️ Container logs (last 20 lines):"
    docker logs dashboard-hub-test --tail=20
else
    echo "❌ Health check failed! HTTP status: $HEALTH_CHECK"
    echo "🗂️ Container logs:"
    docker logs dashboard-hub-test
fi

# Cleanup
echo ""
echo "🧹 Cleaning up test container..."
docker stop dashboard-hub-test
docker rm dashboard-hub-test

echo "✅ Docker test completed!"
echo ""
echo "🚀 To deploy to production:"
echo "   docker-compose -f docker-compose.prod.yml up -d --build"
