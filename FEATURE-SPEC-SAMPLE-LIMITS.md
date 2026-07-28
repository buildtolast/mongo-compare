# Spec: Configurable Sample Limits for Comparison Results

## Problem Statement

Currently, the mongo-compare tool always includes up to 5 sample documents per comparison category (created, updated, deleted) in the output. This default may not be appropriate for all use cases:

- Users with large comparison results may want fewer samples to keep output readable
- Users needing detailed analysis may want more samples
- Automated processing pipelines may want configurable sample sizes
- Some use cases may want no samples at all

The current implementation hardcodes the sample limit of 5, which limits flexibility and user control over the output verbosity.

## Solution

Implement configurable sample limits that allow users to specify how many sample documents to include per comparison category. This will be done by:

1. Adding a `sample_limit` field to the Config struct
2. Modifying the `compare_documents` function to accept a sample limit parameter
3. Updating the CLI to read and pass the sample limit from configuration
4. Adding validation to ensure sample_limit is a non-negative integer

## User Stories

1. As a user comparing small collections (10-50 documents), I want to see all updated documents in the sample, so that I can review all changes without truncating the output.

2. As a user comparing large collections (10,000+ documents), I want to limit sample sizes to 3 or fewer, so that the output remains readable and doesn't overwhelm me with data.

3. As a CI/CD pipeline operator, I want to configure sample limits via environment variables or config file, so that I can automate comparison reporting at different verbosity levels.

4. As a data analyst, I want to set a higher sample limit (e.g., 10-20), so that I can review more detailed changes for thorough analysis.

5. As a CLI user, I want to override the config file sample limit via command-line argument, so that I can quickly test different verbosity levels without editing config files.

6. As a library user, I want to control sample limits when calling `compare_documents`, so that I can integrate the comparison logic into my own applications with custom output requirements.

7. As a user generating HTML reports, I want to disable samples entirely, so that the report focuses on summary statistics rather than detailed document examples.

8. As a user running comparison tests, I want to set sample limit to 0, so that no sample documents are included in the output for faster processing.

9. As a developer extending the tool, I want to use the sample limit parameter in custom comparison logic, so that I can implement different sampling strategies.

10. As a user with very small changesets, I want the sample limit to automatically cap at the actual number of changes, so that I see all available samples.

11. As a user comparing nested document structures, I want samples to respect the sample limit at each nesting level, so that I don't get overwhelmed with deeply nested field changes.

12. As a user reviewing comparison results programmatically, I want the sample limit to be consistently applied across all comparison categories, so that the output size is predictable.

## Implementation Decisions

- **Config struct modification**: Add `sample_limit: Option<usize>` field to the Config struct. Using `Option` allows users to specify "use default" or explicit limits.

- **Default sample limit**: Maintain the current behavior of 5 as the default when sample_limit is not specified.

- **Library API change**: Modify `compare_documents` signature from:
  ```rust
  pub fn compare_documents(
      docs_before: Vec<JsonValue>,
      docs_after: Vec<JsonValue>,
      identifier_field: &str,
  ) -> Result<(usize, usize, usize, Vec<DocumentDiff>, Vec<JsonValue>, Vec<JsonValue>)>
  ```
  
  To:
  ```rust
  pub fn compare_documents(
      docs_before: Vec<JsonValue>,
      docs_after: Vec<JsonValue>,
      identifier_field: &str,
      sample_limit: usize,
  ) -> Result<(usize, usize, usize, Vec<DocumentDiff>, Vec<JsonValue>, Vec<JsonValue>)>
  ```
  
  The `sample_limit` parameter will be applied to all three categories (created, updated, deleted).

- **CLI configuration**: Update `config.json` schema to include `sample_limit` field. Add validation to ensure sample_limit >= 0.

- **Backward compatibility**: For library users who don't specify sample_limit, maintain a default of 5 to avoid breaking existing code.

- **Validation**: Add runtime validation in the CLI to ensure sample_limit is non-negative. Handle cases where sample_limit exceeds available documents by capping at actual count.

- **Module changes**:
  - `src/types.rs`: Add `sample_limit` field to Config struct
  - `src/config.rs`: Update load_config to parse sample_limit from JSON
  - `src/comparison.rs`: Add sample_limit parameter to compare_documents function
  - `src/main.rs`: Pass sample_limit from Config to compare_documents
  - `src/output.rs`: Update print_summary to handle sample_limit=0 (suppress sample output)
  - `tests/*.rs`: Add tests for different sample_limit values

## Testing Decisions

- **Test coverage**: Add comprehensive tests in all three test files to verify:
  - sample_limit=0 suppresses sample output
  - sample_limit=3 returns exactly 3 samples per category (or fewer if fewer changes exist)
  - sample_limit > number of changes returns all available samples
  - sample_limit=-1 (invalid) is handled gracefully
  - Default sample_limit=5 works as before

- **Test approach**: Follow existing test patterns in tests/created_documents_test.rs, tests/deleted_documents_test.rs, and tests/updated_documents_test.rs. Use the same `#[tokio::test]` async pattern and `env_logger::builder().is_test(true).try_init()` setup.

- **Edge cases**: Test scenarios where:
  - There are 0 created documents but sample_limit=5 (should return empty Vec)
  - There are 2 created documents but sample_limit=5 (should return 2 docs)
  - sample_limit=0 with any changes (should return empty Vec)
  - sample_limit exceeds document count (should return all docs)

- **Integration tests**: Update existing integration tests to verify they still pass with the new parameter, and add new tests for specific sample_limit scenarios.

- **Regression tests**: Ensure that existing tests that don't use sample_limit still pass (backward compatibility).

- **Test organization**: Add test functions in existing test files:
  - `test_sample_limit_zero` in created_documents_test.rs
  - `test_sample_limit_custom` in created_documents_test.rs
  - Similar tests in deleted_documents_test.rs and updated_documents_test.rs

## Out of Scope

- Different sample limits per comparison category (created vs updated vs deleted) - only one limit applies to all categories.
- Dynamic sample adjustment based on document size (e.g., smaller samples for larger documents).
- Statistical sampling (random selection) - always use first N samples.
- Configurable sample limit format (e.g., percentage of total changes).
- Sample limit validation at library level - only at CLI level for simplicity.
- Preserving sample order (current behavior keeps first N samples).

## Further Notes

- This feature addresses a user feedback item from the code review regarding "Configurable sample limits" as a High Priority enhancement.
- The implementation maintains the principle of "conservative diffing" from ADR-0004 by only showing samples, not the full diff.
- Sample limits apply equally to all three comparison categories (created, updated, deleted) for consistency.
- The sample limit parameter should be documented in the library's public API (src/lib.rs).
- Consider adding a `--sample-limit` command-line flag as an alternative to config file configuration.
- Future enhancement: Allow per-category sample limits for advanced use cases.