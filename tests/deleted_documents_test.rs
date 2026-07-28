//! Deleted Documents Tests
//!
//! This module contains all integration tests for verifying that documents removed
//! from the "after" collection are correctly identified as deleted.

use mongo_compare::comparison::compare_documents;
    use mongo_compare::types::DiffStrategy;
    use serde_json::json;
    use anyhow::Result;


    #[tokio::test]
    async fn test_deleted_documents_all_aspects() -> Result<()> {
        let _ = env_logger::builder().is_test(true).try_init();

        let docs_before: Vec<serde_json::Value> = vec![
            json!({"id": 1, "name": "Document 1", "value": 100}),
            json!({"id": 2, "name": "Document 2", "value": 200}),
            json!({"id": 3, "name": "Document 3", "value": 300}),
            json!({"id": 4, "name": "Document 4", "value": 400}),
        ];

        let docs_after: Vec<serde_json::Value> = vec![
            json!({"id": 1, "name": "Document 1", "value": 100}),
            json!({"id": 2, "name": "Document 2", "value": 200}),
        ];

        let (created, updated, deleted, sample_updated, _sample_created, sample_deleted) =
            compare_documents(docs_before, docs_after, "id", 5, DiffStrategy::All)?;

    assert_eq!(created, 0, "Should not identify any created documents");
    assert_eq!(updated, 0, "Should not identify any updated documents");
    assert_eq!(deleted, 2, "Should identify 2 deleted documents");
    assert_eq!(sample_updated.len(), 0, "Should have no sample updated documents");

    let sample_deleted_ids = [json!(4), json!(3)];

    for (i, id) in sample_deleted_ids.iter().enumerate() {
        assert!(
            sample_deleted.iter().any(|doc| doc.get("id") == Some(id)),
            "Sample deleted document id {} should be in sample_deleted",
            i
        );
    }

    Ok(())
}