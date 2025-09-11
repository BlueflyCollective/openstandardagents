#!/bin/bash

echo "🧹 Starting OSSA branch cleanup..."

# List of old feature branches to remove (conservative approach)
OLD_FEATURE_BRANCHES=(
    "origin/feature/0.1.0-fix-typescript-errors"
    "origin/feature/0.1.0-migration-testing" 
    "origin/feature/0.1.0-wip"
    "origin/feature/0.1.4"
    "origin/feature/0.1.4-clean-docs"
    "origin/feature/0.1.4-service-alignment"
    "origin/feature/0.1.5-mcp"
    "origin/feature/0.1.5-ossa"
    "origin/feature/0.1.5-prep"
    "origin/feature/0.1.6"
    "origin/feature/0.1.8-open-source-standard"
    "origin/feature/0.1.8-wip"
    "origin/feature/0.1.8-dual-reg"
    "origin/feature/0.1.8-openmp"
    "origin/feature/0.1.8-worktree-integration"
    "origin/feature/0.1.8-roadmap-items"
    "origin/feature/0.1.8-clean-folder-structure"
    "origin/feature/0.1.8-sync"
    "origin/archive/feature-0.1.8-WORKING-CLI"
)

echo "📋 Branches to be removed:"
for branch in "${OLD_FEATURE_BRANCHES[@]}"; do
    echo "  - $branch"
done

echo ""
read -p "❓ Do you want to proceed with removing these branches? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removing old feature branches..."
    
    for branch in "${OLD_FEATURE_BRANCHES[@]}"; do
        if git show-ref --verify --quiet "refs/$branch"; then
            echo "  ✅ Removing $branch"
            git push origin --delete "${branch#origin/}" 2>/dev/null || echo "    ⚠️  Could not remove $branch (may not exist on remote)"
        else
            echo "  ⚠️  Branch $branch not found locally"
        fi
    done
    
    echo "🧹 Cleaning up remote tracking references..."
    git remote prune origin
    
    echo "✅ Branch cleanup completed!"
else
    echo "❌ Branch cleanup cancelled"
fi
