# Integration Testing Domain Model

## Glossary

| Term | Definition |
|------|------------|
| **Integration Test** | End-to-end verification that compares MongoDB collections using real database instances, verifying the comparison logic works with actual data storage and retrieval |
| **MongoDB Container** | A Docker container running MongoDB instance used as the test database for integration tests |
| **Test Dataset** | A MongoDB dump/restore archive containing pre-populated documents for the "before" and "after" collections |
| **Fresh Container** | A new MongoDB container started for each test run with no prior data state |
| **Diff Strategy** | The comparison mode used when detecting differences: All, Whitelist, Blacklist, or DeepEquality |

## Test Scenarios

### Scenario 1: Created Documents
- **Before collection**: Documents A, B, C
- **After collection**: Documents A, B, C, D, E
- **Expected**: 2 created documents (D, E)

### Scenario 2: Updated Documents
- **Before collection**: Documents A (value=100), B (value=200)
- **After collection**: Documents A (value=150), B (value=200)
- **Expected**: 1 updated document (A changed)

### Scenario 3: Deleted Documents
- **Before collection**: Documents A, B, C, D
- **After collection**: Documents A, B
- **Expected**: 2 deleted documents (C, D)

### Scenario 4: All Created
- **Before collection**: Empty
- **After collection**: Documents A, B, C
- **Expected**: 3 created documents

### Scenario 5: All Deleted
- **Before collection**: Documents A, B, C
- **After collection**: Empty
- **Expected**: 3 deleted documents

### Scenario 6: Mixed Changes
- **Before collection**: Documents A, B, C
- **After collection**: Documents A (updated), B, C (deleted), D (created)
- **Expected**: 1 created, 1 updated, 1 deleted

### Scenario 7: Empty Collections
- **Before collection**: Empty
- **After collection**: Empty
- **Expected**: 0 created, 0 updated, 0 deleted

### Scenario 8: No Changes
- **Before collection**: Documents A, B, C
- **After collection**: Documents A, B, C (identical)
- **Expected**: 0 created, 0 updated, 0 deleted

## Diff Strategy Integration Tests

### Whitelist Strategy
- Only specified fields should be compared
- Non-whitelisted field changes should be ignored
- Identifier field should never be compared

### Blacklist Strategy
- All fields except blacklisted should be compared
- Blacklisted field changes should be ignored
- Identifier field should never be compared

### DeepEquality Strategy
- Nested objects should be compared as atomic units
- Field-by-field comparison should NOT occur for nested objects
- Only full nested object equality should be detected

## Test Dataset Requirements

### Dataset Format
- MongoDB dump format (BSON) or JSON
- Contains two collections: `collection_before` and `collection_after`
- Each test scenario has its own dataset file

### Dataset Storage
- Located in `tests/fixtures/` directory
- Each scenario has a dedicated directory:
  - `tests/fixtures/created/`
  - `tests/fixtures/updated/`
  - `tests/fixtures/deleted/`
  - `tests/fixtures/mixed/`
  - `tests/fixtures/empty/`
  - `tests/fixtures/no_changes/`

## Test Execution Flow

```
1. Start fresh MongoDB container
2. Load test dataset (mongorestore)
3. Configure test to use MongoDB container connection
4. Run comparison function
5. Verify results match expected counts
6. Verify sample documents match expected changes
7. Stop MongoDB container
```

## CI/CD Requirements

### Local Development
- Run with `cargo test --test integration`
- Automatically manages MongoDB container lifecycle
- Reuses container between test files for speed

### CI Pipeline (GitHub Actions)
- Run on pull requests and main branch pushes
- Matrix: Test all diff strategies
- Container: MongoDB latest stable version
- Cache: Test datasets between runs

## Failure Modes

### Container Startup Failure
- Error: Cannot start MongoDB container
- Action: Skip integration tests, run unit tests only

### Dataset Load Failure
- Error: Cannot restore test data
- Action: Fail test with descriptive error

### Connection Failure
- Error: Cannot connect to MongoDB container
- Action: Retry connection with exponential backoff

### Test Data Corruption
- Error: Test data doesn't match expected schema
- Action: Fail test, log data for debugging
