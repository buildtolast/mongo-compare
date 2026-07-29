# MongoDB Document Comparison

A Rust library and CLI tool for comparing MongoDB collections before and after changes, identifying created, updated, and deleted documents with detailed field-level differences.

## Features

- **Delta Detection**: Identifies created, updated, and deleted documents between two collections
- **Recursive Nested Changes**: Detects changes at any nested depth with dot-notation paths
- **Field-level Diffing**: Shows old and new values for each changed field
- **Sample Reports**: Includes up to 5 sample documents per delta category for human review
- **JSON Input**: Works with JSON arrays of documents, making it easy to integrate with MongoDB backups
- **Batch Processing**: Supports configurable batch sizes for processing large collections

## React UI - MongoDB Diff UI

A modern React-based web interface for MongoDB comparison with real-time monitoring capabilities.

### Features

- **Real-time Monitoring**: MongoDB Change Streams for detecting changes as they happen
- **Interactive HTML Reports**: Side-by-side diff viewers with color-coded highlighting
- **Export Options**: JSON, CSV, and HTML formats
- **Snapshot Management**: Save and load comparison configurations
- **Collection Discovery**: Browse and filter databases/collections
- **Diff Strategies**: Multiple comparison modes (All, Whitelist, Blacklist, DeepEquality)

### Quick Start

```bash
cd mongo-diff-ui
npm install
npm run dev
```

### Build

```bash
npm run build
```

### Tests

```bash
npm test
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

### Unit Tests

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

### Integration Tests with Docker

Run integration tests with a Docker MongoDB container:

```bash
./scripts/test-integration.sh
```

This script:
- Starts a fresh MongoDB 7.0 container
- Runs integration tests against the container
- Cleans up the container after completion

**Requirements:**
- Docker must be running
- `mongorestore` (from MongoDB tools) must be in PATH

### CI/CD

Integration tests run automatically on GitHub Actions:
- On every push to `master` or `main` branch
- On every pull request

See: `.github/workflows/ci.yml`

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
├── mongo-diff-ui/      # React web interface
│   ├── src/
│   │   ├── services/   # Business logic (DiffEngine, MongoDBClient, etc.)
│   │   ├── components/ # React components
│   │   ├── types/      # TypeScript types
│   │   └── contexts/   # React contexts
│   ├── tests/          # Test files
│   └── package.json
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

## Recent Work (2026-07-29)

### Completed Features (Tickets 00-12)

**Project Foundation & Core Services:**
- Ticket 01: Project setup with Vite, React, TypeScript, testing infrastructure
- Ticket 02: MongoDBClient service with connection pooling, TLS, authentication
- Ticket 03: Connection Configuration UI with form validation
- Ticket 04: Collection Discovery & Selection (DatabaseTree, CollectionList, CollectionDiscovery)
- Ticket 05: Snapshot Management (save/load configurations, recurring comparisons)
- Ticket 06: DiffEngine with multiple strategies (All, Whitelist, Blacklist, DeepEquality)
- Ticket 07: Comparison Results Summary with statistics cards

**Comparison & Visualization:**
- Ticket 08: Side-by-Side Diff Viewer for document comparison
- Ticket 09: Color-Coded Diff Viewer with green/red/yellow highlighting

**Export Functionality:**
- Ticket 10: JSON and CSV Export (ExportService)
- Ticket 11: Interactive HTML Report Export with side-by-side viewers, filtering, sorting

**Real-time Monitoring:**
- Ticket 12: Real-time Monitoring with MongoDB Change Streams, reconnection logic, batch processing

### Build & Test Status
- ✅ All 285 tests passing
- ✅ Build passing (vite build)
- ✅ ESLint warnings only (no errors)

### Files Added/Modified
- `src/services/monitoringService.ts` - Real-time monitoring with Change Streams
- `src/components/results/MonitoringStatus.tsx` - Monitoring UI component
- Multiple test files for new services/components

## Future Enhancements

Potential areas for future development:

### High Priority
- Performance optimizations for very large collections
- Real-time monitoring enhancements
- Advanced export formats
- Web build and deployment (Ticket 17)

### Medium Priority
- Support for additional data types (dates, binaries, UUIDs)
- Comparison result caching
- Accessibility compliance (Ticket 14)

### Low Priority
- Parallel comparison for very large collections
- Integration with CI/CD pipelines
- Comparison result storage in database

## License

MIT License - see LICENSE file for details
