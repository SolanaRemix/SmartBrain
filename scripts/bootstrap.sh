#!/bin/bash

# SmartBrain Bootstrap Script
# This script initializes the SmartBrain infrastructure

set -e

echo "======================================"
echo "  SmartBrain Infrastructure Bootstrap"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "Checking dependencies..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js >= 16.0.0"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
# Note: This check uses simple integer comparison and requires standard version formats (e.g., 16.0.0)
# Non-standard formats like "16.0.0-rc1" are not supported
if [ "$NODE_VERSION" -lt 16 ]; then
    echo -e "${RED}Error: Node.js version must be >= 16.0.0${NC}"
    echo "Current version: $(node -v)"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm $(npm -v) detected${NC}"

# Create required directories if they don't exist
echo ""
echo "Setting up directory structure..."
mkdir -p models/registry models/metadata
mkdir -p inference/engine inference/cli inference/api
mkdir -p training/pipeline training/configs
mkdir -p datasets/validation
mkdir -p src/core src/utils
mkdir -p tests/unit tests/integration
mkdir -p tools/ml-helpers
mkdir -p .github/workflows .github/copilot

echo -e "${GREEN}✓ Directory structure created${NC}"

# Install dependencies
echo ""
echo "Installing dependencies..."
if [ -f "package.json" ]; then
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ package.json not found, skipping dependency installation${NC}"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo ""
        echo "Creating .env file from .env.example..."
        cp .env.example .env
        echo -e "${GREEN}✓ .env file created${NC}"
        echo -e "${YELLOW}⚠ Please update .env with your configuration${NC}"
    fi
fi

# Verify model metadata schema
echo ""
echo "Verifying model metadata schema..."
if [ -f "models/metadata/schema.json" ]; then
    echo -e "${GREEN}✓ Model metadata schema exists${NC}"
else
    echo -e "${YELLOW}⚠ Model metadata schema not found${NC}"
fi

# Check for required workflows
echo ""
echo "Checking GitHub Actions workflows..."
WORKFLOW_COUNT=$(find .github/workflows -name "*.yml" -o -name "*.yaml" 2>/dev/null | wc -l)
if [ "$WORKFLOW_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Found $WORKFLOW_COUNT workflow(s)${NC}"
else
    echo -e "${YELLOW}⚠ No workflows found in .github/workflows/${NC}"
fi

# Verify scripts are executable
echo ""
echo "Setting script permissions..."
chmod +x scripts/*.sh 2>/dev/null || true
echo -e "${GREEN}✓ Script permissions set${NC}"

# Final summary
echo ""
echo "======================================"
echo "  Bootstrap Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Update .env with your configuration"
echo "2. Run: npm test (to verify setup)"
echo "3. Run: ./scripts/audit.sh (to audit setup)"
echo "4. Start developing!"
echo ""
