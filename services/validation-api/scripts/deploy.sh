#!/bin/bash

# OAAS Validation API Server Deployment Script
# Optimized for OrbStack on macOS

set -e

echo "🚀 Deploying OAAS Validation API Server..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
echo "❌ Docker is not running. Please start Docker/OrbStack first."
exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start production service
echo "📦 Building and starting production service..."
docker-compose up -d --build oaas-validation-api

# Wait for service to be healthy
echo "⏳ Waiting for service to be healthy..."
timeout=60
counter=0
while [ $counter -lt $timeout ]; do
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
echo "✅ Service is healthy!"
break
fi
echo "⏳ Waiting for service... ($counter/$timeout)"
sleep 2
counter=$((counter + 2))
done

if [ $counter -ge $timeout ]; then
echo "❌ Service failed to become healthy within $timeout seconds"
echo "📋 Checking logs..."
docker-compose logs oaas-validation-api
exit 1
fi

# Test the API endpoints
echo "🧪 Testing API endpoints..."

# Test health endpoint
echo " Testing health endpoint..."
if curl -s http://localhost:3001/health | grep -q "healthy"; then
echo " ✅ Health endpoint working"
else
echo " ❌ Health endpoint failed"
fi

# Test validation endpoint
echo " Testing validation endpoint..."
test_spec='{"content":"apiVersion: openapi-ai-agents/v0.1.0\nkind: Agent\nmetadata:\n name: test\n version: 1.0.0\n description: Test agent\nspec:\n capabilities:\n - id: test\n name: Test\n description: Test capability"}'
if curl -s -X POST http://localhost:3001/api/v1/validate/openapi \
-H "Content-Type: application/json" \
-d "$test_spec" | grep -q "success"; then
echo " ✅ Validation endpoint working"
else
echo " ❌ Validation endpoint failed"
fi

# Test token estimation endpoint
echo " Testing token estimation endpoint..."
if curl -s -X POST http://localhost:3001/api/v1/estimate/tokens \
-H "Content-Type: application/json" \
-d '{"text":"Test text for token estimation"}' | grep -q "success"; then
echo " ✅ Token estimation endpoint working"
else
echo " ❌ Token estimation endpoint failed"
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Service Information:"
echo " URL: http://localhost:3001"
echo " Health: http://localhost:3001/health"
echo " Docs: http://localhost:3001/api/v1/docs"
echo ""
echo "🔧 Management Commands:"
echo " View logs: docker-compose logs -f oaas-validation-api"
echo " Stop service: docker-compose down"
echo " Restart service: docker-compose restart oaas-validation-api"
echo ""
echo "🧪 TDDAI Integration:"
echo " tddai agents health"
echo " tddai agents validate-openapi agent.yml"
echo " tddai agents estimate-tokens \"Your text here\""