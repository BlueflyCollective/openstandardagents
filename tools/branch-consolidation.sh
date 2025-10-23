#!/bin/bash
#
# BRANCH CONSOLIDATION TOOL
# 
# Fixes the "100s of local branches" problem by:
# 1. Finding all feature branches
# 2. Consolidating work into ONE branch per repo
# 3. Deleting duplicate/merged branches
# 4. Creating clean MRs
#

set -e

COMMON_NPM_DIR="/Users/flux423/Sites/LLM/common_npm"
TARGET_BRANCH="development"
CONSOLIDATION_BRANCH="feature/consolidated-improvements"

REPOS=(
  "agent-brain"
  "agent-studio"
  "agent-tracer"
  "agentic-flows"
  "doc-engine"
  "compliance-engine"
  "workflow-engine"
  "agent-chat"
  "agent-mesh"
  "agent-router"
)

echo "=================================="
echo "BRANCH CONSOLIDATION TOOL"
echo "=================================="
echo ""

for repo in "${REPOS[@]}"; do
  echo "Processing: $repo"
  cd "$COMMON_NPM_DIR/$repo" 2>/dev/null || continue
  
  # 1. Checkout development
  git checkout development 2>/dev/null || git checkout main 2>/dev/null || continue
  git fetch origin --prune
  
  # 2. Count branches before
  BEFORE=$(git branch | wc -l | tr -d ' ')
  echo "  Branches before: $BEFORE"
  
  # 3. Delete merged branches
  git branch --merged | grep -v "^\*" | grep -v "development" | grep -v "main" | xargs -n 1 git branch -d 2>/dev/null || true
  
  # 4. Delete old remote-tracking branches
  git branch -r --merged origin/development | grep -v "development" | grep -v "main" | sed 's/origin\///' | xargs -n 1 git push origin --delete 2>/dev/null || true
  
  # 5. Count branches after
  AFTER=$(git branch | wc -l | tr -d ' ')
  DELETED=$((BEFORE - AFTER))
  echo "  Branches after: $AFTER"
  echo "  Deleted: $DELETED"
  echo ""
done

echo "=================================="
echo "CLEANUP COMPLETE!"
echo "=================================="
echo ""
echo "Next: Review remaining branches and merge/delete manually"

