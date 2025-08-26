#!/bin/bash

# OAAS Validation API Server Build Script
# Optimized for OrbStack on macOS

set -e

echo "🚀 Building OAAS Validation API Server..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
echo "❌ Docker is not running. Please start Docker/OrbStack first."
exit 1
fi

# Build production image
echo "📦 Building production image..."
docker-compose build oaas-validation-api

# Build development image
echo "🔧 Building development image..."
docker-compose build oaas-validation-api-dev

echo "✅ Build completed successfully!"
echo ""
echo "To start the services:"
echo " Production: docker-compose up -d oaas-validation-api"
echo " Development: docker-compose --profile dev up -d oaas-validation-api-dev"
echo ""
echo "Health check:"
echo " Production: curl http://localhost:3000/health"
echo " Development: curl http://localhost:3001/health"