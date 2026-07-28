//! Created Documents Tests
//!
//! This module contains all integration tests for verifying that newly added
//! documents in the "after" collection are correctly identified as created.

use anyhow::Result;
use mongo_compare::comparison::compare_documents;
use mongo_compare::types::DiffStrategy;
use serde_json::json;

#[tokio::test]
async fn test_created_documents_all_aspects() -> Result<()> {
    let _ = env_logger::builder().is_test(true).try_init();

    let docs_before: Vec<serde_json::Value> = vec![
        json!({"id": 1, "name": "Document 1", "value": 100}),
        json!({"id": 2, "name": "Document 2", "value": 200}),
        json!({"id": 3, "name": "Document 3", "value": 300}),
    ];

    let docs_after: Vec<serde_json::Value> = vec![
        json!({"id": 1, "name": "Document 1", "value": 100}),
        json!({"id": 2, "name": "Document 2", "value": 200}),
        json!({"id": 3, "name": "Document 3", "value": 300}),
        json!({"id": 4, "name": "New Document", "value": 400}),
        json!({"id": 5, "name": "Another New Document", "value": 500}),
        json!({"id": 6, "name": "Yet Another New Document", "value": 600}),
    ];

    let (created, updated, deleted, sample_updated, sample_created, sample_deleted) =
        compare_documents(docs_before, docs_after, "id", 5, DiffStrategy::All)?;

    assert_eq!(created, 3, "Should identify 3 created documents");
    assert_eq!(updated, 0, "Should not identify any updated documents");
    assert_eq!(deleted, 0, "Should not identify any deleted documents");

    assert_eq!(
        sample_updated.len(),
        0,
        "Should have no sample updated documents"
    );
    assert_eq!(
        sample_created.len(),
        3,
        "Should have 3 sample created documents"
    );
    assert_eq!(
        sample_deleted.len(),
        0,
        "Should have no sample deleted documents"
    );

    let sample_created_ids = [json!(4), json!(5), json!(6)];

    for (i, id) in sample_created_ids.iter().enumerate() {
        assert!(
            sample_created.iter().any(|doc| doc.get("id") == Some(id)),
            "Sample created document id {} should be in sample_created",
            i
        );
    }

    Ok(())
}

#[tokio::test]
async fn test_created_documents_various_data_types() -> Result<()> {
    let _ = env_logger::builder().is_test(true).try_init();

    let docs_before: Vec<serde_json::Value> = vec![
        json!({"id": 1, "name": "Test", "string_field": "hello"}),
        json!({"id": 2, "name": "Test", "number_field": 42}),
        json!({"id": 3, "name": "Test", "boolean_field": true}),
        json!({"id": 4, "name": "Test", "nested": {"key": "value"}}),
        json!({"id": 5, "name": "Test", "array_field": [1, 2, 3]}),
    ];

    let docs_after: Vec<serde_json::Value> = vec![
        json!({"id": 1, "name": "Test", "string_field": "hello"}),
        json!({"id": 2, "name": "Test", "number_field": 42}),
        json!({"id": 3, "name": "Test", "boolean_field": true}),
        json!({"id": 4, "name": "Test", "nested": {"key": "value"}}),
        json!({"id": 5, "name": "Test", "array_field": [1, 2, 3]}),
        json!({"id": 6, "name": "Test", "null_field": null}),
        json!({"id": 7, "name": "Test", "string_field": "new_string"}),
        json!({"id": 8, "name": "Test", "nested": {"new_key": "new_value"}}),
        json!({"id": 9, "name": "Test", "array_field": [4, 5, 6]}),
    ];

    let (created, updated, _deleted, _sample_updated, sample_created, _sample_deleted) =
        compare_documents(docs_before, docs_after, "id", 5, DiffStrategy::All)?;

    assert_eq!(created, 4, "Should identify 4 created documents");
    assert_eq!(updated, 0, "Should not identify any updated documents");

    let sample_created_ids = [json!(6), json!(7), json!(8), json!(9)];

    for (i, id) in sample_created_ids.iter().enumerate() {
        assert!(
            sample_created.iter().any(|doc| doc.get("id") == Some(id)),
            "Sample created document id {} should be in sample_created",
            i
        );
    }

    Ok(())
}
