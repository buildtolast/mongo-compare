//! Created Documents Integration Test
//!
//! This test verifies that newly added documents in the "after" collection
//! are correctly identified as created.

use mongo_compare::types::DiffStrategy;
use serde_json::json;

#[tokio::test]
async fn test_created_documents_all_aspects() {
    let _ = env_logger::builder().is_test(true).try_init();
    
    // Use the library function directly
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
    ];
    
    let (created, updated, deleted, sample_updated, sample_created, sample_deleted) =
        mongo_compare::comparison::compare_documents(
            docs_before,
            docs_after,
            "id",
            5,
            DiffStrategy::All,
        )
        .expect("Comparison failed");
    
    assert_eq!(created, 3, "Should identify 3 created documents");
    assert_eq!(updated, 0, "Should not identify any updated documents");
    assert_eq!(deleted, 0, "Should not identify any deleted documents");
    
    assert_eq!(sample_updated.len(), 0, "Should have no sample updated documents");
    assert_eq!(sample_created.len(), 3, "Should have 3 sample created documents");
    assert_eq!(sample_deleted.len(), 0, "Should have no sample deleted documents");
}
