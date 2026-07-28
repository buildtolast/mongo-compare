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
The operational模式 for comparisons — either one-time manual runs or continuous monitoring with real-time change detection and automatic diffing.

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