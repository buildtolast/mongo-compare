//! Updated Documents Tests
//!
//! This module contains all integration tests for verifying that documents with
//! identical identifiers but different field values are correctly identified
//! as updated with proper difference details.

use anyhow::Result;
use mongo_compare::comparison::{compare_documents, find_field_diffs};
use mongo_compare::types::{ChangeField, DiffStrategy, DocumentDiff};
use serde_json::json;

#[tokio::test]
async fn test_updated_documents_all_aspects() -> Result<()> {
    let _ = env_logger::builder().is_test(true).try_init();

    let docs_before: Vec<serde_json::Value> = vec![
        json!({"id": 1, "name": "Original Name 1", "value": 100}),
        json!({"id": 2, "name": "Original Name 2", "value": 200}),
        json!({"id": 3, "name": "Original Name 3", "value": 300, "nested": {"field": "old"}}),
    ];

    let docs_after: Vec<serde_json::Value> = vec![
        json!({"id": 1, "name": "Updated Name 1", "value": 100}),
        json!({"id": 2, "name": "Updated Name 2", "value": 250}),
        json!({"id": 3, "name": "Original Name 3", "value": 300, "nested": {"field": "new"}}),
        json!({"id": 4, "name": "New Document", "value": 400}),
    ];

    let (created, updated, _deleted, sample_updated, _sample_created, _sample_deleted) =
        compare_documents(docs_before, docs_after, "id", 5, DiffStrategy::All)?;

    assert_eq!(created, 1, "Should identify 1 created document");
    assert_eq!(updated, 3, "Should identify 3 updated documents");
    assert_eq!(_deleted, 0, "Should not identify any deleted documents");

    let expected_updated = vec![
        DocumentDiff {
            identifier: "1".to_string(),
            changes: vec![ChangeField {
                path: "name".to_string(),
                old_value: Some("Original Name 1".to_string()),
                new_value: Some("Updated Name 1".to_string()),
                change_type: "changed".to_string(),
            }],
        },
        DocumentDiff {
            identifier: "2".to_string(),
            changes: vec![
                ChangeField {
                    path: "name".to_string(),
                    old_value: Some("Original Name 2".to_string()),
                    new_value: Some("Updated Name 2".to_string()),
                    change_type: "changed".to_string(),
                },
                ChangeField {
                    path: "value".to_string(),
                    old_value: Some("200".to_string()),
                    new_value: Some("250".to_string()),
                    change_type: "changed".to_string(),
                },
            ],
        },
    ];

    for expected in expected_updated {
        assert!(
            sample_updated.iter().any(|actual| {
                actual.identifier == expected.identifier && actual.changes == expected.changes
            }),
            "Expected updated document not found in sample_updated"
        );
    }

    Ok(())
}

#[tokio::test]
async fn test_updated_documents_nested_and_array_changes() -> Result<()> {
    let _ = env_logger::builder().is_test(true).try_init();

    let docs_before: Vec<serde_json::Value> = vec![
        json!({"id": 1, "name": "Test", "nested": {"field1": "value1", "field2": "value2"}}),
        json!({"id": 2, "name": "Test", "items": [1, 2, 3]}),
    ];

    let docs_after: Vec<serde_json::Value> = vec![
        json!({"id": 1, "name": "Test", "nested": {"field1": "value1", "field2": "new_value2"}}),
        json!({"id": 2, "name": "Test", "items": [1, 2, 3, 4]}),
        json!({"id": 3, "name": "Test", "nested": {"field1": "value1", "field2": "value2"}}),
    ];

    let (created, updated, _deleted, sample_updated, _sample_created, _sample_deleted) =
        compare_documents(docs_before, docs_after, "id", 5, DiffStrategy::All)?;

    assert_eq!(created, 1, "Should identify 1 created document");
    assert_eq!(updated, 2, "Should identify 2 updated documents");
    assert_eq!(_deleted, 0, "Should not identify any deleted documents");

    let expected_updated = DocumentDiff {
        identifier: "1".to_string(),
        changes: vec![ChangeField {
            path: "nested.field2".to_string(),
            old_value: Some("value2".to_string()),
            new_value: Some("new_value2".to_string()),
            change_type: "changed".to_string(),
        }],
    };

    let found = sample_updated.iter().find(|actual| {
        actual.identifier == expected_updated.identifier && actual.changes == expected_updated.changes
    });

    assert!(
        found.is_some(),
        "Expected updated document with nested field change not found"
    );

    Ok(())
}

#[tokio::test]
async fn test_updated_documents_multiple_fields_null_values() -> Result<()> {
    let _ = env_logger::builder().is_test(true).try_init();

    let docs_before: Vec<serde_json::Value> = vec![
        json!({"id": 1, "name": "Test", "field1": "value1", "field2": "value2"}),
        json!({"id": 2, "name": "Test", "field1": "value1"}),
    ];

    let docs_after: Vec<serde_json::Value> = vec![
        json!({"id": 1, "name": "Test", "field1": "value1", "field2": null, "field3": "value3"}),
        json!({"id": 2, "name": "Test", "field1": "value1", "field2": null}),
    ];

    let (created, updated, _deleted, sample_updated, _sample_created, _sample_deleted) =
        compare_documents(docs_before, docs_after, "id", 5, DiffStrategy::All)?;

    assert_eq!(created, 0, "Should not identify any created documents");
    assert_eq!(updated, 2, "Should identify 2 updated documents");
    assert_eq!(_deleted, 0, "Should not identify any deleted documents");

    // NOTE: field3 (id=1) and field2 (id=2) are present only on the after-side,
    // so the diff engine correctly reports them as "added" with old_value: None,
    // rather than the old buggy "null" string sentinel.
    let expected_updates = vec![
        DocumentDiff {
            identifier: "1".to_string(),
            changes: vec![
                ChangeField {
                    path: "field2".to_string(),
                    old_value: Some("value2".to_string()),
                    new_value: Some("null".to_string()),
                    change_type: "changed".to_string(),
                },
                ChangeField {
                    path: "field3".to_string(),
                    old_value: None,
                    new_value: Some("value3".to_string()),
                    change_type: "added".to_string(),
                },
            ],
        },
        DocumentDiff {
            identifier: "2".to_string(),
            changes: vec![ChangeField {
                path: "field2".to_string(),
                old_value: None,
                new_value: Some("null".to_string()),
                change_type: "added".to_string(),
            }],
        },
    ];

    println!("DEBUG: expected_updates: {:?}", expected_updates);
    println!("DEBUG: sample_updated: {:?}", sample_updated);

    for expected in expected_updates {
        assert!(
            sample_updated.iter().any(|actual| {
                actual.identifier == expected.identifier && actual.changes == expected.changes
            }),
            "Expected updated document not found in sample_updated"
        );
    }

    Ok(())
}

#[tokio::test]
async fn test_find_field_diffs() -> Result<()> {
    let _ = env_logger::builder().is_test(true).try_init();

    let doc_before = json!({"id": 1, "name": "Original", "value": 100, "nested": {"field": "old"}});
    let doc_after = json!({"id": 1, "name": "Updated", "value": 100, "nested": {"field": "new"}});

    let diff = find_field_diffs(&doc_before, &doc_after, "id", DiffStrategy::All)?;

    println!("DEBUG: changed_fields: {:?}", diff.changed_fields);
    println!("DEBUG: field_names: {:?}", {
        diff.changed_fields
            .iter()
            .map(|f| f.path.clone())
            .collect::<Vec<_>>()
    });

    assert_eq!(
        diff.changed_fields.len(),
        2,
        "Should identify 2 changed fields"
    );

    let field_names: Vec<String> = diff
        .changed_fields
        .iter()
        .map(|f| f.path.clone())
        .collect();

    assert!(
        field_names.contains(&"name".to_string()),
        "Should detect 'name' field change"
    );
    assert!(
        field_names.contains(&"nested.field".to_string()),
        "Should detect nested field change"
    );

    Ok(())
}

#[tokio::test]
async fn test_find_field_diffs_no_changes() -> Result<()> {
    let _ = env_logger::builder().is_test(true).try_init();

    let doc_before = json!({"id": 1, "name": "Test", "value": 100});
    let doc_after = json!({"id": 1, "name": "Test", "value": 100});

    let diff = find_field_diffs(&doc_before, &doc_after, "id", DiffStrategy::All)?;

    assert_eq!(
        diff.changed_fields.len(),
        0,
        "Should not identify any changed fields when documents are identical"
    );

    Ok(())
}
