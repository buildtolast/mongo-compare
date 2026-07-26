# MongoDB Document Comparison Context

A library and CLI tool for comparing MongoDB collections before and after changes, identifying created, updated, and deleted documents with detailed field-level differences.

## Language

**Document**:
A single record in a MongoDB collection, identified by a unique field and containing arbitrary JSON data.

**Comparison**:
A side-by-side analysis of two collections to identify the delta between them — what was added, changed, and removed.

**Identifier Field**:
The unique field name used to match documents between the "before" and "after" collections (e.g., "id", "_id").

**Diff**:
The set of fields that have changed between two documents, including nested field changes with their old and new values.

**Comparison Result**:
A structured report containing counts and samples of created, updated, and deleted documents with detailed field differences.

**Before Collection**:
The source collection representing the state before a change operation (e.g., backup, prior state).

**After Collection**:
The target collection representing the state after a change operation (e.g., new backup, updated state).

**Changed Field**:
A single field (including nested paths) that has different values in two documents, recorded with old and new values.

**Sample**:
A limited subset (max 5 items) of documents from each delta category included in the comparison result for human review.

## Rules

- **Recursive nested change detection**: All nested object fields are recursively compared, breaking down complex nested structures into individual field-level changes with dot-notation paths (e.g., `nested.field.subfield`).

- **Identifier-based matching**: Documents are matched exclusively by the identifier field value, not by content or position.

- **Conservative diffing**: Only fields that differ between two documents are marked as changed. Identical nested objects are treated as a single unit.

- **Field value normalization**: Field values are normalized to remove surrounding quotes for consistent comparison, but preserved with quotes in output.

- **Sample limiting**: Only the first 5 changed documents per category are included in the comparison result to keep reports manageable.

- **Null handling**: Adding or removing fields that contain null values is treated as a change, but null-to-null changes are not marked.

- **Object equality**: Two JSON objects are considered equal only when all their fields are identical at every level. Nested objects with different structures are recursively diffed.

- **Batch processing**: The CLI supports processing large collections in configurable batch sizes for memory efficiency.

## Core Types

**DocumentDiff**:
Struct containing an identifier and list of changed fields for a document that has been modified.

**ChangedField**:
Struct containing a field name (with dot notation for nested paths), old value, and new value.

**ComparisonResult**:
Struct containing timestamps, collection names, total counts, and samples of all delta categories.

## Architecture Boundaries

**Input**: Two vectors of JSON documents (before and after collections) with a common identifier field.

**Processing**: Recursive comparison algorithm that builds a HashMap for before documents, then iterates through after documents to match and diff.

**Output**: Structured result with counts and samples for created, updated, and deleted documents with detailed field differences.

**Extensibility Points**:
- Batch processing for large collections
- Custom identifier field selection
- Configurable sample limits
- Additional diff strategies (e.g., deep equality for objects)
- Support for additional data types (dates, binary, etc.)

## Usage Scenarios

1. **Backup Comparison**: Compare a database backup before and after a deployment to understand what changed.

2. **Migration Validation**: Validate that a migration completed correctly by comparing pre and post migration data.

3. **Audit Trail**: Track what fields were modified in documents over time.

4. **Data Quality Check**: Verify that expected documents exist and haven't been accidentally modified.

5. **Change Validation**: Ensure specific document changes occurred as expected after a manual or automated update.