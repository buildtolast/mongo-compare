//! Updated Documents Tests
//!
//! This module contains all integration tests for verifying that documents with
//! identical identifiers but different field values are correctly identified
//! as updated with proper difference details.

use mongo_compare::comparison::{compare_documents, find_field_diffs};
use mongo_compare::types::{DocumentDiff, ChangedField};
use serde_json::json;
use anyhow::Result;

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

    let (created, updated, deleted, sample_updated, sample_created, sample_deleted) =
        compare_documents(docs_before, docs_after, "id")?;

    assert_eq!(created, 1, "Should identify 1 created document");
    assert_eq!(updated, 3, "Should identify 3 updated documents");
    assert_eq!(deleted, 0, "Should not identify any deleted documents");

    let expected_updated = vec![
        DocumentDiff {
            identifier: "1".to_string(),
            changed_fields: vec![
                ChangedField {
                    field_name: "name".to_string(),
                    old_value: "Original Name 1".to_string(),
                    new_value: "Updated Name 1".to_string(),
                },
            ],
        },
        DocumentDiff {
            identifier: "2".to_string(),
            changed_fields: vec![
                ChangedField {
                    field_name: "name".to_string(),
                    old_value: "Original Name 2".to_string(),
                    new_value: "Updated Name 2".to_string(),
                },
                ChangedField {
                    field_name: "value".to_string(),
                    old_value: "200".to_string(),
                    new_value: "250".to_string(),
                },
            ],
        },
    ];

    for expected in expected_updated {
        assert!(
            sample_updated.iter().any(|actual| {
                actual.identifier == expected.identifier
                    && actual.changed_fields == expected.changed_fields
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

    let (created, updated, deleted, sample_updated, sample_created, sample_deleted) =
        compare_documents(docs_before, docs_after, "id")?;

    assert_eq!(created, 1, "Should identify 1 created document");
    assert_eq!(updated, 2, "Should identify 2 updated documents");
    assert_eq!(deleted, 0, "Should not identify any deleted documents");

    let expected_updated = DocumentDiff {
        identifier: "1".to_string(),
        changed_fields: vec![
            ChangedField {
                field_name: "nested.field2".to_string(),
                old_value: "value2".to_string(),
                new_value: "new_value2".to_string(),
            },
        ],
    };

    let found = sample_updated.iter().find(|actual| {
        actual.identifier == expected_updated.identifier
            && actual.changed_fields == expected_updated.changed_fields
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

    let (created, updated, deleted, sample_updated, sample_created, sample_deleted) =
        compare_documents(docs_before, docs_after, "id")?;

    assert_eq!(created, 0, "Should not identify any created documents");
    assert_eq!(updated, 2, "Should identify 2 updated documents");
    assert_eq!(deleted, 0, "Should not identify any deleted documents");

    let expected_updates = vec![
        DocumentDiff {
            identifier: "1".to_string(),
            changed_fields: vec![
                ChangedField {
                    field_name: "field2".to_string(),
                    old_value: "value2".to_string(),
                    new_value: "null".to_string(),
                },
                ChangedField {
                    field_name: "field3".to_string(),
                    old_value: "null".to_string(),
                    new_value: "value3".to_string(),
                },
            ],
        },
        DocumentDiff {
            identifier: "2".to_string(),
            changed_fields: vec![
                ChangedField {
                    field_name: "field2".to_string(),
                    old_value: "null".to_string(),
                    new_value: "null".to_string(),
                },
            ],
        },
    ];

    println!("DEBUG: expected_updates: {:?}", expected_updates);
    println!("DEBUG: sample_updated: {:?}", sample_updated);

    for expected in expected_updates {
        assert!(
            sample_updated.iter().any(|actual| {
                actual.identifier == expected.identifier
                    && actual.changed_fields == expected.changed_fields
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

    let diff = find_field_diffs(&doc_before, &doc_after, "id")?;

    println!("DEBUG: changed_fields: {:?}", diff.changed_fields);
    println!("DEBUG: field_names: {:?}", {
        diff.changed_fields.iter().map(|f| f.field_name.clone()).collect::<Vec<_>>()
    });

    assert_eq!(
        diff.changed_fields.len(),
        2,
        "Should identify 2 changed fields"
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
async fn test_find_field_diffs_no_changes() -> Result<()> {
    let _ = env_logger::builder().is_test(true).try_init();

    let doc_before = json!({"id": 1, "name": "Test", "value": 100});
    let doc_after = json!({"id": 1, "name": "Test", "value": 100});

    let diff = find_field_diffs(&doc_before, &doc_after, "id")?;

    assert_eq!(
        diff.changed_fields.len(),
        0,
        "Should not identify any changed fields when documents are identical"
    );

    Ok(())
}