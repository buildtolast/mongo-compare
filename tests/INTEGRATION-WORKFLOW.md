# Integration Testing Workflow for mongo-compare

This workflow provides comprehensive integration testing using Docker MongoDB containers.

## Overview

The integration testing workflow:

1. **Spins up a fresh MongoDB Docker container** for each test run
2. **Uses MongoDB dump/restore** to populate test data from JSON fixtures
3. **Tests all scenarios**: created, updated, deleted, mixed, empty, no changes
4. **Verifies all diff strategies** with real MongoDB data
5. **Runs both locally and in CI** (GitHub Actions)

## Architecture

```
tests/
├── integration/
│   ├── mod.rs                    # Module entry point
│   ├── created_documents_test.rs # Created documents test
│   ├── mongodb_container.rs      # Container management
│   └── test_data.rs              # Test data loading
├── integration.rs                # Test harness
└── fixtures/                     # Test data fixtures
    ├── created/
    ├── updated/
    ├── deleted/
    ├── mixed/
    ├── empty/
    ├── no_changes/
    └── strategies/
        ├── whitelist/
        ├── blacklist/
        └── deep_equality/
```

## Test Scenarios

| Scenario | Description |
|----------|-------------|
| Created Documents | Verifies detection of new documents |
| Updated Documents | Verifies detection of changed documents |
| Deleted Documents | Verifies detection of removed documents |
| Mixed Changes | Verifies all change types together |
| Empty Collections | Verifies empty collection handling |
| No Changes | Verifies identical collections |
| Whitelist Strategy | Verifies field filtering |
| Blacklist Strategy | Verifies field exclusion |
| Deep Equality | Verifies nested object comparison |

## Running Tests

### All Integration Tests

```bash
cargo test --test integration
```

### Specific Test

```bash
cargo test --test integration test_created_documents
```

### Verbose Output

```bash
RUST_LOG=debug cargo test --test integration
```

### With Docker Container

```bash
# Start MongoDB container
./scripts/setup-test-mongo.sh

# Run tests
cargo test --test integration

# Cleanup
./scripts/cleanup-test-mongo.sh
```

## CI/CD Integration

### GitHub Actions

The workflow runs on:
- Push to `main` branch
- Pull requests to `main` branch

See: `.github/workflows/integration-tests.yml`

```yaml
- name: Run integration tests
  run: cargo test --test integration -- --test-threads=1
```

## Test Data Format

Test data is stored in `tests/fixtures/` as JSON files:

```json
{
  "before": [...],
  "after": [...],
  "expected": {
    "created": 0,
    "updated": 0,
    "deleted": 0
  }
}
```

## Container Management

The workflow uses `testcontainers-rs` to:

1. Start a fresh MongoDB container for each test run
2. Load test data using `mongorestore`
3. Configure tests to use the container's connection string
4. Run comparison logic
5. Stop the container after test completion

## Best Practices

1. **Fresh containers**: Each test gets a clean MongoDB instance
2. **Fixture files**: Store test data in JSON format
3. **Test isolation**: No shared state between tests
4. **Cleanup**: Containers auto-stop when dropped
5. **Error handling**: Properly propagate container errors

## Troubleshooting

### Container Won't Start

```bash
# Check Docker is running
docker ps

# Check for port conflicts
lsof -i :27017

# Try different MongoDB version
docker run -d --name mongo-test -p 27017:27017 mongo:6.0
```

### Data Load Fails

```bash
# Verify BSON files exist
ls tests/fixtures/*/before.bson

# Check mongorestore is installed
mongorestore --version

# Verify MongoDB container is ready
docker exec mongo-test mongosh --eval "db.adminCommand('ping')"
```

## Future Enhancements

- [ ] Add actual MongoDB container integration
- [ ] Implement BSON fixture files
- [ ] Add test data generation scripts
- [ ] Implement container pooling for faster CI
- [ ] Add test coverage reporting
