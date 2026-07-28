//! Custom Diff Strategies Tests
//!
//! This module contains all integration tests for verifying custom diff strategies
//! in the comparison results.

use mongo_compare::comparison::find_field_diffs;
use mongo_compare::types::DiffStrategy;
use serde_json::json;
use anyhow::Result;

#[tokio::test]
async fn test_diff_strategy_all() -> Result<()> {
    let _ = env_logger::builder().is_test(true).try_init();

    let doc_before = json!({"id": 1, "name": "Original", "value": 100, "nested": {"field": "old"}});
    let doc_after = json!({"id": 1, "name": "Updated", "value": 100, "nested": {"field": "new"}});

    let diff = find_field_diffs(&doc_before, &doc_after, "id", DiffStrategy::All)?;

    assert_eq!(
        diff.changed_fields.len(),
        2,
        "Should identify 2 changed fields with All strategy"
    );

    let field_names: Vec<String> = diff
        .changed_fields
        .iter()
        .map(|f| f.field_name.clone())
        .collect();

    assert!(field_names.contains(&"name".to_string()), "Should detect 'name' field change");
    assert!(field_names.contains(&"nested.field".to_string()), "Should detect nested field change");

    Ok(())
}

#[tokio::test]
async fn test_diff_strategy_whitelist() -> Result<()> {
    let _ = env_logger::builder().is_test(true).try_init();

    let doc_before = json!({"id": 1, "name": "Original", "value": 100, "nested": {"field": "old"}});
    let doc_after = json!({"id": 1, "name": "Updated", "value": 100, "nested": {"field": "new"}});

    let diff = find_field_diffs(
        &doc_before,
        &doc_after,
        "id",
        DiffStrategy::Whitelist(vec!["name".to_string(), "nested.field".to_string()]),
    )?;

    assert_eq!(
        diff.changed_fields.len(),
        2,
        "Should identify 2 changed fields with whitelist strategy"
    );

    let field_names: Vec<String> = diff
        .changed_fields
        .iter()
        .map(|f| f.field_name.clone())
        .collect();

    assert!(field_names.contains(&"name".to_string()), "Should detect 'name' field change");
    assert!(field_names.contains(&"nested.field".to_string()), "Should detect nested field change");

    Ok(())
}

#[tokio::test]
async fn test_diff_strategy_whitelist_only_identifier() -> Result<()> {
    let _ = env_logger::builder().is_test(true).try_init();

    let doc_before = json!({"id": 1, "name": "Original", "value": 100});
    let doc_after = json!({"id": 1, "name": "Updated", "value": 100});

    let diff = find_field_diffs(&doc_before, &doc_after, "id", DiffStrategy::Whitelist(vec!["id".to_string()]))?;

    assert_eq!(
        diff.changed_fields.len(),
        0,
        "Should identify 0 changed fields when whitelist only contains identifier"
    );

    Ok(())
}

#[tokio::test]
async fn test_diff_strategy_whitelist_empty() -> Result<()> {
    let _ = env_logger::builder().is_test(true).try_init();

    let doc_before = json!({"id": 1, "name": "Original", "value": 100});
    let doc_after = json!({"id": 1, "name": "Updated", "value": 100});

    let diff = find_field_diffs(&doc_before, &doc_after, "id", DiffStrategy::Whitelist(vec![]))?;

    assert_eq!(
        diff.changed_fields.len(),
        0,
        "Should identify 0 changed fields when whitelist is empty"
    );

    Ok(())
}

#[tokio::test]
async fn test_diff_strategy_blacklist() -> Result<()> {
    let _ = env_logger::builder().is_test(true).try_init();

    let doc_before = json!({"id": 1, "name": "Original", "value": 100, "metadata": {"created_at": "2024-01-01"}});
    let doc_after = json!({"id": 1, "name": "Updated", "value": 100, "metadata": {"created_at": "2024-01-01"}});

    let diff = find_field_diffs(
        &doc_before,
        &doc_after,
        "id",
        DiffStrategy::Blacklist(vec!["metadata".to_string()]),
    )?;

    assert_eq!(
        diff.changed_fields.len(),
        1,
        "Should identify 1 changed field with blacklist strategy"
    );

    let field_names: Vec<String> = diff
        .changed_fields
        .iter()
        .map(|f| f.field_name.clone())
        .collect();

    assert!(field_names.contains(&"name".to_string()), "Should detect 'name' field change");
    assert!(!field_names.contains(&"metadata".to_string()), "Should not detect 'metadata' field change");

    Ok(())
}

#[tokio::test]
async fn test_diff_strategy_blacklist_identifier() -> Result<()> {
    let _ = env_logger::builder().is_test(true).try_init();

    let doc_before = json!({"id": 1, "name": "Original", "value": 100});
    let doc_after = json!({"id": 1, "name": "Updated", "value": 100});

    let diff = find_field_diffs(&doc_before, &doc_after, "id", DiffStrategy::Blacklist(vec!["id".to_string()]))?;

    assert_eq!(
        diff.changed_fields.len(),
        1,
        "Should identify 1 changed field (name) when blacklist contains identifier (identifier is skipped anyway)"
    );

    Ok(())
}

#[tokio::test]
async fn test_diff_strategy_blacklist_empty() -> Result<()> {
    let _ = env_logger::builder().is_test(true).try_init();

    let doc_before = json!({"id": 1, "name": "Original", "value": 100});
    let doc_after = json!({"id": 1, "name": "Updated", "value": 100});

    let diff = find_field_diffs(&doc_before, &doc_after, "id", DiffStrategy::Blacklist(vec![]))?;

    assert_eq!(
        diff.changed_fields.len(),
        1,
        "Should identify 1 changed field when blacklist is empty"
    );

    Ok(())
}

#[tokio::test]
async fn test_diff_strategy_deep_equality() -> Result<()> {
    let _ = env_logger::builder().is_test(true).try_init();

    let doc_before = json!({"id": 1, "name": "Original", "nested": {"field1": "value1", "field2": "value2"}});
    let doc_after = json!({"id": 1, "name": "Updated", "nested": {"field1": "value1", "field2": "value2"}});

    let diff = find_field_diffs(&doc_before, &doc_after, "id", DiffStrategy::DeepEquality)?;

    assert_eq!(
        diff.changed_fields.len(),
        1,
        "Should identify 1 changed field (name) with deep equality strategy"
    );

    let field_names: Vec<String> = diff
        .changed_fields
        .iter()
        .map(|f| f.field_name.clone())
        .collect();

    assert!(field_names.contains(&"name".to_string()), "Should detect 'name' field change");
    assert!(!field_names.contains(&"nested".to_string()), "Should not detect nested field change with deep equality");

    Ok(())
}

#[tokio::test]
async fn test_diff_strategy_deep_equality_with_nested_change() -> Result<()> {
    let _ = env_logger::builder().is_test(true).try_init();

    let doc_before = json!({"id": 1, "name": "Original", "nested": {"field1": "value1", "field2": "value2"}});
    let doc_after = json!({"id": 1, "name": "Updated", "nested": {"field1": "value1", "field2": "value3"}});

    let diff = find_field_diffs(&doc_before, &doc_after, "id", DiffStrategy::DeepEquality)?;

    assert_eq!(
        diff.changed_fields.len(),
        1,
        "Should identify 1 changed field (name) with deep equality strategy"
    );

    let field_names: Vec<String> = diff
        .changed_fields
        .iter()
        .map(|f| f.field_name.clone())
        .collect();

    assert!(field_names.contains(&"name".to_string()), "Should detect 'name' field change");
    assert!(!field_names.contains(&"nested.field2".to_string()), "Should not detect nested field change with deep equality");

    Ok(())
}

#[tokio::test]
async fn test_diff_strategy_whitelist_with_nested_fields() -> Result<()> {
    let _ = env_logger::builder().is_test(true).try_init();

    let doc_before = json!({"id": 1, "name": "Original", "nested": {"field1": "value1", "field2": "value2"}});
    let doc_after = json!({"id": 1, "name": "Updated", "nested": {"field1": "value1", "field2": "value2"}});

    let diff = find_field_diffs(
        &doc_before,
        &doc_after,
        "id",
        DiffStrategy::Whitelist(vec!["nested.field1".to_string()]),
    )?;

    assert_eq!(
        diff.changed_fields.len(),
        0,
        "Should identify 0 changed fields when nested field is in whitelist but unchanged"
    );

    Ok(())
}

#[tokio::test]
async fn test_diff_strategy_blacklist_with_nested_fields() -> Result<()> {
    let _ = env_logger::builder().is_test(true).try_init();

    let doc_before = json!({"id": 1, "name": "Original", "nested": {"field1": "value1", "field2": "value2"}});
    let doc_after = json!({"id": 1, "name": "Updated", "nested": {"field1": "value1", "field2": "value2"}});

    let diff = find_field_diffs(
        &doc_before,
        &doc_after,
        "id",
        DiffStrategy::Blacklist(vec!["nested.field1".to_string()]),
    )?;

    assert_eq!(
        diff.changed_fields.len(),
        1,
        "Should identify 1 changed field (name) when nested field is in blacklist"
    );

    Ok(())
}