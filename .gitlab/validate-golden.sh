#!/bin/bash
# Validate Golden CI Orchestration Component Implementation

echo "🔍 Validating Bluefly Golden CI Orchestration Component"
echo "========================================================="

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Counters
PASS=0
WARN=0
FAIL=0

# Function to check condition
check() {
    local condition=$1
    local message=$2
    local severity=${3:-error}
    
    if eval "$condition"; then
        echo -e "${GREEN}✅ $message${NC}"
        ((PASS++))
    else
        if [ "$severity" = "warning" ]; then
            echo -e "${YELLOW}⚠️  $message${NC}"
            ((WARN++))
        else
            echo -e "${RED}❌ $message${NC}"
            ((FAIL++))
        fi
    fi
}

echo ""
echo "1. Component Structure Validation"
echo "---------------------------------"
check "[ -f .gitlab/components/workflow/golden/component.yml ]" "Golden component.yml exists"
check "[ -f .gitlab/components/workflow/golden/template.yml ]" "Golden template.yml exists"
check "[ -f .gitlab/components/workflow/golden/README.md ]" "Golden README.md exists"

echo ""
echo "2. Version Detection"
echo "-------------------"
VERSION=$(grep '"version"' package.json | cut -d'"' -f4)
check "[ -n '$VERSION' ]" "Package.json version detected: $VERSION"
check "[ '$VERSION' = '0.1.9' ]" "OSSA version is 0.1.9"

COMPONENT_VERSION=$(grep 'version:' .gitlab/components/workflow/golden/component.yml | sed 's/version:[ "]*//;s/"$//')
check "[ '$COMPONENT_VERSION' = '0.1.0' ]" "Golden component version is 0.1.0"

echo ""
echo "3. Branch Compliance"
echo "-------------------"
BRANCH_COUNT=$(git branch -a | grep -E "^\s*(feature|bug|chore|docs|hotfix|test|perf|ci)/" | wc -l)
check "[ $BRANCH_COUNT -le 40 ]" "Working branches ≤40 (5 per type): $BRANCH_COUNT" "warning"

CURRENT_BRANCH=$(git branch --show-current)
check "[ '$CURRENT_BRANCH' != 'main' ]" "Not on main branch (current: $CURRENT_BRANCH)"

echo ""
echo "4. GitLab CI Configuration"
echo "-------------------------"
check "[ -f .gitlab-ci.yml ]" "GitLab CI file exists"
check "grep -q 'golden/template.yml' .gitlab-ci.yml" "CI includes golden component"
check "grep -q 'ENABLE_OSSA.*true' .gitlab-ci.yml" "OSSA compliance enabled"
check "grep -q 'ENABLE_TDD.*true' .gitlab-ci.yml" "TDD compliance enabled"

echo ""
echo "5. Pipeline Jobs Validation"
echo "--------------------------"
check "grep -q 'detect:version:' .gitlab/components/workflow/golden/template.yml" "Version detection job defined"
check "grep -q 'tag:pre-release:' .gitlab/components/workflow/golden/template.yml" "Pre-release tagging job defined"
check "grep -q 'changelog:update:' .gitlab/components/workflow/golden/template.yml" "CHANGELOG update job defined"
check "grep -q 'release:production:' .gitlab/components/workflow/golden/template.yml" "Production release job defined"
check "grep -q 'when: manual' .gitlab/components/workflow/golden/template.yml" "Manual release gate configured"

echo ""
echo "6. Safety Checks"
echo "---------------"
check "! grep -q 'when: never' .gitlab/components/workflow/golden/template.yml" "No 'when: never' blockers"
check "grep -q 'rules:' .gitlab/components/workflow/golden/template.yml" "Uses rules instead of only/except"
check "! grep -q 'force-push' .gitlab/components/workflow/golden/template.yml" "No force-push commands"

echo ""
echo "7. Integration Points"
echo "--------------------"
check "grep -q 'test:integration' .gitlab-ci.yml" "Integration tests defined" "warning"
check "grep -q 'Registry Bridge Service' .gitlab-ci.yml" "Registry Bridge Service mentioned" "warning"
check "grep -q 'UADP' .gitlab-ci.yml" "UADP testing included" "warning"

echo ""
echo "8. Documentation"
echo "---------------"
check "[ -f CHANGELOG.md ]" "CHANGELOG.md exists"
check "grep -q '0.1.9' CHANGELOG.md" "CHANGELOG has v0.1.9 entry"
check "[ -f README.md ]" "README.md exists"
check "[ -f ROADMAP.md ]" "ROADMAP.md exists"

echo ""
echo "========================================================="
echo "Validation Summary:"
echo -e "${GREEN}✅ Passed: $PASS${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARN${NC}"
echo -e "${RED}❌ Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 Golden CI Orchestration Component is properly configured!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some validation checks failed. Please review above.${NC}"
    exit 1
fi