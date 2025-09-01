#!/bin/bash

# Dashboard Hub Deployment Script
set -e

echo "🚀 Dashboard Hub Deployment Script"
echo "=================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists docker; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command_exists docker-compose; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Environment setup
echo ""
echo "⚙️  Setting up environment..."

# Create .env.production if it doesn't exist
if [ ! -f .env.production ]; then
    echo "📝 Creating .env.production from template..."
    cp .env.production.template .env.production
    echo "⚠️  Please edit .env.production with your actual values before continuing!"
    echo "   Required variables:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo "   - NEXT_PUBLIC_APP_URL"
    echo ""
    read -p "Press Enter after you've updated .env.production..."
fi

# Export environment variables
if [ -f .env.production ]; then
    echo "📁 Loading environment variables from .env.production..."
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Build test
echo ""
echo "🧪 Testing local build first..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Local build failed. Please fix the issues before deploying."
    exit 1
fi

echo "✅ Local build successful"

# Docker build test
echo ""
echo "🐳 Testing Docker build..."

# Clean up any existing test containers
docker stop dashboard-hub-test 2>/dev/null || true
docker rm dashboard-hub-test 2>/dev/null || true

# Test with simple Dockerfile
echo "🔨 Building Docker image (simple)..."
docker build -f Dockerfile.simple -t dashboard-hub:test .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed with simple Dockerfile. Trying original Dockerfile..."
    
    docker build -f Dockerfile -t dashboard-hub:test .
    
    if [ $? -ne 0 ]; then
        echo "❌ Both Docker builds failed. Please check the logs above."
        exit 1
    fi
fi

echo "✅ Docker build successful"

# Test container startup
echo ""
echo "🚀 Testing container startup..."

docker run -d \
    --name dashboard-hub-test \
    -p 3001:3000 \
    -e NODE_ENV=production \
    -e NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
    -e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY="$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY" \
    -e SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
    dashboard-hub:test

# Wait for container to start
echo "⏳ Waiting for container to start..."
sleep 15

# Test health endpoint
echo "🔍 Testing health endpoint..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health)

if [ "$HEALTH_CHECK" = "200" ]; then
    echo "✅ Health check passed! Container is working."
    echo ""
    echo "📊 Container stats:"
    docker stats dashboard-hub-test --no-stream
else
    echo "❌ Health check failed (HTTP $HEALTH_CHECK)"
    echo "📋 Container logs:"
    docker logs dashboard-hub-test
fi

# Cleanup test container
echo ""
echo "🧹 Cleaning up test container..."
docker stop dashboard-hub-test
docker rm dashboard-hub-test

# Deployment options
echo ""
echo "🎯 Deployment Options:"
echo ""
echo "1. Deploy with simple Docker Compose:"
echo "   docker-compose -f docker-compose.simple.yml up -d --build"
echo ""
echo "2. Deploy with production Docker Compose:"
echo "   docker-compose -f docker-compose.prod.yml up -d --build"
echo ""
echo "3. Manual Docker deployment:"
echo "   docker run -d --name dashboard-hub-app \\"
echo "     --restart unless-stopped \\"
echo "     -p 3000:3000 \\"
echo "     -e NODE_ENV=production \\"
echo "     -e NEXT_PUBLIC_SUPABASE_URL=\"$NEXT_PUBLIC_SUPABASE_URL\" \\"
echo "     -e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=\"$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY\" \\"
echo "     -e SUPABASE_SERVICE_ROLE_KEY=\"$SUPABASE_SERVICE_ROLE_KEY\" \\"
echo "     dashboard-hub:test"
echo ""

if [ "$HEALTH_CHECK" = "200" ]; then
    echo "✅ All tests passed! Ready for production deployment."
    echo ""
    echo "🌐 Next steps:"
    echo "1. Upload this project to your server"
    echo "2. Run this script on your server"
    echo "3. Choose a deployment option above"
    echo "4. Configure your domain and SSL"
else
    echo "⚠️  Some tests failed. Please review the issues before deploying."
fi

echo ""
echo "🎉 Deployment script completed!"
