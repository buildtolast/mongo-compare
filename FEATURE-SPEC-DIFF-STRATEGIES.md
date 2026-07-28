# Spec: Custom Diff Strategies for MongoDB Document Comparison

## Problem Statement

Currently, the mongo-compare tool compares all fields in MongoDB documents when detecting differences. This behavior has limitations:

1. **Field-level control needed**: Users may want to ignore specific fields during comparison (whitelist/blacklist approach)
2. **Deep equality vs shallow comparison**: Some use cases require deep equality for nested objects, while others need field-by-field comparison
3. **Performance optimization**: Comparing entire nested objects can be expensive for large documents

The current implementation always performs field-by-field comparison of all fields, which may not be optimal for all use cases.

## Solution

Implement custom diff strategies that allow users to specify how fields should be compared:

1. **Whitelist Strategy**: Only compare specified fields (ignore all other fields)
2. **Blacklist Strategy**: Compare all fields except specified ones (ignore specific fields)
3. **Deep Equality Mode**: Use deep equality for nested objects instead of field-by-field comparison
4. **Field-level Comparison Control**: Allow users to specify comparison behavior per field

## User Stories

1. As a data analyst comparing complex nested documents, I want to use deep equality mode so that I can compare entire nested objects rather than individual fields.

2. As a developer comparing documents with metadata fields (created_at, updated_at, version), I want to use a whitelist strategy so that only business fields are compared.

3. As a QA engineer testing document changes, I want to use a blacklist strategy to ignore system fields like __v, _id, or internal metadata.

4. As a performance-sensitive user comparing large documents, I want to compare only specific fields to reduce comparison time.

5. As a library user, I want to pass a diff strategy to the comparison function so that I can integrate the comparison logic with custom comparison rules.

6. As a user comparing documents with nested arrays, I want field-by-field comparison so that I can see exactly which array elements changed.

7. As a user comparing documents with nested objects, I want deep equality mode so that I can treat nested objects as atomic units.

8. As a developer extending the tool, I want to implement custom diff strategies for specific data types (e.g., custom date parsing, custom UUID comparison).

9. As a user comparing documents with optional fields, I want the comparison to handle field presence differences gracefully.

10. As a CI/CD pipeline operator, I want to configure diff strategies in config files so that comparison behavior is consistent across environments.

## Implementation Decisions

### Strategy Enum

Define a `DiffStrategy` enum with three variants:

```rust
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum DiffStrategy {
    /// Compare all fields (default behavior)
    All,
    /// Only compare specified fields (whitelist)
    Whitelist(Vec<String>),
    /// Compare all fields except specified ones (blacklist)
    Blacklist(Vec<String>),
    /// Use deep equality for nested objects instead of field-by-field
    DeepEquality,
}
```

### Config Integration

Add `diff_strategy` field to the Config struct:

```rust
#[derive(Debug, Deserialize)]
pub struct Config {
    pub mongo_uri: String,
    pub db_name: String,
    pub collection_before: String,
    pub collection_after: String,
    pub filter: serde_json::Value,
    pub unique_identifier_field: String,
    pub batch_size: usize,
    pub output_file: String,
    pub sample_limit: usize,
    pub diff_strategy: DiffStrategy,
}
```

### Library API Changes

Modify `find_field_diffs` function to accept a diff strategy:

```rust
pub fn find_field_diffs(
    doc_before: &JsonValue,
    doc_after: &JsonValue,
    identifier_field: &str,
    strategy: DiffStrategy,
) -> Result<FieldDiff>
```

### Strategy Implementation Details

**All Strategy**: Current behavior - compare all fields

**Whitelist Strategy**: Only compare fields in the whitelist vector. Ignore all other fields.

**Blacklist Strategy**: Compare all fields except those in the blacklist vector.

**Deep Equality Strategy**: Use `json_eq` function for nested objects instead of `find_nested_diffs`. This treats nested objects as atomic units.

### Module Changes

- `src/types.rs`: Add `DiffStrategy` enum and update Config struct
- `src/comparison.rs`: Update `find_field_diffs` to accept and use DiffStrategy
- `src/config.rs`: Update load_config to parse diff_strategy from JSON
- `src/main.rs`: Pass diff_strategy from Config to find_field_diffs
- `tests/*.rs`: Add tests for different diff strategies

## Testing Decisions

- **Test coverage**: Add comprehensive tests to verify:
  - All strategy works as before (backward compatibility)
  - Whitelist strategy only compares specified fields
  - Blacklist strategy ignores specified fields
  - Deep equality strategy treats nested objects as atomic
  - Field-by-field comparison still works for non-nested objects
  - Identifier field is never compared

- **Test approach**: Follow existing test patterns. Create separate test functions for each strategy.

- **Edge cases**: Test scenarios where:
  - Whitelist contains only identifier field (no comparison)
  - Whitelist is empty (should compare nothing)
  - Blacklist contains identifier field (should work correctly)
  - Blacklist is empty (should compare everything)
  - Deep equality with complex nested structures
  - Mixed nested and non-nested fields

- **Integration tests**: Update existing tests to verify they still pass with the new strategy parameter.

- **Regression tests**: Ensure all existing tests pass without specifying a strategy.

- **Test organization**: Add test functions in existing test files:
  - `test_diff_strategy_whitelist` in created_documents_test.rs
  - `test_diff_strategy_blacklist` in created_documents_test.rs
  - `test_diff_strategy_deep_equality` in updated_documents_test.rs
  - Similar tests in deleted_documents_test.rs

## Out of Scope

- Different strategies per comparison category (created, updated, deleted) - use a single strategy for all comparisons
- Per-field strategy specification (too complex for this iteration)
- Custom diff strategy implementation hooks (future enhancement)
- Field value normalization options (keep current behavior)
- Array comparison strategies (keep current field-by-field behavior)

## Further Notes

- This feature addresses a user feedback item from the code review regarding "Custom Diff Strategies" as a High Priority enhancement.
- The implementation maintains backward compatibility by using `DiffStrategy::All` as the default.
- Diff strategies apply equally to all three comparison categories (created, updated, deleted) for consistency.
- The diff strategy parameter should be documented in the library's public API (src/lib.rs).
- Consider adding command-line flags for diff strategy options as an alternative to config file configuration.
- Future enhancement: Allow per-field strategy specification for advanced use cases.