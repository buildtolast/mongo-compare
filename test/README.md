# MongoDB Compare Integration Test Suite

This directory contains comprehensive integration tests for the MongoDB Compare application.

## Test Structure

```
test/
├── docker-compose.test.yml    # Test environment setup
├── fixtures/
│   └── init-test-data.js      # Initial test data for MongoDB
├── run_tests.py               # Python test runner (recommended)
├── run-tests.sh               # Bash test runner (alternative)
└── README.md                  # This file
```

## Running Tests

### Prerequisites

- Docker and Docker Compose installed
- Python 3.8+ (for Python test runner)

### Option 1: Using Python Test Runner (Recommended)

```bash
# Ensure the application is running
docker-compose up -d

# Run tests
python3 test/run_tests.py
```

### Option 2: Using Bash Test Runner

```bash
# Ensure the application is running
docker-compose up -d

# Run tests
./test/run-tests.sh
```

### Option 3: With Docker Compose Test Environment

```bash
# Build and start test environment
docker-compose -f test/docker-compose.test.yml up -d

# Wait for containers to be ready (30-60 seconds)
sleep 60

# Run tests
python3 test/run_tests.py
```

## Test Coverage

The integration test suite covers:

### 1. Health Check
- Verifies the application is running
- Tests the `/health` endpoint

### 2. Connection Testing
- Tests MongoDB connection
- Validates connection string handling

### 3. Database Operations
- Lists available databases
- Lists collections in a database

### 4. Comparison Operations
- **Same Database Comparison**: Compares collections within the same database
- **Cross-Database Comparison**: Compares collections across different databases
- **Difference Detection**: Verifies detection of:
  - Inserted rows
  - Updated rows (field changes)
  - Deleted rows

### 5. API Response Validation
- JSON structure validation
- Required field presence
- Data type validation

## Test Data

Test fixtures initialize the following data:

### Source Database (`test`)
- **users**: 4 users (Alice, Bob, Charlie, David)
- **products**: 3 products (Laptop, Phone, Tablet)

### Target Database (`target`)
- **users**: 4 users (with one updated, one deleted, one inserted for testing)

## Test Results

Tests return:
- ✓ PASS: Test passed successfully
- ✗ FAIL: Test failed
- Test summary with pass/fail counts
- Detailed results showing expected vs actual values

## CI/CD Integration

The test suite can be integrated into CI/CD pipelines:

```yaml
# .github/workflows/test.yml
name: Integration Tests

on: [pull_request, push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker
        uses: docker/setup-buildx-action@v2
      
      - name: Start test environment
        run: docker-compose -f test/docker-compose.test.yml up -d
      
      - name: Run integration tests
        run: python3 test/run_tests.py
      
      - name: Stop test environment
        if: always()
        run: docker-compose -f test/docker-compose.test.yml down
```

## Extending Tests

To add new tests:

1. Add a test method to `IntegrationTestSuite` class in `run_tests.py`
2. Use assertion methods: `_assert_equal`, `_assert_contains`, `_assert_json_field`
3. Register the test in the `run_all_tests` method

Example:

```python
def test_new_feature(self) -> bool:
    response = self._make_request("POST", "/endpoint", {"data": "value"})
    return self._assert_equal(200, response.status_code, "New feature works")
```

## Troubleshooting

### Tests fail with connection refused
- Ensure Docker containers are running: `docker-compose ps`
- Check if MongoDB is accessible: `docker exec -it mongo-compare-test-mongo mongosh`

### Tests fail with timeout
- Increase timeout in `requests.request()` call
- Wait longer for containers to be ready

### JSON parsing errors
- Check API response format
- Verify Content-Type header is `application/json`

## License

MIT License - See LICENSE file for details
