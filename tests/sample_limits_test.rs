//! Configurable Sample Limits Tests
//!
//! This module contains all integration tests for verifying configurable sample limits
//! in the comparison results.

use mongo_compare::comparison::compare_documents;
use mongo_compare::types::DiffStrategy;
use serde_json::json;
use anyhow::Result;


#[tokio::test]
async fn test_sample_limit_zero_suppresses_output() -> Result<()> {
    let _ = env_logger::builder().is_test(true).try_init();

    let docs_before: Vec<serde_json::Value> = vec![
        json!({"id": 1, "name": "Document 1", "value": 100}),
        json!({"id": 2, "name": "Document 2", "value": 200}),
    ];

    let docs_after: Vec<serde_json::Value> = vec![
        json!({"id": 1, "name": "Document 1", "value": 100}),
        json!({"id": 2, "name": "Document 2", "value": 200}),
        json!({"id": 3, "name": "New Document", "value": 300}),
        json!({"id": 4, "name": "Another New Document", "value": 400}),
    ];

    let (created, updated, deleted, sample_updated, sample_created, sample_deleted) =
        compare_documents(docs_before.clone(), docs_after.clone(), "id", 0, DiffStrategy::All)?;

    assert_eq!(created, 2, "Should identify 2 created documents");
    assert_eq!(updated, 0, "Should not identify any updated documents");
    assert_eq!(deleted, 0, "Should not identify any deleted documents");

    assert_eq!(sample_updated.len(), 0, "Should have no sample updated documents");
    assert_eq!(sample_created.len(), 0, "Should have no sample created documents");
    assert_eq!(sample_deleted.len(), 0, "Should have no sample deleted documents");

    Ok(())
}

#[tokio::test]
async fn test_sample_limit_custom_returns_exact_count() -> Result<()> {
    let _ = env_logger::builder().is_test(true).try_init();

    let docs_before: Vec<serde_json::Value> = vec![
        json!({"id": 1, "name": "Document 1", "value": 100}),
        json!({"id": 2, "name": "Document 2", "value": 200}),
    ];

    let docs_after: Vec<serde_json::Value> = vec![
        json!({"id": 1, "name": "Document 1", "value": 100}),
        json!({"id": 2, "name": "Document 2", "value": 200}),
        json!({"id": 3, "name": "New Document", "value": 300}),
        json!({"id": 4, "name": "Another New Document", "value": 400}),
        json!({"id": 5, "name": "Yet Another New Document", "value": 500}),
    ];

    let (created, updated, _deleted, _sample_updated, sample_created, _sample_deleted) =
        compare_documents(docs_before.clone(), docs_after.clone(), "id", 3, DiffStrategy::All)?;

    assert_eq!(created, 3, "Should identify 3 created documents");
    assert_eq!(updated, 0, "Should not identify any updated documents");

    assert_eq!(sample_created.len(), 3, "Should have exactly 3 sample created documents");

    let sample_created_ids = [json!(3), json!(4), json!(5)];

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
async fn test_sample_limit_exceeds_document_count() -> Result<()> {
    let _ = env_logger::builder().is_test(true).try_init();

    let docs_before: Vec<serde_json::Value> = vec![
        json!({"id": 1, "name": "Document 1", "value": 100}),
        json!({"id": 2, "name": "Document 2", "value": 200}),
    ];

    let docs_after: Vec<serde_json::Value> = vec![
        json!({"id": 1, "name": "Document 1", "value": 100}),
        json!({"id": 2, "name": "Document 2", "value": 200}),
        json!({"id": 3, "name": "New Document", "value": 300}),
    ];

    let (created, _updated, _deleted, _sample_updated, sample_created, _sample_deleted) =
        compare_documents(docs_before.clone(), docs_after.clone(), "id", 10, DiffStrategy::All)?;

    assert_eq!(created, 1, "Should identify 1 created document");

    assert_eq!(sample_created.len(), 1, "Should have 1 sample created document (capped at actual count)");

    Ok(())
}

#[tokio::test]
async fn test_sample_limit_zero_with_updated_documents() -> Result<()> {
    let _ = env_logger::builder().is_test(true).try_init();

    let docs_before: Vec<serde_json::Value> = vec![
        json!({"id": 1, "name": "Original Name 1", "value": 100}),
        json!({"id": 2, "name": "Original Name 2", "value": 200}),
    ];

    let docs_after: Vec<serde_json::Value> = vec![
        json!({"id": 1, "name": "Updated Name 1", "value": 100}),
        json!({"id": 2, "name": "Updated Name 2", "value": 200}),
        json!({"id": 3, "name": "New Document", "value": 300}),
    ];

    let (created, updated, _deleted, sample_updated, sample_created, _sample_deleted) =
        compare_documents(docs_before.clone(), docs_after.clone(), "id", 0, DiffStrategy::All)?;

    assert_eq!(created, 1, "Should identify 1 created document");
    assert_eq!(updated, 2, "Should identify 2 updated documents");

    assert_eq!(sample_created.len(), 0, "Should have no sample created documents");
    assert_eq!(sample_updated.len(), 0, "Should have no sample updated documents");

    Ok(())
}

#[tokio::test]
async fn test_sample_limit_zero_with_deleted_documents() -> Result<()> {
    let _ = env_logger::builder().is_test(true).try_init();

    let docs_before: Vec<serde_json::Value> = vec![
        json!({"id": 1, "name": "Document 1", "value": 100}),
        json!({"id": 2, "name": "Document 2", "value": 200}),
        json!({"id": 3, "name": "Document 3", "value": 300}),
    ];

    let docs_after: Vec<serde_json::Value> = vec![
        json!({"id": 1, "name": "Document 1", "value": 100}),
        json!({"id": 2, "name": "Document 2", "value": 200}),
    ];

    let (_created, _updated, deleted, _sample_updated, _sample_created, sample_deleted) =
        compare_documents(docs_before.clone(), docs_after.clone(), "id", 0, DiffStrategy::All)?;

    assert_eq!(deleted, 1, "Should identify 1 deleted document");

    assert_eq!(sample_deleted.len(), 0, "Should have no sample deleted documents");

    Ok(())
}

#[tokio::test]
async fn test_sample_limit_applies_to_all_categories() -> Result<()> {
    let _ = env_logger::builder().is_test(true).try_init();

    let docs_before: Vec<serde_json::Value> = vec![
        json!({"id": 1, "name": "Original Name 1", "value": 100}),
        json!({"id": 2, "name": "Original Name 2", "value": 200}),
    ];

    let docs_after: Vec<serde_json::Value> = vec![
        json!({"id": 1, "name": "Updated Name 1", "value": 100}),
        json!({"id": 2, "name": "Updated Name 2", "value": 200}),
        json!({"id": 3, "name": "New Document", "value": 300}),
        json!({"id": 4, "name": "Another New Document", "value": 400}),
    ];

    let (created, updated, deleted, sample_updated, sample_created, sample_deleted) =
        compare_documents(docs_before.clone(), docs_after.clone(), "id", 1, DiffStrategy::All)?;

    assert_eq!(created, 2, "Should identify 2 created documents");
    assert_eq!(updated, 2, "Should identify 2 updated documents");
    assert_eq!(deleted, 0, "Should not identify any deleted documents");

    assert_eq!(sample_created.len(), 1, "Should have 1 sample created document");
    assert_eq!(sample_updated.len(), 1, "Should have 1 sample updated document");
    assert_eq!(sample_deleted.len(), 0, "Should have no sample deleted documents");

    Ok(())
}

#[tokio::test]
async fn test_sample_limit_default_five() -> Result<()> {
    let _ = env_logger::builder().is_test(true).try_init();

    let docs_before: Vec<serde_json::Value> = vec![
        json!({"id": 1, "name": "Document 1", "value": 100}),
        json!({"id": 2, "name": "Document 2", "value": 200}),
    ];

    let docs_after: Vec<serde_json::Value> = vec![
        json!({"id": 1, "name": "Document 1", "value": 100}),
        json!({"id": 2, "name": "Document 2", "value": 200}),
        json!({"id": 3, "name": "New Document", "value": 300}),
        json!({"id": 4, "name": "Another New Document", "value": 400}),
        json!({"id": 5, "name": "Yet Another New Document", "value": 500}),
        json!({"id": 6, "name": "New Document 6", "value": 600}),
    ];

    let (created, _updated, _deleted, _sample_updated, sample_created, _sample_deleted) =
        compare_documents(docs_before.clone(), docs_after.clone(), "id", 5, DiffStrategy::All)?;

    assert_eq!(created, 4, "Should identify 4 created documents");

    assert_eq!(sample_created.len(), 4, "Should have 4 sample created documents");

    let sample_created_ids = [json!(3), json!(4), json!(5), json!(6)];

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
async fn test_sample_limit_with_no_changes() -> Result<()> {
    let _ = env_logger::builder().is_test(true).try_init();

    let docs_before: Vec<serde_json::Value> = vec![
        json!({"id": 1, "name": "Document 1", "value": 100}),
        json!({"id": 2, "name": "Document 2", "value": 200}),
    ];

    let docs_after: Vec<serde_json::Value> = vec![
        json!({"id": 1, "name": "Document 1", "value": 100}),
        json!({"id": 2, "name": "Document 2", "value": 200}),
    ];

    let (created, updated, deleted, sample_updated, sample_created, sample_deleted) =
        compare_documents(docs_before.clone(), docs_after.clone(), "id", 5, DiffStrategy::All)?;

    assert_eq!(created, 0, "Should not identify any created documents");
    assert_eq!(updated, 0, "Should not identify any updated documents");
    assert_eq!(deleted, 0, "Should not identify any deleted documents");

    assert_eq!(sample_created.len(), 0, "Should have no sample created documents");
    assert_eq!(sample_updated.len(), 0, "Should have no sample updated documents");
    assert_eq!(sample_deleted.len(), 0, "Should have no sample deleted documents");

    Ok(())
}