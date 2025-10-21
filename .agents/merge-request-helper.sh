#!/bin/bash

##############################################################################
# Merge Request Helper Script
# Helps review and fix GitLab merge requests one by one
##############################################################################

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[MR-HELPER]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
info() { echo -e "${BLUE}[INFO]${NC} $1"; }

GITLAB_URL="https://gitlab.bluefly.io"
GITLAB_TOKEN="${GITLAB_TOKEN:-}"

##############################################################################
# Function: List Open Merge Requests
##############################################################################
list_merge_requests() {
    log "======================================================================"
    log "Fetching Open Merge Requests"
    log "======================================================================"
    
    if [ -z "$GITLAB_TOKEN" ]; then
        warn "GITLAB_TOKEN not set. Using manual mode."
        echo ""
        echo "Please visit: ${GITLAB_URL}/groups/llm/-/merge_requests"
        echo ""
        echo "List each MR number you want to work on (space-separated):"
        read -r mr_numbers
        echo "$mr_numbers"
    else
        # Use GitLab API if token is available
        curl -s --header "PRIVATE-TOKEN: ${GITLAB_TOKEN}" \
            "${GITLAB_URL}/api/v4/groups/llm/merge_requests?state=opened" \
            | jq -r '.[] | "\(.iid): \(.title) - \(.source_branch) -> \(.target_branch)"'
    fi
}

##############################################################################
# Function: Checkout MR Branch
##############################################################################
checkout_mr() {
    local mr_number=$1
    local project_path=$2
    
    log "Checking out MR !${mr_number} in ${project_path}"
    
    cd "$project_path" || exit 1
    
    # Fetch latest
    git fetch origin
    
    # Try to find the branch
    local branch=$(git branch -r | grep -i "merge.*${mr_number}\|mr.*${mr_number}\|!${mr_number}" | head -1 | xargs)
    
    if [ -z "$branch" ]; then
        warn "Could not auto-detect branch for MR !${mr_number}"
        echo "Enter branch name:"
        read -r branch
    fi
    
    # Checkout
    git checkout "${branch#origin/}" 2>/dev/null || git checkout -b "mr-${mr_number}" "$branch"
    
    log "✅ Checked out: ${branch}"
}

##############################################################################
# Function: Run Validations
##############################################################################
validate_mr() {
    local project_path=$1
    
    log "Running Validations..."
    
    cd "$project_path" || exit 1
    
    # Check for package.json
    if [ -f "package.json" ]; then
        info "Node.js project detected"
        
        # Install if needed
        if [ ! -d "node_modules" ]; then
            log "Installing dependencies..."
            npm install
        fi
        
        # Run linting
        if grep -q '"lint"' package.json; then
            log "Running linter..."
            npm run lint || warn "Linting failed"
        fi
        
        # Run tests
        if grep -q '"test"' package.json; then
            log "Running tests..."
            npm test || warn "Tests failed"
        fi
        
        # Check for TypeScript
        if [ -f "tsconfig.json" ]; then
            log "Running TypeScript check..."
            npx tsc --noEmit || warn "TypeScript errors found"
        fi
    fi
    
    # Check for composer.json (PHP/Drupal)
    if [ -f "composer.json" ]; then
        info "PHP/Drupal project detected"
        
        if [ -f "phpcs.xml" ] || [ -f "phpcs.xml.dist" ]; then
            log "Running PHPCS..."
            ./vendor/bin/phpcs || warn "PHPCS failed"
        fi
        
        if [ -f "phpstan.neon" ]; then
            log "Running PHPStan..."
            ./vendor/bin/phpstan analyze || warn "PHPStan failed"
        fi
    fi
    
    # Check for forbidden files
    log "Checking for forbidden files..."
    
    local forbidden_count=0
    forbidden_count=$(git diff --name-only origin/main | grep -E '\.(md|sh|txt)$' | wc -l || echo "0")
    
    if [ "$forbidden_count" -gt 0 ]; then
        warn "Found $forbidden_count forbidden files in MR:"
        git diff --name-only origin/main | grep -E '\.(md|sh|txt)$' || true
        echo ""
        echo "These should be moved to GitLab Wiki/Issues instead!"
    else
        log "✅ No forbidden files"
    fi
    
    log "Validation complete"
}

##############################################################################
# Function: Auto-fix Common Issues
##############################################################################
autofix_mr() {
    local project_path=$1
    
    log "Auto-fixing common issues..."
    
    cd "$project_path" || exit 1
    
    # Run prettier if available
    if [ -f "package.json" ] && grep -q "prettier" package.json; then
        log "Running Prettier..."
        npx prettier --write "**/*.{ts,js,json,yml,yaml}" --ignore-path .gitignore || warn "Prettier failed"
    fi
    
    # Fix line endings
    log "Fixing line endings..."
    find . -type f -name "*.ts" -o -name "*.js" -o -name "*.json" | while read -r file; do
        if [[ ! "$file" =~ node_modules ]]; then
            dos2unix "$file" 2>/dev/null || true
        fi
    done
    
    # Remove trailing whitespace
    log "Removing trailing whitespace..."
    find . -type f -name "*.ts" -o -name "*.js" | while read -r file; do
        if [[ ! "$file" =~ node_modules ]]; then
            sed -i '' 's/[[:space:]]*$//' "$file" 2>/dev/null || true
        fi
    done
    
    log "Auto-fixes applied"
}

##############################################################################
# Function: Interactive Fix Menu
##############################################################################
fix_menu() {
    local project_path=$1
    
    while true; do
        echo ""
        log "======================================================================"
        log "MR Fix Menu"
        log "======================================================================"
        echo "1) Run validations"
        echo "2) Auto-fix common issues"
        echo "3) Run linter"
        echo "4) Run tests"
        echo "5) Check for conflicts"
        echo "6) View changes"
        echo "7) Commit fixes"
        echo "8) Push changes"
        echo "9) Next MR"
        echo "0) Exit"
        echo ""
        echo -n "Select option: "
        read -r option
        
        case $option in
            1) validate_mr "$project_path" ;;
            2) autofix_mr "$project_path" ;;
            3) cd "$project_path" && npm run lint || true ;;
            4) cd "$project_path" && npm test || true ;;
            5) cd "$project_path" && git diff origin/main ;;
            6) cd "$project_path" && git status && git diff ;;
            7)
                cd "$project_path"
                echo "Commit message:"
                read -r commit_msg
                git add .
                git commit -m "$commit_msg"
                ;;
            8) cd "$project_path" && git push ;;
            9) return 0 ;;
            0) exit 0 ;;
            *) warn "Invalid option" ;;
        esac
    done
}

##############################################################################
# Function: Process Single MR
##############################################################################
process_mr() {
    local mr_number=$1
    local project_name=$2
    local project_path=$3
    
    log "======================================================================"
    log "Processing MR !${mr_number} - ${project_name}"
    log "======================================================================"
    
    # Checkout
    checkout_mr "$mr_number" "$project_path"
    
    # Run initial validation
    validate_mr "$project_path"
    
    # Interactive menu
    fix_menu "$project_path"
}

##############################################################################
# Main Entry Point
##############################################################################
main() {
    log "█████████████████████████████████████████████████████████████████████"
    log "GitLab Merge Request Helper"
    log "█████████████████████████████████████████████████████████████████████"
    echo ""
    
    # Check for GitLab token
    if [ -z "$GITLAB_TOKEN" ]; then
        warn "GITLAB_TOKEN not set. Some features limited."
        echo "Export your token: export GITLAB_TOKEN=your_token_here"
        echo ""
    fi
    
    # Get list of MRs to process
    echo "Enter MR numbers to process (space-separated):"
    read -r mr_numbers
    
    echo "Enter project name (OSSA, agent-buildkit, etc):"
    read -r project_name
    
    echo "Enter project path:"
    read -r project_path
    
    # Process each MR
    for mr in $mr_numbers; do
        process_mr "$mr" "$project_name" "$project_path"
    done
    
    log "All MRs processed!"
}

# Run if executed directly
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi
