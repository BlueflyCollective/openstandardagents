#!/bin/bash

# Start OpenAPI AI Agents Standard Server with TDDAI Integration

# Configuration
PORT=${PORT:-3000}
API_KEYS=${API_KEYS:-"openapi-agents-20250825-d3161e1ab2970780fda5d319c198e1af,tddai-integration-key"}
TDDAI_PATH=${TDDAI_PATH:-"/Users/flux423/Sites/LLM/common_npm/tddai"}
TDDAI_PORT=${TDDAI_PORT:-3001}

echo "🚀 Starting OpenAPI AI Agents Standard Server with TDDAI Integration"
echo "   Port: $PORT"
echo "   TDDAI Path: $TDDAI_PATH"
echo "   TDDAI Port: $TDDAI_PORT"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js to run the server."
    exit 1
fi

# Check if npm dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

# Check if TDDAI is available
if [ -d "$TDDAI_PATH" ]; then
    echo "✅ TDDAI found at: $TDDAI_PATH"
    
    # Check if TDDAI CLI is available
    if command -v tddai &> /dev/null; then
        echo "✅ TDDAI CLI is available"
    else
        echo "⚠️  TDDAI CLI not in PATH - some features may use fallback mode"
    fi
else
    echo "⚠️  TDDAI not found at $TDDAI_PATH - running in simulation mode"
fi

# Export environment variables
export PORT
export API_KEYS
export TDDAI_PATH
export TDDAI_PORT

# Start the server
echo "🌟 Starting server on http://localhost:$PORT"
echo "📖 API Documentation: http://localhost:$PORT/api/docs"
echo "🔑 API Key: openapi-agents-20250825-d3161e1ab2970780fda5d319c198e1af"
echo ""
echo "Available endpoints:"
echo "  GET  /api/v1/health"
echo "  POST /api/v1/validate/openapi"
echo "  POST /api/v1/validate/agent-config" 
echo "  POST /api/v1/validate/compliance"
echo "  POST /api/v1/agent/orchestrate"
echo "  POST /api/v1/protocols/mcp/bridge"
echo "  POST /api/v1/protocols/a2a/negotiate"
echo "  POST /api/v1/tokens/preflight"
echo "  POST /api/v1/governance/compliance/validate"
echo "  POST /api/v1/security/maestro/assess"
echo ""

# Start the server with PM2 if available, otherwise use node directly
if command -v pm2 &> /dev/null; then
    echo "🔄 Starting with PM2 for production reliability..."
    pm2 start server.js --name "openapi-agents-standard" --log-date-format="YYYY-MM-DD HH:mm:ss Z" --merge-logs
    echo "📊 Use 'pm2 logs openapi-agents-standard' to view logs"
    echo "🛑 Use 'pm2 stop openapi-agents-standard' to stop the server"
else
    echo "🔄 Starting with Node.js..."
    node server.js
fi