#!/bin/bash

##############################################################################
# Validation Team Execution Script
# OpenAPI, TypeScript, and Schema validation across all projects
##############################################################################

set -e

WORKSPACE_ROOT="/Users/flux423/Sites/LLM"
REPORT_DIR="$WORKSPACE_ROOT/OSSA/.agents/reports"
mkdir -p "$REPORT_DIR"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[VALIDATION]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

PROJECTS=(
    "OSSA"
    "agent-buildkit"
    "llm-platform"
    "common_npm/agent-brain"
    "common_npm/agent-mesh"
    "common_npm/agent-router"
    "common_npm/agent-studio"
    "common_npm/workflow-engine"
)

VALIDATION_ERRORS=0
VALIDATION_WARNINGS=0

##############################################################################
# OpenAPI Validator Agent
##############################################################################
validate_openapi() {
    log "======================================================================"
    log "OPENAPI VALIDATION"
    log "======================================================================"
    
    for project in "${PROJECTS[@]}"; do
        project_path="$WORKSPACE_ROOT/$project"
        
        if [ ! -d "$project_path" ]; then
            continue
        fi
        
        log "Validating: $project"
        
        # Find OpenAPI specs
        find "$project_path" -name "openapi.yaml" -o -name "openapi.yml" -o -name "*openapi*.yaml" | while read -r spec; do
            log "  Checking: $(basename $spec)"
            
            # Validate with Redocly if available
            if command -v npx &> /dev/null; then
                if npx @redocly/cli lint "$spec" 2>&1 | grep -q "error"; then
                    ((VALIDATION_ERRORS++))
                    error "  ❌ Validation failed"
                else
                    log "  ✅ Valid"
                fi
            fi
        done
    done
}

##############################################################################
# TypeScript Validator Agent
##############################################################################
validate_typescript() {
    log "======================================================================"
    log "TYPESCRIPT VALIDATION"
    log "======================================================================"
    
    for project in "${PROJECTS[@]}"; do
        project_path="$WORKSPACE_ROOT/$project"
        
        if [ ! -d "$project_path" ]; then
            continue
        fi
        
        if [ ! -f "$project_path/tsconfig.json" ]; then
            warn "No tsconfig.json in $project, skipping"
            continue
        fi
        
        log "Validating TypeScript: $project"
        cd "$project_path"
        
        # Run TypeScript compiler
        if command -v npx &> /dev/null; then
            if npx tsc --noEmit 2>&1 | tee "$REPORT_DIR/${project//\//-}-tsc.log" | grep -q "error TS"; then
                ((VALIDATION_ERRORS++))
                error "  ❌ TypeScript errors found"
            else
                log "  ✅ No TypeScript errors"
            fi
        fi
    done
}

##############################################################################
# Schema Validator Agent
##############################################################################
validate_schemas() {
    log "======================================================================"
    log "JSON SCHEMA VALIDATION"
    log "======================================================================"
    
    for project in "${PROJECTS[@]}"; do
        project_path="$WORKSPACE_ROOT/$project"
        
        if [ ! -d "$project_path" ]; then
            continue
        fi
        
        log "Validating schemas: $project"
        
        # Find schema files
        find "$project_path" -name "*schema*.json" ! -path "*/node_modules/*" | while read -r schema; do
            log "  Checking: $(basename $schema)"
            
            # Basic JSON validation
            if python3 -m json.tool "$schema" > /dev/null 2>&1; then
                log "  ✅ Valid JSON"
            else
                ((VALIDATION_ERRORS++))
                error "  ❌ Invalid JSON"
            fi
        done
    done
}

##############################################################################
# Main Execution
##############################################################################
main() {
    log "█████████████████████████████████████████████████████████████████████"
    log "VALIDATION TEAM - Starting"
    log "█████████████████████████████████████████████████████████████████████"
    
    validate_openapi
    validate_typescript
    validate_schemas
    
    log "█████████████████████████████████████████████████████████████████████"
    log "VALIDATION SUMMARY"
    log "█████████████████████████████████████████████████████████████████████"
    log "Errors:   $VALIDATION_ERRORS"
    log "Warnings: $VALIDATION_WARNINGS"
    log "Reports saved to: $REPORT_DIR"
    
    if [ $VALIDATION_ERRORS -gt 0 ]; then
        error "Validation completed with errors"
        exit 1
    else
        log "✅ All validations passed!"
    fi
}

main "$@"

