# Integration Testing Workflow

## Overview

This workflow runs integration tests against a real MongoDB instance using Docker containers.

## Prerequisites

- Docker installed and running
- `mongorestore` available in PATH (from MongoDB tools)

## Running Tests

### All Integration Tests

```bash
cargo test --test integration
```

### Specific Test

```bash
cargo test --test integration test_created_documents
```

### With Verbose Output

```bash
RUST_LOG=debug cargo test --test integration
```

## Test Data

Test datasets are stored in `tests/fixtures/` as JSON files. Each scenario has its own directory with:

- `before.json` - Documents before comparison
- `after.json` - Documents after comparison
- `expected.json` - Expected results (counts)

## Container Management

The workflow uses `testcontainers-rs` to:

1. Start a fresh MongoDB container for each test run
2. Load test data using `mongorestore`
3. Configure the test to use the container's connection string
4. Run comparison logic
5. Stop the container after test completion

## CI/CD Integration

### GitHub Actions

```yaml
name: Integration Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Rust
        uses: dtolnay/rust-toolchain@stable
      
      - name: Cache dependencies
        uses: actions/cache@v4
        with:
          path: ~/.cargo
          key: ${{ runner.os }}-cargo-${{ hashFiles('**/Cargo.lock') }}
      
      - name: Install MongoDB tools
        run: |
          wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
          echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
          sudo apt-get update
          sudo apt-get install -y mongodb-database-tools mongodb-org-tools
      
      - name: Run integration tests
        run: cargo test --test integration
```

## Test Scenarios

| Test | Description |
|------|-------------|
| `test_created_documents` | Verifies created document detection |
| `test_updated_documents` | Verifies updated document detection |
| `test_deleted_documents` | Verifies deleted document detection |
| `test_mixed_changes` | Verifies all change types together |
| `test_empty_collections` | Verifies empty collection handling |
| `test_no_changes` | Verifies identical collections |
| `test_diff_strategy_whitelist` | Verifies whitelist filtering |
| `test_diff_strategy_blacklist` | Verifies blacklist filtering |
| `test_diff_strategy_deep_equality` | Verifies deep equality mode |

## Debugging

### View Container Logs

```bash
docker logs $(docker ps -q -f name=mongo-compare-test)
```

### Reproduce Test Manually

1. Start MongoDB container: `docker run -d --name mongo-test -p 27017:27017 mongo:7.0`
2. Load test data: `mongorestore --host localhost --port 27017 tests/fixtures/created/`
3. Run comparison with CLI: `cargo run -- config.json`
4. Inspect results

### Stop Container

```bash
docker stop mongo-test && docker rm mongo-test
```

## Troubleshooting

### Container Won't Start

- Check Docker is running: `docker ps`
- Check for port conflicts: `lsof -i :27017`
- Try different MongoDB version: `mongo:6.0` or `mongo:5.0`

### Data Load Fails

- Verify BSON files exist: `ls tests/fixtures/*/`
- Check mongorestore is installed: `mongorestore --version`
- Verify MongoDB container is ready: `docker exec mongo-test mongosh --eval "db.adminCommand('ping')"`

### Connection Errors

- Ensure container is running: `docker ps | grep mongo`
- Check container logs: `docker logs <container_id>`
- Verify test configuration uses correct port

## Best Practices

1. **Fresh containers**: Each test run gets a clean MongoDB instance
2. **Fixture files**: Store test data as JSON for easy editing
3. **Isolated tests**: No shared state between test scenarios
4. **Cleanup**: Always stop containers after tests complete
5. **CI caching**: Cache test datasets to speed up CI runs
6. **Local development**: Run tests locally before committing
7. **CI enforcement**: Require integration tests in CI pipeline
