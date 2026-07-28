# Integration Test Module

This module provides infrastructure for running integration tests with a real MongoDB instance.

## Setup

```rust
use mongo_compare::integration::mongodb_container::start_mongodb_container;
use mongo_compare::integration::test_data::load_test_data;

#[tokio::test]
async fn test_example() {
    // Start MongoDB container
    let container = start_mongodb_container()
        .await
        .expect("Failed to start MongoDB container");
    
    // Load test data
    load_test_data(&container, "tests/fixtures/created")
        .await
        .expect("Failed to load test data");
    
    // Get connection string
    let connection_string = container.connection_string();
    
    // Run your test using the connection string
    // ...
}
```

## Container Management

### start_mongodb_container

Starts a fresh MongoDB container using `testcontainers-rs`.

```rust
let container = start_mongodb_container().await?;
let port = container.get_host_port_ipv4(27017);
let uri = format!("mongodb://localhost:{}", port);
```

### Container Lifecycle

The container is automatically cleaned up when dropped:

```rust
{
    let container = start_mongodb_container().await?;
    // Container is running
} // Container is stopped here
```

## Test Data Loading

### load_test_data

Loads test data from a fixture directory using `mongorestore`.

```rust
load_test_data(&container, "tests/fixtures/created").await?;
```

### Fixture Directory Structure

```
tests/fixtures/
├── created/
│   ├── before.bson
│   └── after.bson
├── updated/
│   └── ...
```

## Integration Tests

### Basic Pattern

```rust
#[tokio::test]
async fn test_created_documents() {
    let _ = env_logger::builder().is_test(true).try_init();
    
    let container = start_mongodb_container()
        .await
        .expect("Failed to start MongoDB container");
    
    load_test_data(&container, "tests/fixtures/created")
        .await
        .expect("Failed to load test data");
    
    let port = container.get_host_port_ipv4(27017);
    let uri = format!("mongodb://localhost:{}", port);
    
    // Run comparison test
    // ...
}
```

### With Diff Strategies

```rust
#[tokio::test]
async fn test_diff_strategy_whitelist() {
    // Setup container and data...
    
    let strategy = DiffStrategy::Whitelist(vec!["name".to_string()]);
    
    // Run comparison with whitelist strategy
    // Verify only whitelisted fields are compared
}
```

## Best Practices

1. **Fresh containers**: Each test gets a clean MongoDB instance
2. **Cleanup on drop**: Containers auto-stop when dropped
3. **Test isolation**: No shared state between tests
4. **Fixture files**: Store test data in JSON/BSON format
5. **Error handling**: Properly propagate container startup errors

## Dependencies

- `testcontainers-rs` - Docker container orchestration
- `tokio` - Async runtime
- `mongodb` - MongoDB driver

## CI/CD

For CI/CD integration, see `.github/workflows/integration-tests.yml`.
