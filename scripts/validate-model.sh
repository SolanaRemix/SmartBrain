#!/bin/bash

# SmartBrain Model Validation Script
# This script validates model files and metadata

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if model path is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Model path required${NC}"
    echo "Usage: ./validate-model.sh <model-path>"
    echo "Example: ./validate-model.sh models/my-model"
    exit 1
fi

MODEL_PATH=$1

echo "======================================"
echo "  SmartBrain Model Validation"
echo "======================================"
echo ""
echo "Model path: $MODEL_PATH"
echo ""

PASS_COUNT=0
FAIL_COUNT=0

# Helper functions
check_pass() {
    echo -e "${GREEN}✓ $1${NC}"
    ((PASS_COUNT++))
}

check_fail() {
    echo -e "${RED}✗ $1${NC}"
    ((FAIL_COUNT++))
}

# Check if model directory exists
echo -e "${BLUE}Checking model directory...${NC}"
if [ -d "$MODEL_PATH" ]; then
    check_pass "Model directory exists"
else
    check_fail "Model directory not found: $MODEL_PATH"
    exit 1
fi

# Check for metadata file
echo ""
echo -e "${BLUE}Checking model metadata...${NC}"
METADATA_FILE="$MODEL_PATH/metadata.json"
if [ -f "$METADATA_FILE" ]; then
    check_pass "Metadata file exists"
    
    # Validate JSON format
    if command -v node &> /dev/null; then
        if node -e "JSON.parse(require('fs').readFileSync('$METADATA_FILE', 'utf8'))" 2>/dev/null; then
            check_pass "Metadata is valid JSON"
        else
            check_fail "Metadata is not valid JSON"
        fi
        
        # Check required fields
        HAS_NAME=$(node -e "const m = JSON.parse(require('fs').readFileSync('$METADATA_FILE', 'utf8')); console.log(!!m.name)" 2>/dev/null)
        HAS_VERSION=$(node -e "const m = JSON.parse(require('fs').readFileSync('$METADATA_FILE', 'utf8')); console.log(!!m.version)" 2>/dev/null)
        HAS_FRAMEWORK=$(node -e "const m = JSON.parse(require('fs').readFileSync('$METADATA_FILE', 'utf8')); console.log(!!m.framework)" 2>/dev/null)
        HAS_TASK=$(node -e "const m = JSON.parse(require('fs').readFileSync('$METADATA_FILE', 'utf8')); console.log(!!m.task)" 2>/dev/null)
        
        if [ "$HAS_NAME" = "true" ]; then
            check_pass "Metadata has 'name' field"
        else
            check_fail "Metadata missing 'name' field"
        fi
        
        if [ "$HAS_VERSION" = "true" ]; then
            check_pass "Metadata has 'version' field"
        else
            check_fail "Metadata missing 'version' field"
        fi
        
        if [ "$HAS_FRAMEWORK" = "true" ]; then
            check_pass "Metadata has 'framework' field"
        else
            check_fail "Metadata missing 'framework' field"
        fi
        
        if [ "$HAS_TASK" = "true" ]; then
            check_pass "Metadata has 'task' field"
        else
            check_fail "Metadata missing 'task' field"
        fi
    fi
else
    check_fail "Metadata file not found: $METADATA_FILE"
fi

# Check for model files
echo ""
echo -e "${BLUE}Checking model files...${NC}"
MODEL_FILES=$(find "$MODEL_PATH" -type f \( -name "*.h5" -o -name "*.pb" -o -name "*.pth" -o -name "*.pt" -o -name "*.onnx" -o -name "*.pkl" \) 2>/dev/null)
MODEL_COUNT=$(echo "$MODEL_FILES" | grep -c "^" 2>/dev/null || echo "0")

if [ "$MODEL_COUNT" -gt 0 ]; then
    check_pass "Found $MODEL_COUNT model file(s)"
    
    # Check that model files are not empty
    while IFS= read -r model_file; do
        if [ -n "$model_file" ] && [ -f "$model_file" ]; then
            FILE_SIZE=$(stat -f%z "$model_file" 2>/dev/null || stat -c%s "$model_file" 2>/dev/null || echo "0")
            if [ "$FILE_SIZE" -eq 0 ]; then
                check_fail "Model file is empty: $(basename "$model_file")"
            else
                check_pass "Model file has content: $(basename "$model_file") (${FILE_SIZE} bytes)"
            fi
        fi
    done <<< "$MODEL_FILES"
else
    check_fail "No model files found (looking for .h5, .pb, .pth, .pt, .onnx, .pkl)"
fi

# Check for README
echo ""
echo -e "${BLUE}Checking documentation...${NC}"
if [ -f "$MODEL_PATH/README.md" ]; then
    check_pass "Model README exists"
else
    check_fail "Model README not found"
fi

# Summary
echo ""
echo "======================================"
echo "  Validation Summary"
echo "======================================"
echo -e "${GREEN}Passed: $PASS_COUNT${NC}"
echo -e "${RED}Failed: $FAIL_COUNT${NC}"
echo ""

if [ "$FAIL_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓ Model validation passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Model validation failed${NC}"
    exit 1
fi
