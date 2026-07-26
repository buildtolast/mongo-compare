# MongoDB Document Comparison

A Rust library and CLI tool for comparing MongoDB collections before and after changes, identifying created, updated, and deleted documents with detailed field-level differences.

## Features

- **Delta Detection**: Identifies created, updated, and deleted documents between two collections
- **Recursive Nested Changes**: Detects changes at any nested depth with dot-notation paths
- **Field-level Diffing**: Shows old and new values for each changed field
- **Sample Reports**: Includes up to 5 sample documents per delta category for human review
- **JSON Input**: Works with JSON arrays of documents, making it easy to integrate with MongoDB backups
- **Batch Processing**: Supports configurable batch sizes for processing large collections

## Quick Start

### CLI Usage

```bash
cargo run -- --help
```

### Library Usage

```rust
use mongo_compare::comparison::compare_documents;
use serde_json::json;
use anyhow::Result;

let docs_before: Vec<serde_json::Value> = vec![
    json!({"id": 1, "name": "Original", "nested": {"field": "old"}}),
    json!({"id": 2, "name": "Original"}),
];

let docs_after: Vec<serde_json::Value> = vec![
    json!({"id": 1, "name": "Updated", "nested": {"field": "new"}}),
    json!({"id": 2, "name": "Updated"}),
    json!({"id": 3, "name": "New"}),
];

let (created, updated, deleted, sample_updated, sample_created, sample_deleted) =
    compare_documents(docs_before, docs_after, "id")?;

println!("Created: {}", created);
println!("Updated: {}", updated);
println!("Deleted: {}", deleted);
```

## Architecture

### Core Concepts

- **Document**: A single record in a MongoDB collection with a unique identifier field
- **Comparison**: Side-by-side analysis of two collections to find the delta
- **Identifier Field**: The unique field used to match documents between collections
- **Diff**: Field-level differences with old and new values, including nested paths

### Comparison Algorithm

1. **Build HashMap**: Store before-collection documents by identifier field in a HashMap
2. **Match Documents**: Iterate through after-collection documents and find matches in HashMap
3. **Detect Changes**: For matched documents, recursively compare nested fields
4. **Count Categories**: Track created, updated, and deleted documents
5. **Sample Results**: Collect up to 5 sample documents per category

### Nested Field Detection

The comparison recursively traverses nested objects, producing dot-notation paths:
- `name` → top-level field
- `nested.field` → one level deep
- `nested.field.subfield` → multiple levels deep

## Testing

Run all tests:

```bash
cargo test
```

Run tests with verbose output:

```bash
cargo test -- --nocapture
```

Run specific test files:

```bash
cargo test --test created_documents_test
cargo test --test updated_documents_test
cargo test --test deleted_documents_test
```

## Project Structure

```
mongo-compare/
├── src/
│   ├── comparison.rs    # Core comparison logic
│   ├── config.rs        # Configuration parsing
│   ├── mongo.rs         # MongoDB connection helpers
│   ├── main.rs          # CLI entry point
│   ├── output.rs        # Output formatting
│   └── types.rs         # Core type definitions
├── tests/
│   ├── created_documents_test.rs
│   ├── deleted_documents_test.rs
│   └── updated_documents_test.rs
├── docs/
│   └── adr/            # Architecture decision records
└── Cargo.toml
```

## Development Guidelines

### Adding New Features

1. **Review Context**: Read `CONTEXT.md` to understand domain concepts
2. **Check ADRs**: Review `docs/adr/` for architectural decisions
3. **Run Tests**: Ensure all tests pass before making changes
4. **Add Tests**: Include tests for new functionality
5. **Update Documentation**: Update context and docs as needed

### Code Style

- Follow Rust conventions from the `rust-patterns` skill
- Use idiomatic Rust patterns and error handling
- Prefer immutability when possible
- Use descriptive names for all identifiers

### Testing Strategy

- Write tests for all new functionality
- Use `#[tokio::test]` for async tests
- Include both positive and edge case scenarios
- Test nested field detection thoroughly

## Architecture Decisions

Key architectural decisions are recorded in `docs/adr/`:
- `0001-hashmap-comparison.md` - HashMap-based O(n) comparison algorithm
- `0002-recursive-nested-detection.md` - Recursive nested field change detection
- `0003-dot-notation-paths.md` - Dot-notation for nested field paths
- `0004-conservative-diffing.md` - Conservative diffing approach

## Future Enhancements

Potential areas for future development:

### High Priority
- MongoDB direct connection support
- Custom diff strategies (deep equality, field whitelisting/blacklisting)
- Configurable sample limits
- Performance optimizations for very large collections

### Medium Priority
- Support for additional data types (dates, binaries, UUIDs)
- Batch processing integration with MongoDB
- Diff output formatting options (JSON, CSV, HTML)
- Comparison result caching

### Low Priority
- Parallel comparison for very large collections
- Comparison result visualization
- Integration with CI/CD pipelines
- Comparison result storage in database

## License

MIT License - see LICENSE file for details