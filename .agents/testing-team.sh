#!/bin/bash

##############################################################################
# Testing Team Execution Script
# Runs tests and generates coverage reports across all projects
##############################################################################

set -e

WORKSPACE_ROOT="/Users/flux423/Sites/LLM"
REPORT_DIR="$WORKSPACE_ROOT/OSSA/.agents/reports/testing"
mkdir -p "$REPORT_DIR"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[TESTING]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

PROJECTS=(
    "OSSA"
    "agent-buildkit"
    "common_npm/agent-brain"
    "common_npm/agent-mesh"
    "common_npm/agent-router"
    "common_npm/agent-studio"
    "common_npm/workflow-engine"
    "common_npm/agentic-flows"
    "gitlab_components"
)

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

##############################################################################
# Test Coverage Agent
##############################################################################
run_tests_with_coverage() {
    log "======================================================================"
    log "TEST COVERAGE ANALYSIS"
    log "======================================================================"
    
    for project in "${PROJECTS[@]}"; do
        project_path="$WORKSPACE_ROOT/$project"
        
        if [ ! -d "$project_path" ]; then
            continue
        fi
        
        if [ ! -f "$project_path/package.json" ]; then
            warn "No package.json in $project, skipping"
            continue
        fi
        
        log "Testing: $project"
        cd "$project_path"
        
        # Check if test script exists
        if grep -q '"test":' package.json; then
            log "  Running tests..."
            
            if npm test 2>&1 | tee "$REPORT_DIR/${project//\//-}-tests.log"; then
                log "  ✅ Tests passed"
                ((PASSED_TESTS++))
            else
                error "  ❌ Tests failed"
                ((FAILED_TESTS++))
            fi
        else
            warn "  No test script defined"
        fi
        
        # Check for coverage
        if grep -q '"coverage":' package.json; then
            log "  Generating coverage report..."
            npm run coverage 2>&1 | tee "$REPORT_DIR/${project//\//-}-coverage.log" || warn "  Coverage generation failed"
        fi
    done
}

##############################################################################
# API Testing Agent
##############################################################################
run_api_tests() {
    log "======================================================================"
    log "API CONTRACT TESTING"
    log "======================================================================"
    
    for project in "${PROJECTS[@]}"; do
        project_path="$WORKSPACE_ROOT/$project"
        
        if [ ! -d "$project_path" ]; then
            continue
        fi
        
        # Find OpenAPI specs and run contract tests
        find "$project_path" -name "openapi.yaml" -o -name "openapi.yml" | while read -r spec; do
            log "Testing API contract: $(basename $spec)"
            
            # Use Dredd if available
            if command -v npx &> /dev/null; then
                if [ -f "$project_path/dredd.yml" ]; then
                    cd "$project_path"
                    npx dredd 2>&1 | tee "$REPORT_DIR/${project//\//-}-dredd.log" || warn "  Contract tests failed"
                fi
            fi
        done
    done
}

##############################################################################
# Main Execution
##############################################################################
main() {
    log "█████████████████████████████████████████████████████████████████████"
    log "TESTING TEAM - Starting"
    log "█████████████████████████████████████████████████████████████████████"
    
    run_tests_with_coverage
    run_api_tests
    
    log "█████████████████████████████████████████████████████████████████████"
    log "TESTING SUMMARY"
    log "█████████████████████████████████████████████████████████████████████"
    log "Projects Tested: ${#PROJECTS[@]}"
    log "Tests Passed:    $PASSED_TESTS"
    log "Tests Failed:    $FAILED_TESTS"
    log "Reports saved to: $REPORT_DIR"
    
    if [ $FAILED_TESTS -gt 0 ]; then
        error "Testing completed with failures"
        exit 1
    else
        log "✅ All tests passed!"
    fi
}

main "$@"

