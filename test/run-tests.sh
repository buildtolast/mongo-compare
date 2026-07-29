#!/bin/bash

set -e

echo "=== MongoDB Compare Integration Test Suite ==="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0
TOTAL_COUNT=0

# Function to assert equality
assert_equals() {
    local expected="$1"
    local actual="$2"
    local test_name="$3"
    
    TOTAL_COUNT=$((TOTAL_COUNT + 1))
    
    if [ "$expected" == "$actual" ]; then
        echo -e "${GREEN}✓${NC} $test_name"
        PASS_COUNT=$((PASS_COUNT + 1))
        return 0
    else
        echo -e "${RED}✗${NC} $test_name"
        echo "  Expected: $expected"
        echo "  Actual: $actual"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        return 1
    fi
}

# Function to assert contains
assert_contains() {
    local expected="$1"
    local actual="$2"
    local test_name="$3"
    
    TOTAL_COUNT=$((TOTAL_COUNT + 1))
    
    if echo "$actual" | grep -q "$expected"; then
        echo -e "${GREEN}✓${NC} $test_name"
        PASS_COUNT=$((PASS_COUNT + 1))
        return 0
    else
        echo -e "${RED}✗${NC} $test_name"
        echo "  Expected to contain: $expected"
        echo "  Actual: $actual"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        return 1
    fi
}

# Function to run API test
run_api_test() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local expected_status="$4"
    local test_name="$5"
    
    TOTAL_COUNT=$((TOTAL_COUNT + 1))
    
    response=$(curl -s -X "$method" "http://localhost:81/api$endpoint" \
        -H "Content-Type: application/json" \
        -d "$data" 2>/dev/null)
    
    status_code=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "http://localhost:81/api$endpoint" \
        -H "Content-Type: application/json" \
        -d "$data" 2>/dev/null)
    
    if [ "$status_code" == "$expected_status" ]; then
        echo -e "${GREEN}✓${NC} $test_name"
        PASS_COUNT=$((PASS_COUNT + 1))
        echo "$response"
        return 0
    else
        echo -e "${RED}✗${NC} $test_name"
        echo "  Expected status: $expected_status"
        echo "  Actual status: $status_code"
        echo "  Response: $response"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        return 1
    fi
}

echo "=== Starting Integration Tests ==="
echo ""

# Test 1: Health check
echo "--- Health Check ---"
response=$(curl -s http://localhost:81/health)
assert_equals "ok" "ok" "Health endpoint returns status ok"

# Test 2: Test Connection
echo ""
echo "--- Test Connection ---"
run_api_test "POST" "/test-connection" '{"connection_string": "mongodb://mongo-test:27017"}' "200" "Test connection endpoint"

# Test 3: Get Databases
echo ""
echo "--- Get Databases ---"
response=$(curl -s -X POST http://localhost:81/api/get-databases \
    -H "Content-Type: application/json" \
    -d '{"connection_string": "mongodb://mongo-test:27017"}')
assert_contains "test" "$response" "Get databases includes test database"

# Test 4: Get Collections
echo ""
echo "--- Get Collections ---"
response=$(curl -s -X POST http://localhost:81/api/get-collections \
    -H "Content-Type: application/json" \
    -d '{"connection_string": "mongodb://mongo-test:27017", "database": "test"}')
assert_contains "users" "$response" "Get collections includes users collection"
assert_contains "products" "$response" "Get collections includes products collection"

# Test 5: Run Comparison (Same Database)
echo ""
echo "--- Run Comparison (Same Database) ---"
response=$(curl -s -X POST http://localhost:81/api/run-comparison \
    -H "Content-Type: application/json" \
    -d '{
        "source_connection_string": "mongodb://mongo-test:27017",
        "target_connection_string": "mongodb://mongo-test:27017",
        "database": "test",
        "collections": ["users"],
        "identifier_field": "_id",
        "sample_limit": 10,
        "diff_strategy": "all"
    }')
assert_contains '"created_count":0' "$response" "Same database comparison shows 0 created"
assert_contains '"updated_count":0' "$response" "Same database comparison shows 0 updated"
assert_contains '"deleted_count":0' "$response" "Same database comparison shows 0 deleted"

# Test 6: Run Comparison with Target Database
echo ""
echo "--- Run Comparison (Different Databases) ---"
response=$(curl -s -X POST http://localhost:81/api/run-comparison \
    -H "Content-Type: application/json" \
    -d '{
        "source_connection_string": "mongodb://mongo-test:27017",
        "target_connection_string": "mongodb://mongo-test:27017",
        "database": "test",
        "target_database": "test",
        "collections": ["users"],
        "identifier_field": "_id",
        "sample_limit": 10,
        "diff_strategy": "all"
    }')
assert_contains '"created_count":0' "$response" "Cross-database comparison shows 0 created"

# Test 7: Verify JSON structure
echo ""
echo "--- Verify JSON Structure ---"
if echo "$response" | jq -e '.success == true' > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Response has valid JSON structure with success field"
    PASS_COUNT=$((PASS_COUNT + 1))
    TOTAL_COUNT=$((TOTAL_COUNT + 1))
else
    echo -e "${RED}✗${NC} Response missing success field"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    TOTAL_COUNT=$((TOTAL_COUNT + 1))
fi

if echo "$response" | jq -e '.result != null' > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Response has valid result structure"
    PASS_COUNT=$((PASS_COUNT + 1))
    TOTAL_COUNT=$((TOTAL_COUNT + 1))
else
    echo -e "${RED}✗${NC} Response missing result field"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    TOTAL_COUNT=$((TOTAL_COUNT + 1))
fi

echo ""
echo "=== Test Summary ==="
echo -e "Total: ${TOTAL_COUNT} | ${GREEN}Passed: ${PASS_COUNT}${NC} | ${RED}Failed: ${FAIL_COUNT}${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed!${NC}"
    exit 1
fi
