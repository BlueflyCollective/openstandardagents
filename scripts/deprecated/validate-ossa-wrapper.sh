#!/bin/bash

# =============================================================================
# DEPRECATED SCRIPT WRAPPER
# =============================================================================
# This script is DEPRECATED and will be removed in December 2025
# Use the new CLI commands instead: `ossa validate`
#
# Migration: https://ossa.agents/docs/migration
# Timeline:
#   Phase 1 (Sep-Oct 2025): Deprecation warnings
#   Phase 2 (Oct-Nov 2025): Redirect with confirmation  
#   Phase 3 (Nov-Dec 2025): Error and exit
#   Phase 4 (Dec 2025+): Complete removal
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Get current phase based on date
CURRENT_DATE=$(date +%Y%m%d)
PHASE_1_START=20250902
PHASE_2_START=20251001  
PHASE_3_START=20251101
PHASE_4_START=20251201

# Determine current migration phase
if [ "$CURRENT_DATE" -lt "$PHASE_2_START" ]; then
    MIGRATION_PHASE=1
elif [ "$CURRENT_DATE" -lt "$PHASE_3_START" ]; then
    MIGRATION_PHASE=2
elif [ "$CURRENT_DATE" -lt "$PHASE_4_START" ]; then
    MIGRATION_PHASE=3
else
    MIGRATION_PHASE=4
fi

show_deprecation_warning() {
    echo -e "${YELLOW}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║                              🚨 DEPRECATION NOTICE 🚨                        ║${NC}"
    echo -e "${YELLOW}╠══════════════════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${YELLOW}║ This script is DEPRECATED and will be removed in December 2025              ║${NC}"
    echo -e "${YELLOW}║                                                                              ║${NC}"
    echo -e "${YELLOW}║ Migration Phase ${MIGRATION_PHASE}/4 - See: ${BLUE}docs/MIGRATION_GUIDE.md${YELLOW}                       ║${NC}"
    echo -e "${YELLOW}║                                                                              ║${NC}"
    echo -e "${YELLOW}║ ${RED}OLD:${YELLOW} node validate-ossa-v0.1.3.js <path>                              ║${NC}"
    echo -e "${YELLOW}║ ${GREEN}NEW:${YELLOW} ossa validate [path]                                           ║${NC}"
    echo -e "${YELLOW}║                                                                              ║${NC}"
    echo -e "${YELLOW}║ Install CLI: npm install -g @bluefly/open-standards-scalable-agents@0.1.3   ║${NC}"
    echo -e "${YELLOW}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

run_legacy_with_warning() {
    show_deprecation_warning
    
    # Determine which script to run based on wrapper name
    SCRIPT_NAME=$(basename "$0")
    TARGET_PATH=""
    
    case "$SCRIPT_NAME" in
        "validate-ossa-v0.1.3-wrapper.sh"|"validate-ossa-wrapper.sh")
            if [ -f "validate-ossa-v0.1.3.js" ]; then
                TARGET_PATH="validate-ossa-v0.1.3.js"
            elif [ -f "lib/tools/validation/validate-ossa-v0.1.3.js" ]; then
                TARGET_PATH="lib/tools/validation/validate-ossa-v0.1.3.js"
            fi
            ;;
        "validate-ossa-v0.1.2-wrapper.sh")
            if [ -f "lib/tools/validation/validate-ossa-v0.1.2.js" ]; then
                TARGET_PATH="lib/tools/validation/validate-ossa-v0.1.2.js"
            fi
            ;;
        "validate-oaas-wrapper.sh")
            if [ -f "lib/tools/validation/validate-oaas-v1.3.0.js" ]; then
                TARGET_PATH="lib/tools/validation/validate-oaas-v1.3.0.js"
            fi
            ;;
    esac
    
    if [ -z "$TARGET_PATH" ]; then
        echo -e "${RED}❌ Error: Legacy script not found${NC}"
        echo -e "${BLUE}💡 Install and use the CLI instead: ossa validate${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}⚠️  Running legacy script with deprecation warning...${NC}"
    echo -e "${BLUE}   Script: $TARGET_PATH${NC}"
    echo -e "${BLUE}   Args: $@${NC}"
    echo ""
    
    # Run the legacy script
    node "$TARGET_PATH" "$@"
    
    echo ""
    echo -e "${GREEN}✅ Legacy validation completed${NC}"
    echo -e "${YELLOW}🔄 To migrate, run: ${BLUE}ossa validate ${1:-'.'} ${NC}"
}

run_cli_with_confirmation() {
    show_deprecation_warning
    
    echo -e "${BLUE}🔄 This script now redirects to the new CLI command${NC}"
    echo -e "${BLUE}   Command: ${GREEN}ossa validate ${1:-'.'}${NC}"
    echo ""
    
    # Check if CLI is installed
    if ! command -v ossa &> /dev/null; then
        echo -e "${RED}❌ OSSA CLI not found. Please install it:${NC}"
        echo -e "${BLUE}   npm install -g @bluefly/open-standards-scalable-agents@0.1.3${NC}"
        exit 1
    fi
    
    # Ask for confirmation
    read -p "Run the new CLI command? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}🚀 Running: ossa validate ${1:-'.'}${NC}"
        echo ""
        ossa validate "${1:-.}"
    else
        echo -e "${YELLOW}⚠️  Migration cancelled. Please use CLI manually: ${BLUE}ossa validate${NC}"
        exit 1
    fi
}

show_error_and_exit() {
    show_deprecation_warning
    
    echo -e "${RED}❌ This legacy script is no longer functional${NC}"
    echo -e "${RED}   Migration Phase 3: Scripts require CLI commands${NC}"
    echo ""
    echo -e "${BLUE}Please use the new CLI command:${NC}"
    echo -e "${GREEN}   ossa validate ${1:-'.'}${NC}"
    echo ""
    echo -e "${BLUE}Installation:${NC}"
    echo -e "${GREEN}   npm install -g @bluefly/open-standards-scalable-agents@0.1.3${NC}"
    echo ""
    
    exit 1
}

script_removed() {
    echo -e "${RED}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                🗑️  SCRIPT REMOVED 🗑️                          ║${NC}"
    echo -e "${RED}╠══════════════════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${RED}║ This legacy script has been completely removed                              ║${NC}"
    echo -e "${RED}║                                                                              ║${NC}"
    echo -e "${RED}║ Use the CLI command: ${GREEN}ossa validate [path]${RED}                                ║${NC}"
    echo -e "${RED}║                                                                              ║${NC}"
    echo -e "${RED}║ Install: npm install -g @bluefly/open-standards-scalable-agents@0.1.3      ║${NC}"
    echo -e "${RED}║ Help: ossa --help                                                           ║${NC}"
    echo -e "${RED}║ Docs: https://ossa.agents/docs/migration                                    ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    exit 1
}

# Execute based on migration phase
case $MIGRATION_PHASE in
    1)
        echo -e "${BLUE}🔍 Migration Phase 1: Warning mode${NC}"
        run_legacy_with_warning "$@"
        ;;
    2)
        echo -e "${YELLOW}🔄 Migration Phase 2: Redirect mode${NC}"
        run_cli_with_confirmation "$@"
        ;;
    3)
        echo -e "${RED}⛔ Migration Phase 3: Error mode${NC}"
        show_error_and_exit "$@"
        ;;
    4)
        echo -e "${RED}🗑️  Migration Phase 4: Removed${NC}"
        script_removed
        ;;
esac