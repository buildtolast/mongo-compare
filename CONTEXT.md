# MongoDB Document Comparison Context

A library and CLI tool for comparing MongoDB collections before and after changes, identifying created, updated, and deleted documents with detailed field-level differences.

## Language

**Document**:
A single record in a MongoDB collection, identified by a unique field and containing arbitrary JSON data.

**Comparison**:
A side-by-side analysis of two collections to identify the delta between them — what was added, changed, and removed.

**Identifier Field**:
The unique field name used to match documents between the "before" and "after" collections (e.g., "id", "_id"). Can be auto-detected or manually selected. Composite keys (multiple fields combined) are supported for complex matching scenarios.

**Diff**:
The set of fields that have changed between two documents, including nested field changes with their old and new values.

**Comparison Result**:
A structured report containing timestamps, collection names, total counts, and full details of created, updated, and deleted documents with complete field differences (not limited to samples).

**Source Instance**:
A live MongoDB instance connection (host, port, credentials, TLS settings, connection pool configuration) that serves as one side of the comparison.

**Target Instance**:
A second live MongoDB instance connection, distinct from the source, used for comparing collections across database boundaries.

**Collection Selection**:
The process of choosing specific databases and collections from MongoDB instances for comparison, supporting browse/filter discovery and pattern matching for batch operations.

**Export Format**:
The output format for comparison results, supporting JSON (raw structured data), CSV (tabular format), and HTML (interactive visual report with side-by-side viewers and color-coded highlighting).

**Comparison Mode**:
The operational mode for comparisons — either one-time manual runs or continuous monitoring with real-time change detection and automatic diffing.

**Batch Comparison**:
The ability to compare multiple collection pairs in a single operation, either sequentially or in parallel, with shared configuration or per-pair customization.

**Snapshot**:
A saved reference point (connection configuration and collection selection) that can be loaded for recurring comparisons or used as a baseline for ongoing sync monitoring.

## Rules

- **Full diff output**: All changed documents and their complete field-level differences are included in comparison results (no sample limiting). Export functionality handles large result sets.

- **Recursive nested change detection**: All nested object fields are recursively compared, breaking down complex nested structures into individual field-level changes with dot-notation paths (e.g., `nested.field.subfield`).

- **Identifier-based matching**: Documents are matched by identifier field value with hybrid auto-detection (common patterns like `_id`, `id`, `ID`) and manual override support. Composite keys are supported by combining multiple fields.

- **Conservative diffing**: Only fields that differ between two documents are marked as changed. Identical nested objects are treated as a single unit.

- **Field value normalization**: Field values are normalized to remove surrounding quotes for consistent comparison, but preserved with quotes in output.

- **Null handling**: Adding or removing fields that contain null values is treated as a change, but null-to-null changes are not marked.

- **Object equality**: Two JSON objects are considered equal only when all their fields are identical at every level. Nested objects with different structures are recursively diffed.

- **Batch processing**: The CLI supports processing large collections in configurable batch sizes for memory efficiency.

- **Connection security**: All MongoDB connections support username/password authentication, TLS/SSL encryption, and configurable connection pooling parameters.

- **Export handling**: Large result sets are exported to files (JSON, CSV, HTML) rather than displayed in-memory to ensure full data availability.

## Core Types

**DocumentDiff**:
Struct containing an identifier and list of changed fields for a document that has been modified.

**ChangedField**:
Struct containing a field name (with dot notation for nested paths), old value, and new value.

**ComparisonResult**:
Struct containing timestamps, collection names, total counts, and full details of all delta categories (created, updated, deleted documents with complete diff data).

**ConnectionConfig**:
Configuration object for MongoDB instance connections including host, port, credentials, TLS settings, connection pool size, and timeout parameters.

**CollectionSelector**:
Object defining database and collection selection criteria, supporting exact name matching, pattern matching (wildcards/regex), and batch selection.

**ComparisonConfig**:
Complete configuration for a comparison operation including source/target connections, collection selectors, identifier field specification, export format preferences, and mode (one-time vs continuous).

**ExportResult**:
Comparison result packaged in requested format (JSON, CSV, or HTML) with full diff data and visualization support (color-coded highlighting, side-by-side viewers).

## Architecture Boundaries

**Input**: Two live MongoDB instance connections with selected database/collection pairs, identifier field specification, and export format configuration.

**Processing**: 
- Connection management with secure authentication and connection pooling
- Collection discovery and selection (browse/filter and pattern matching)
- Parallel or sequential batch comparison for multiple collection pairs
- Recursive diff algorithm with full result generation
- Export formatting (JSON/CSV/HTML) with visualization support

**Output**: 
- Structured result with counts and full details for created, updated, and deleted documents
- Export files in requested format (JSON, CSV, HTML)
- Real-time monitoring streams for continuous comparison mode

**Extensibility Points**:
- Multiple export formats (JSON, CSV, HTML with interactive visualization)
- Batch comparison support (single and multiple collection pairs)
- Snapshot saving/loading for recurring comparisons
- Custom identifier field detection rules
- Connection pool configuration per instance
- Real-time change detection via MongoDB change streams

## Usage Scenarios

1. **Backup Comparison**: Compare a database backup before and after a deployment to understand what changed.

2. **Migration Validation**: Validate that a migration completed correctly by comparing pre and post migration data.

3. **Audit Trail**: Track what fields were modified in documents over time.

4. **Data Quality Check**: Verify that expected documents exist and haven't been accidentally modified.

5. **Change Validation**: Ensure specific document changes occurred as expected after a manual or automated update.

6. **Live Database Sync Verification**: Compare two live MongoDB instances to verify data synchronization between primary and replica, or between staging and production.

7. **Multi-tenant Data Comparison**: Compare collections across different tenant databases to identify inconsistencies or drift.

8. **Batch Migration Validation**: Run comparisons on multiple collections simultaneously to validate large-scale data operations.

9. **Recurring Monitoring**: Schedule regular comparisons against a reference snapshot to detect unauthorized or unexpected changes.

10. **Export for Analysis**: Generate comparison reports in CSV/HTML format for sharing with stakeholders or importing into analysis tools.

## Deployment Architecture

### Docker Compose Setup

The application can be deployed using Docker Compose with three separate services:

**1. React UI Service** (`mongo-diff-ui`)
- Serves static React application via **nginx** (production) or Vite (development)
- Connects to MongoDB instances via configurable environment variables
- Port: 5173 (development) or 80 (production)
- Nginx handles: gzip compression, cache headers, reverse proxy

**2. Rust Backend Service** (`mongo-compare`)
- Provides API endpoints for comparison operations via **actix-web** or **axum**
- Connects to MongoDB for direct collection comparison
- Serves static React files from `dist/` directory
- Can be used for batch processing or scheduled comparisons

**3. MongoDB Service**
- Single or multiple MongoDB instances
- Configurable via environment variables
- Supports authentication, TLS, and connection pooling

### Connection Configuration

The React UI connects to MongoDB instances via:
- **Environment variables**: `VITE_SOURCE_MONGODB_URI`, `VITE_TARGET_MONGODB_URI`
- **Connection form**: Manual input of connection strings
- **Snapshot loading**: Pre-saved configurations

### MongoDB Deployment Scenarios

The UI supports three scenarios for MongoDB deployment:

**1. Same Instance, Different Collections** (Demo/Learning)
- Source and target point to same MongoDB instance
- Compare different collections with same schema
- Example: `collection_before` vs `collection_after`

**2. Same Instance, Same Collection** (Change Tracking)
- Source and target point to same MongoDB instance
- Compare same collection at different points in time
- Requires timestamp-based filtering

**3. Different Instances** (Production)
- Source and target point to different MongoDB instances
- Compare production vs staging, primary vs replica
- Full flexibility for cross-instance comparison

### Connection Configuration

The React UI connects to MongoDB instances via:
- **Environment variables**: `VITE_MONGODB_URI`, `VITE_MONGODB_DB`, etc.
- **Connection form**: Manual input of connection strings
- **Snapshot loading**: Pre-saved configurations

### Nginx Configuration

The React UI uses nginx to serve static files with:
- Gzip compression for faster loading
- Cache headers for performance
- Reverse proxy for API endpoints (if needed)
- Custom error pages

### Usage Scenarios

1. **Demo/Learning**: Run all three services locally with Docker Compose
2. **Production**: Deploy UI to cloud, connect to managed MongoDB (MongoDB Atlas, etc.)
3. **CI/CD**: Use Rust CLI for automated comparisons in pipelines

## Rust Backend Configuration

The Rust backend uses **actix-web** or **axum** to:
- Serve static React files from `dist/` directory
- Provide API endpoints for comparison operations
- Handle authentication and security
- Support health check and metrics endpoints

## Nginx Configuration

The React UI uses nginx to serve static files with:
- Gzip compression for faster loading
- Cache headers for performance
- Reverse proxy for API endpoints (if needed)
- Custom error pages

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

## Resume Point

**Next Priority: Ticket 13 — Performance Optimization**

This ticket focuses on:
- Optimizing large collection comparisons
- Memory-efficient streaming
- Parallel processing improvements
- Caching strategies

**Alternative Resume Points:**
- Ticket 14: Accessibility Compliance (WCAG 2.1 AA)
- Ticket 15: Testing Suite (E2E tests, integration testing)

### How to Resume

If you want to continue from a specific ticket, just say:
- "Resume from ticket 13" (Performance Optimization)
- "Resume from ticket 14" (Accessibility Compliance)
- "Resume from ticket 15" (Testing Suite)
- Or specify any other ticket number

## GitHub Issues Policy

**All issues must be created in GitHub Issues tab, NOT as markdown files.**

- **Never create `.scratch/mongo-diff-ui/issues/*.md` files for active work**
- **All tickets (01-28) must exist as GitHub Issues with proper tracking**
- **Use GitHub Issues tab for:**
  - Task tracking
  - Progress monitoring
  - Assignment
  - Labels (priority, status, blocked, etc.)
  - Comments and discussions
  - Linking related issues
- **Markdown issue files are only for:**
  - Historical/archived work
  - ADRs (Architectural Decision Records)
  - Documentation references

**To create a new issue:**
1. Go to GitHub Issues tab
2. Click "New issue"
3. Fill in title, description, labels, assignee
4. Submit
5. Reference the issue number in commits/docs

## Issue Numbering

GitHub issues use sequential numbering across all issues (open + closed). When issues are closed or deleted, their numbers may not be reused immediately, creating gaps in the sequence.

**Current issue numbers:**
- **Completed tickets (01-13):** Closed issues #34-#20 (various numbers)
- **Review/Validation issues (14-18, 20-28):** Open issues #36-#44 (various numbers)
- **End-to-end implementation (new):** Open issues #45-#47

**Issue numbers are NOT sequential** (e.g., gap between #28 and #45) because:
- Some issues were created, reviewed, and closed
- GitHub doesn't reuse issue numbers
- New issues continue from the next available number

**To find the latest issue number:** Check the GitHub Issues tab or run:
```bash
gh issue list --state open --json number | jq '.[0].number'
```

**To close an issue:**
- Mark as "won't do" with reason if not relevant
- Link to duplicate issue if applicable
- Include resolution notes in comment
