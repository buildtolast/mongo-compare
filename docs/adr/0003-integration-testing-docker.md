# ADR 0003: Integration Testing Workflow with Docker MongoDB

## Context

Currently, mongo-compare has unit tests that verify comparison logic in isolation. However, there's no integration testing that verifies the tool works with real MongoDB data, including:

- Actual document retrieval from MongoDB collections
- BSON/JSON serialization/deserialization
- Real-world data scenarios with nested objects, arrays, null values
- Diff strategy behavior with actual database data

## Decision

Implement a comprehensive integration testing workflow that:

1. **Spins up a fresh MongoDB Docker container** for each test run (Option A)
2. **Uses MongoDB dump/restore** to populate test data (Option C)
3. **Tests all scenarios**: created, updated, deleted, mixed, empty, no changes
4. **Verifies all diff strategies** with real MongoDB data (Whitelist, Blacklist, DeepEquality)
5. **Runs both locally and in CI** (GitHub Actions)

## Status

Accepted

## Implementation Plan

### Phase 1: Test Infrastructure
- Create `tests/integration/` module
- Implement MongoDB container management using `testcontainers-rs`
- Load test datasets from `tests/fixtures/` using `mongorestore`
- Create test utilities for common operations

### Phase 2: Test Scenarios
Implement integration tests for:
- Created documents detection
- Updated documents detection
- Deleted documents detection
- Mixed changes scenario
- Empty collections scenario
- No changes scenario

### Phase 3: Diff Strategy Verification
Implement integration tests that verify:
- Whitelist strategy filters fields correctly
- Blacklist strategy excludes fields correctly
- DeepEquality treats nested objects as atomic units

### Phase 4: CI Configuration
- Add GitHub Actions workflow
- Run integration tests on PRs and main branch
- Matrix test across diff strategies

## Test Data Datasets

```
tests/fixtures/
├── created/
│   ├── before.bson
│   └── after.bson
├── updated/
│   ├── before.bson
│   └── after.bson
├── deleted/
│   ├── before.bson
│   └── after.bson
├── mixed/
│   ├── before.bson
│   └── after.bson
├── empty/
│   ├── before.bson
│   └── after.bson
├── no_changes/
│   ├── before.bson
│   └── after.bson
└── strategies/
    ├── whitelist/
    ├── blacklist/
    └── deep_equality/
```

## Container Management

```rust
// Pseudo-code for container lifecycle
async fn start_mongodb_container() -> MongoContainer {
    MongoContainer::new("mongo:7.0")
        .start()
        .await
        .expect("Failed to start MongoDB container")
}

async fn load_dataset(container: &MongoContainer, dataset_path: &Path) {
    let port = container.get_host_port_ipv4(27017);
    let uri = format!("mongodb://localhost:{}", port);
    // Use mongorestore to load BSON files
}
```

## Trade-offs

| Trade-off | Decision | Rationale |
|-----------|----------|-----------|
| Fresh container per test vs shared | Fresh container | Test isolation, no cross-test contamination |
| MongoDB dump vs programmatic insertion | Dump/restore | Easier to create realistic test data, reusable across test scenarios |
| All scenarios vs subset | All scenarios | Comprehensive coverage, catches edge cases |
| Unit tests only vs integration + unit | Both | Unit tests for logic, integration for real-world behavior |
| Local only vs local + CI | Both | Development speed + CI safety net |

## Validation

Integration tests will be validated by:

1. **Passing all test scenarios** with expected document counts
2. **Correct diff strategy behavior** verified against sample documents
3. **Zero warnings** with `cargo clippy`
4. **100% coverage** of comparison logic paths
5. **Successful CI pipeline** on GitHub Actions

## Related ADRs

- [ADR 0001](./0001-event-sourced-orders.md) - Event-sourced orders (example reference)
- [ADR 0002](./0002-postgres-for-write-model.md) - Postgres for write model (example reference)

## Next Steps

1. Implement `tests/integration/mod.rs` with container management
2. Create test dataset fixtures for each scenario
3. Implement integration tests following TDD pattern
4. Add GitHub Actions workflow
5. Run full test suite before merging
