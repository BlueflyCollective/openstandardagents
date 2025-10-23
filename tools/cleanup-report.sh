#!/usr/bin/env bash
# Generate cleanup report for OSSA repo

echo "📊 OSSA Repository Cleanup Report"
echo "=================================="
echo ""

echo "📁 Directory Structure:"
du -sh * 2>/dev/null | sort -hr | head -10
echo ""

echo "📝 File Counts:"
echo "  YAML files: $(find . -name "*.yaml" -o -name "*.yml" | wc -l)"
echo "  TypeScript: $(find . -name "*.ts" | wc -l)"
echo "  JavaScript: $(find . -name "*.js" | wc -l)"
echo "  Python: $(find . -name "*.py" | wc -l)"
echo "  Markdown: $(find . -name "*.md" | wc -l)"
echo ""

echo "🗑️  Potential Cleanup Targets:"
find . -type d -name "node_modules" -o -name "__DELETE_LATER" -o -name "backup" -o -name ".DS_Store" 2>/dev/null | head -10
echo ""

echo "📦 K8s Deployments:"
kubectl get deployments --all-namespaces -l ossa-compliant=true 2>/dev/null || echo "  (No K8s access or no OSSA agents deployed)"
echo ""

echo "💡 Recommendations:"
echo "  1. Review examples/bridges/ - this is your GOLDEN PATTERN"
echo "  2. Use it to deploy more agents quickly"
echo "  3. Clean up old experiments and test files"
echo "  4. Consolidate documentation"
