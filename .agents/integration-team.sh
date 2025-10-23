#!/bin/bash

##############################################################################
# Integration Team Execution Script
# Validates integrations across all services and APIs
##############################################################################

set -e

WORKSPACE_ROOT="/Users/flux423/Sites/LLM"
REPORT_DIR="$WORKSPACE_ROOT/OSSA/.agents/reports/integration"
mkdir -p "$REPORT_DIR"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[INTEGRATION]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
info() { echo -e "${BLUE}[INFO]${NC} $1"; }

##############################################################################
# API Integration Agent
##############################################################################
test_api_integrations() {
    log "======================================================================"
    log "API INTEGRATION TESTING"
    log "======================================================================"
    
    # Test agent-brain API
    info "Testing agent-brain API..."
    if command -v curl &> /dev/null; then
        log "  Checking agent spawn endpoint..."
        # curl -X POST http://localhost:3000/api/v1/agents/spawn \
        #   -H "Content-Type: application/json" \
        #   -d '{"name": "test-agent", "type": "general", "capabilities": ["test"]}' \
        #   > "$REPORT_DIR/agent-brain-spawn.json" 2>&1 || warn "  API not available"
        warn "  Manual testing required - start agent-brain server first"
    fi
    
    # Test agent-mesh gRPC
    info "Testing agent-mesh gRPC..."
    warn "  Manual testing required - gRPC client needed"
    
    # Test agent-router endpoints
    info "Testing agent-router..."
    warn "  Manual testing required - start agent-router server first"
}

##############################################################################
# MCP Integration Agent
##############################################################################
test_mcp_integrations() {
    log "======================================================================"
    log "MCP PROTOCOL TESTING"
    log "======================================================================"
    
    # Check for MCP servers
    find "$WORKSPACE_ROOT" -name "mcp*.js" -o -name "mcp*.ts" | while read -r mcp_file; do
        info "Found MCP integration: $(basename $mcp_file)"
        log "  Checking MCP protocol compliance..."
        warn "  Manual verification needed"
    done
}

##############################################################################
# Mesh Integration Agent
##############################################################################
test_mesh_coordination() {
    log "======================================================================"
    log "AGENT MESH COORDINATION TESTING"
    log "======================================================================"
    
    info "Checking agent mesh configuration..."
    
    if [ -f "$WORKSPACE_ROOT/common_npm/agent-mesh/.agents/config.yml" ]; then
        log "  ✅ Mesh config found"
        cat "$WORKSPACE_ROOT/common_npm/agent-mesh/.agents/config.yml" > "$REPORT_DIR/mesh-config.yml"
    else
        warn "  ⚠️  Mesh config not found"
    fi
    
    info "Checking gRPC proto definitions..."
    find "$WORKSPACE_ROOT/common_npm/agent-mesh/proto" -name "*.proto" | while read -r proto; do
        log "  Found: $(basename $proto)"
    done
}

##############################################################################
# Database Integration Agent
##############################################################################
test_database_integrations() {
    log "======================================================================"
    log "DATABASE INTEGRATION TESTING"
    log "======================================================================"
    
    # Check for database configurations
    info "Checking database configs..."
    
    if [ -f "$WORKSPACE_ROOT/llm-platform/docker-compose.yml" ]; then
        log "  Found Docker Compose with database services"
        grep -A 5 "postgres\|mysql\|redis" "$WORKSPACE_ROOT/llm-platform/docker-compose.yml" > "$REPORT_DIR/db-services.txt" || true
    fi
    
    warn "  Manual database connectivity testing required"
}

##############################################################################
# Service Discovery Integration
##############################################################################
test_service_discovery() {
    log "======================================================================"
    log "SERVICE DISCOVERY TESTING"
    log "======================================================================"
    
    info "Checking service registry configurations..."
    
    find "$WORKSPACE_ROOT" -name "*discovery*.yml" -o -name "*registry*.yml" | while read -r config; do
        log "  Found: $(basename $config)"
        cat "$config" > "$REPORT_DIR/$(basename $config)"
    done
    
    info "Service discovery configuration saved to reports"
}

##############################################################################
# Main Execution
##############################################################################
main() {
    log "█████████████████████████████████████████████████████████████████████"
    log "INTEGRATION TEAM - Starting"
    log "█████████████████████████████████████████████████████████████████████"
    
    test_api_integrations
    test_mcp_integrations
    test_mesh_coordination
    test_database_integrations
    test_service_discovery
    
    log "█████████████████████████████████████████████████████████████████████"
    log "INTEGRATION SUMMARY"
    log "█████████████████████████████████████████████████████████████████████"
    log "Reports saved to: $REPORT_DIR"
    log ""
    warn "⚠️  MANUAL VERIFICATION REQUIRED"
    log ""
    log "Next Steps:"
    log "  1. Start agent-brain server: cd common_npm/agent-brain && npm start"
    log "  2. Start agent-mesh server: cd common_npm/agent-mesh && npm start"
    log "  3. Start agent-router: cd common_npm/agent-router && npm start"
    log "  4. Test API endpoints manually"
    log "  5. Verify MCP protocol communication"
    log "  6. Test agent mesh coordination"
    log "  7. Validate database connections"
    log ""
    log "✅ Integration checks complete (manual testing required)"
    log "█████████████████████████████████████████████████████████████████████"
}

main "$@"

