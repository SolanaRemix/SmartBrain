#!/bin/bash

# SmartBrain Audit Script
# This script audits the SmartBrain infrastructure setup

set -e

echo "======================================"
echo "  SmartBrain Infrastructure Audit"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASS_COUNT=0
WARN_COUNT=0
FAIL_COUNT=0

# Helper functions
check_pass() {
    echo -e "${GREEN}✓ $1${NC}"
    ((PASS_COUNT++))
}

check_warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
    ((WARN_COUNT++))
}

check_fail() {
    echo -e "${RED}✗ $1${NC}"
    ((FAIL_COUNT++))
}

# Check directory structure
echo -e "${BLUE}Checking directory structure...${NC}"
REQUIRED_DIRS=(
    "models/registry"
    "models/metadata"
    "inference/engine"
    "inference/cli"
    "inference/api"
    "training/pipeline"
    "training/configs"
    "datasets/validation"
    "scripts"
    "src/core"
    "src/utils"
    "tests/unit"
    "tests/integration"
    "tools/ml-helpers"
    ".github/workflows"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        check_pass "Directory exists: $dir"
    else
        check_fail "Directory missing: $dir"
    fi
done

# Check required files
echo ""
echo -e "${BLUE}Checking required files...${NC}"
REQUIRED_FILES=(
    "package.json"
    "README.md"
    ".gitignore"
    "LICENSE"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_pass "File exists: $file"
    else
        check_fail "File missing: $file"
    fi
done

# Check documentation
echo ""
echo -e "${BLUE}Checking documentation...${NC}"
DOC_FILES=(
    "SECURITY.md"
    "CONTRIBUTING.md"
    "CODE_OF_CONDUCT.md"
    "docs/index.md"
)

for file in "${DOC_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_pass "Documentation exists: $file"
    else
        check_warn "Documentation missing: $file"
    fi
done

# Check workflows
echo ""
echo -e "${BLUE}Checking GitHub Actions workflows...${NC}"
WORKFLOW_FILES=(
    ".github/workflows/ci.yml"
    ".github/workflows/lint.yml"
    ".github/workflows/codeql.yml"
)

for file in "${WORKFLOW_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_pass "Workflow exists: $file"
    else
        check_warn "Workflow missing: $file"
    fi
done

# Check agent configuration
echo ""
echo -e "${BLUE}Checking agent configuration...${NC}"
if [ -f ".github/copilot/agent.yaml" ]; then
    check_pass "Agent configuration exists"
else
    check_warn "Agent configuration missing: .github/copilot/agent.yaml"
fi

# Check Node.js setup
echo ""
echo -e "${BLUE}Checking Node.js setup...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    check_pass "Node.js installed: $NODE_VERSION"
else
    check_fail "Node.js not installed"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    check_pass "npm installed: $NPM_VERSION"
else
    check_fail "npm not installed"
fi

# Check dependencies
echo ""
echo -e "${BLUE}Checking dependencies...${NC}"
if [ -f "package.json" ]; then
    if [ -d "node_modules" ]; then
        check_pass "Dependencies installed"
    else
        check_warn "Dependencies not installed (run: npm install)"
    fi
fi

# Check environment configuration
echo ""
echo -e "${BLUE}Checking environment configuration...${NC}"
if [ -f ".env" ]; then
    check_pass ".env file exists"
else
    if [ -f ".env.example" ]; then
        check_warn ".env file missing (template available at .env.example)"
    else
        check_warn ".env and .env.example files missing"
    fi
fi

# Check model metadata schema
echo ""
echo -e "${BLUE}Checking ML infrastructure...${NC}"
if [ -f "models/metadata/schema.json" ]; then
    check_pass "Model metadata schema exists"
else
    check_warn "Model metadata schema missing"
fi

# Check scripts
echo ""
echo -e "${BLUE}Checking utility scripts...${NC}"
SCRIPTS=(
    "scripts/bootstrap.sh"
    "scripts/audit.sh"
    "scripts/validate-model.sh"
)

for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            check_pass "Script exists and is executable: $script"
        else
            check_warn "Script exists but not executable: $script (run: chmod +x $script)"
        fi
    else
        check_warn "Script missing: $script"
    fi
done

# Summary
echo ""
echo "======================================"
echo "  Audit Summary"
echo "======================================"
echo -e "${GREEN}Passed:  $PASS_COUNT${NC}"
echo -e "${YELLOW}Warnings: $WARN_COUNT${NC}"
echo -e "${RED}Failed:  $FAIL_COUNT${NC}"
echo ""

if [ "$FAIL_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓ Audit completed successfully!${NC}"
    exit 0
else
    echo -e "${RED}✗ Audit found critical issues${NC}"
    exit 1
fi
