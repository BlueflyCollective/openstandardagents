#!/bin/bash

##############################################################################
# Cleanup Team Execution Script
# Multi-phase cleanup across all LLM projects
##############################################################################

set -e

WORKSPACE_ROOT="/Users/flux423/Sites/LLM"
DELETE_FOLDER="__DELETE_LATER"
LOG_FILE="$WORKSPACE_ROOT/cleanup-$(date +%Y%m%d-%H%M%S).log"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARN:${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] INFO:${NC} $1" | tee -a "$LOG_FILE"
}

# Projects to process
PROJECTS=(
    "OSSA"
    "agent-buildkit"
    "llm-platform"
    "common_npm/agent-brain"
    "common_npm/agent-mesh"
    "common_npm/agent-router"
    "common_npm/agent-studio"
    "common_npm/agent-chat"
    "common_npm/agent-docker"
    "common_npm/agent-protocol"
    "common_npm/agent-tracer"
    "common_npm/workflow-engine"
    "common_npm/agentic-flows"
    "common_npm/compliance-engine"
    "common_npm/doc-engine"
    "common_npm/foundation-bridge"
    "common_npm/rfp-automation"
    "common_npm/studio-ui"
    "gitlab_components"
    "all_drupal_custom"
    "technical-guide"
)

# Files to preserve (never delete)
PRESERVE_FILES=(
    "package.json"
    "package-lock.json"
    "tsconfig.json"
    "composer.json"
    "composer.lock"
    "lefthook.yml"
    "LICENSE"
    ".gitignore"
    ".npmignore"
)

# Statistics
STATS_MD_MOVED=0
STATS_SH_MOVED=0
STATS_TXT_MOVED=0
STATS_DS_MOVED=0
STATS_RENAMED=0
STATS_ERRORS=0

##############################################################################
# Phase 1: Move Forbidden Files
##############################################################################
phase1_move_forbidden_files() {
    log "======================================================================"
    log "PHASE 1: Moving Forbidden Files"
    log "======================================================================"
    
    for project in "${PROJECTS[@]}"; do
        project_path="$WORKSPACE_ROOT/$project"
        
        if [ ! -d "$project_path" ]; then
            warn "Skipping non-existent project: $project"
            continue
        fi
        
        info "Processing: $project"
        delete_dir="$project_path/$DELETE_FOLDER"
        mkdir -p "$delete_dir"
        
        # Move .md files (except critical root files)
        while IFS= read -r -d '' file; do
            filename=$(basename "$file")
            
            # Check if in preserve list
            if printf '%s\n' "${PRESERVE_FILES[@]}" | grep -q "^${filename}$"; then
                continue
            fi
            
            # Move to delete folder
            target="$delete_dir/$filename"
            counter=1
            while [ -e "$target" ]; do
                target="$delete_dir/${filename%.*}_${counter}.${filename##*.}"
                ((counter++))
            done
            
            mv "$file" "$target" 2>/dev/null && {
                ((STATS_MD_MOVED++))
                info "  Moved: $filename"
            } || {
                ((STATS_ERRORS++))
                error "  Failed to move: $filename"
            }
        done < <(find "$project_path" -type f -name "*.md" \
            ! -path "*/node_modules/*" \
            ! -path "*/vendor/*" \
            ! -path "*/.git/*" \
            ! -path "*/__DELETE_LATER/*" \
            -print0)
        
        # Move .sh files
        while IFS= read -r -d '' file; do
            filename=$(basename "$file")
            target="$delete_dir/$filename"
            counter=1
            while [ -e "$target" ]; do
                target="$delete_dir/${filename%.*}_${counter}.${filename##*.}"
                ((counter++))
            done
            
            mv "$file" "$target" 2>/dev/null && {
                ((STATS_SH_MOVED++))
                info "  Moved: $filename"
            } || {
                ((STATS_ERRORS++))
                error "  Failed to move: $filename"
            }
        done < <(find "$project_path" -type f -name "*.sh" \
            ! -path "*/node_modules/*" \
            ! -path "*/vendor/*" \
            ! -path "*/__DELETE_LATER/*" \
            -print0)
        
        # Move .txt files (except LICENSE.txt, robots.txt)
        while IFS= read -r -d '' file; do
            filename=$(basename "$file")
            
            # Preserve certain .txt files
            if [[ "$filename" == "LICENSE.txt" ]] || [[ "$filename" == "robots.txt" ]]; then
                continue
            fi
            
            target="$delete_dir/$filename"
            counter=1
            while [ -e "$target" ]; do
                target="$delete_dir/${filename%.*}_${counter}.${filename##*.}"
                ((counter++))
            done
            
            mv "$file" "$target" 2>/dev/null && {
                ((STATS_TXT_MOVED++))
                info "  Moved: $filename"
            } || {
                ((STATS_ERRORS++))
                error "  Failed to move: $filename"
            }
        done < <(find "$project_path" -type f -name "*.txt" \
            ! -path "*/node_modules/*" \
            ! -path "*/vendor/*" \
            ! -path "*/__DELETE_LATER/*" \
            -print0)
        
        # Remove .DS_Store files
        while IFS= read -r -d '' file; do
            rm "$file" 2>/dev/null && {
                ((STATS_DS_MOVED++))
                info "  Removed: .DS_Store"
            } || {
                ((STATS_ERRORS++))
                error "  Failed to remove: .DS_Store"
            }
        done < <(find "$project_path" -type f -name ".DS_Store" -print0)
        
    done
    
    log "Phase 1 Complete: MD=$STATS_MD_MOVED, SH=$STATS_SH_MOVED, TXT=$STATS_TXT_MOVED, DS=$STATS_DS_MOVED"
}

##############################################################################
# Phase 2: Standardize Naming Conventions (Kebab-case)
##############################################################################
phase2_standardize_naming() {
    log "======================================================================"
    log "PHASE 2: Standardizing File Names (kebab-case)"
    log "======================================================================"
    
    for project in "${PROJECTS[@]}"; do
        project_path="$WORKSPACE_ROOT/$project"
        
        if [ ! -d "$project_path" ]; then
            continue
        fi
        
        info "Processing: $project"
        
        # Find TypeScript, JavaScript, YAML files with non-kebab-case names
        while IFS= read -r -d '' file; do
            filename=$(basename "$file")
            dir=$(dirname "$file")
            
            # Check if in preserve list
            if printf '%s\n' "${PRESERVE_FILES[@]}" | grep -q "^${filename}$"; then
                continue
            fi
            
            # Convert to kebab-case
            ext="${filename##*.}"
            name="${filename%.*}"
            kebab_name=$(echo "$name" | sed -E 's/([a-z])([A-Z])/\1-\2/g' | tr '[:upper:]' '[:lower:]' | tr '_' '-')
            new_filename="${kebab_name}.${ext}"
            
            # Only rename if different
            if [ "$filename" != "$new_filename" ]; then
                new_path="$dir/$new_filename"
                
                # Check if target exists
                if [ -e "$new_path" ]; then
                    warn "  Target exists, skipping: $new_filename"
                    continue
                fi
                
                mv "$file" "$new_path" 2>/dev/null && {
                    ((STATS_RENAMED++))
                    info "  Renamed: $filename → $new_filename"
                } || {
                    ((STATS_ERRORS++))
                    error "  Failed to rename: $filename"
                }
            fi
        done < <(find "$project_path" -type f \( -name "*.ts" -o -name "*.js" -o -name "*.yml" -o -name "*.yaml" \) \
            ! -path "*/node_modules/*" \
            ! -path "*/vendor/*" \
            ! -path "*/dist/*" \
            ! -path "*/__DELETE_LATER/*" \
            -print0)
    done
    
    log "Phase 2 Complete: Renamed=$STATS_RENAMED files"
}

##############################################################################
# Phase 3: Run Linters and Formatters
##############################################################################
phase3_run_linters() {
    log "======================================================================"
    log "PHASE 3: Running Linters & Formatters"
    log "======================================================================"
    
    for project in "${PROJECTS[@]}"; do
        project_path="$WORKSPACE_ROOT/$project"
        
        if [ ! -d "$project_path" ]; then
            continue
        fi
        
        # Check if it's a Node.js project
        if [ ! -f "$project_path/package.json" ]; then
            info "Skipping non-Node.js project: $project"
            continue
        fi
        
        info "Linting: $project"
        
        cd "$project_path"
        
        # Run Prettier
        if command -v npx &> /dev/null; then
            info "  Running Prettier..."
            npx prettier --write "**/*.{ts,js,json,yml,yaml}" \
                --ignore-path .gitignore \
                --log-level warn 2>&1 | tee -a "$LOG_FILE" || {
                warn "  Prettier failed or not configured"
            }
        fi
    done
    
    log "Phase 3 Complete"
}

##############################################################################
# Main Execution
##############################################################################
main() {
    log "█████████████████████████████████████████████████████████████████████"
    log "COMPREHENSIVE CLEANUP - Starting"
    log "█████████████████████████████████████████████████████████████████████"
    log "Workspace: $WORKSPACE_ROOT"
    log "Log File: $LOG_FILE"
    log ""
    
    phase1_move_forbidden_files
    log ""
    
    phase2_standardize_naming
    log ""
    
    phase3_run_linters
    log ""
    
    log "█████████████████████████████████████████████████████████████████████"
    log "CLEANUP SUMMARY"
    log "█████████████████████████████████████████████████████████████████████"
    log "Forbidden Files Moved:"
    log "  - .md files:        $STATS_MD_MOVED"
    log "  - .sh files:        $STATS_SH_MOVED"
    log "  - .txt files:       $STATS_TXT_MOVED"
    log "  - .DS_Store files:  $STATS_DS_MOVED"
    log "Files Renamed:        $STATS_RENAMED"
    log "Errors:               $STATS_ERRORS"
    log ""
    log "✅ Cleanup Complete! Log saved to: $LOG_FILE"
    log "█████████████████████████████████████████████████████████████████████"
}

# Run main function
main "$@"

