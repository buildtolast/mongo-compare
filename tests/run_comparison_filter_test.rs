//! HTTP-boundary integration tests for the `/api/run-comparison` endpoint's
//! query-filter support (`source_filter` / `target_filter`).
//!
//! Requires a live MongoDB reachable at `mongodb://localhost:27017` (same
//! Docker container the rest of this project's integration suite expects —
//! see scripts/test-integration.sh). Run via:
//!
//!   docker run -d --name mongo-compare-integration -p 27017:27017 --rm mongo:7.0
//!   cargo test --test run_comparison_filter_test
//!   docker stop mongo-compare-integration

use actix_web::{test, App};
use mongo_compare::server_app::configure_app;
use mongodb::bson::doc;
use mongodb::Client;
use serde_json::{json, Value};

const MONGO_URI: &str = "mongodb://localhost:27017";

/// Seeds a fresh, uniquely-named source/target database pair with a single
/// collection so tests don't interfere with each other, and returns the
/// (source_db_name, target_db_name, collection_name) used.
async fn seed_data(test_name: &str) -> (String, String, String) {
    let client = Client::with_uri_str(MONGO_URI)
        .await
        .expect("failed to connect to MongoDB - is the Docker container running?");

    let source_db_name = format!("filter_test_source_{}", test_name);
    let target_db_name = format!("filter_test_target_{}", test_name);
    let collection_name = "items".to_string();

    // Start from a clean slate.
    client.database(&source_db_name).drop().await.unwrap();
    client.database(&target_db_name).drop().await.unwrap();

    let source_coll = client
        .database(&source_db_name)
        .collection::<mongodb::bson::Document>(&collection_name);
    let target_coll = client
        .database(&target_db_name)
        .collection::<mongodb::bson::Document>(&collection_name);

    // Source: 5 documents, 2 of them status "active".
    source_coll
        .insert_many(vec![
            doc! { "id": 1, "status": "active", "name": "one" },
            doc! { "id": 2, "status": "inactive", "name": "two" },
            doc! { "id": 3, "status": "active", "name": "three" },
            doc! { "id": 4, "status": "inactive", "name": "four" },
            doc! { "id": 5, "status": "inactive", "name": "five" },
        ])
        .await
        .unwrap();

    // Target: same 5 documents (unchanged), 3 of them status "active".
    target_coll
        .insert_many(vec![
            doc! { "id": 1, "status": "active", "name": "one" },
            doc! { "id": 2, "status": "inactive", "name": "two" },
            doc! { "id": 3, "status": "active", "name": "three" },
            doc! { "id": 4, "status": "active", "name": "four" },
            doc! { "id": 5, "status": "inactive", "name": "five" },
        ])
        .await
        .unwrap();

    (source_db_name, target_db_name, collection_name)
}

fn base_request(
    source_db: &str,
    target_db: &str,
    collection: &str,
) -> serde_json::Map<String, Value> {
    let mut map = serde_json::Map::new();
    map.insert(
        "source_connection_string".to_string(),
        json!(MONGO_URI),
    );
    map.insert(
        "target_connection_string".to_string(),
        json!(MONGO_URI),
    );
    map.insert("database".to_string(), json!(source_db));
    map.insert("target_database".to_string(), json!(target_db));
    map.insert("collections".to_string(), json!([collection]));
    map.insert("identifier_field".to_string(), json!("id"));
    map.insert("sample_limit".to_string(), json!(10));
    map.insert("diff_strategy".to_string(), json!("all"));
    map
}

#[actix_web::test]
async fn unfiltered_comparison_returns_full_document_counts() {
    let (source_db, target_db, collection) = seed_data("unfiltered").await;
    let app = test::init_service(App::new().configure(configure_app)).await;

    let body = base_request(&source_db, &target_db, &collection);

    let req = test::TestRequest::post()
        .uri("/api/run-comparison")
        .set_json(&body)
        .to_request();
    let resp = test::call_service(&app, req).await;

    assert!(resp.status().is_success());
    let body: Value = test::read_body_json(resp).await;
    assert_eq!(body["success"], json!(true));
    assert_eq!(body["result"]["total_before"], json!(5));
    assert_eq!(body["result"]["total_after"], json!(5));
}

#[actix_web::test]
async fn source_only_filter_narrows_source_side_and_leaves_target_unaffected() {
    let (source_db, target_db, collection) = seed_data("source_only").await;
    let app = test::init_service(App::new().configure(configure_app)).await;

    let mut body = base_request(&source_db, &target_db, &collection);
    body.insert("source_filter".to_string(), json!({ "status": "active" }));

    let req = test::TestRequest::post()
        .uri("/api/run-comparison")
        .set_json(&body)
        .to_request();
    let resp = test::call_service(&app, req).await;

    assert!(resp.status().is_success());
    let body: Value = test::read_body_json(resp).await;
    assert_eq!(body["success"], json!(true));
    // Source has 2 "active" docs; target is unfiltered, so all 5 come through.
    assert_eq!(body["result"]["total_before"], json!(2));
    assert_eq!(body["result"]["total_after"], json!(5));
}

#[actix_web::test]
async fn source_and_target_filters_both_applied() {
    let (source_db, target_db, collection) = seed_data("both_filters").await;
    let app = test::init_service(App::new().configure(configure_app)).await;

    let mut body = base_request(&source_db, &target_db, &collection);
    body.insert("source_filter".to_string(), json!({ "status": "active" }));
    body.insert("target_filter".to_string(), json!({ "status": "active" }));

    let req = test::TestRequest::post()
        .uri("/api/run-comparison")
        .set_json(&body)
        .to_request();
    let resp = test::call_service(&app, req).await;

    assert!(resp.status().is_success());
    let body: Value = test::read_body_json(resp).await;
    assert_eq!(body["success"], json!(true));
    // Source has 2 "active" docs; target has 3 "active" docs.
    assert_eq!(body["result"]["total_before"], json!(2));
    assert_eq!(body["result"]["total_after"], json!(3));
}

#[actix_web::test]
async fn malformed_source_filter_returns_400_naming_source() {
    let (source_db, target_db, collection) = seed_data("malformed_source").await;
    let app = test::init_service(App::new().configure(configure_app)).await;

    let mut body = base_request(&source_db, &target_db, &collection);
    // A JSON string (not an object) cannot convert to a BSON document.
    body.insert("source_filter".to_string(), json!("not-an-object"));

    let req = test::TestRequest::post()
        .uri("/api/run-comparison")
        .set_json(&body)
        .to_request();
    let resp = test::call_service(&app, req).await;

    assert_eq!(resp.status(), 400);
    let body: Value = test::read_body_json(resp).await;
    assert_eq!(body["success"], json!(false));
    let error_message = body["error"].as_str().unwrap_or_default();
    assert!(
        error_message.contains("source"),
        "expected error message to name 'source', got: {}",
        error_message
    );
}

#[actix_web::test]
async fn malformed_target_filter_returns_400_naming_target() {
    let (source_db, target_db, collection) = seed_data("malformed_target").await;
    let app = test::init_service(App::new().configure(configure_app)).await;

    let mut body = base_request(&source_db, &target_db, &collection);
    body.insert("target_filter".to_string(), json!("not-an-object"));

    let req = test::TestRequest::post()
        .uri("/api/run-comparison")
        .set_json(&body)
        .to_request();
    let resp = test::call_service(&app, req).await;

    assert_eq!(resp.status(), 400);
    let body: Value = test::read_body_json(resp).await;
    assert_eq!(body["success"], json!(false));
    let error_message = body["error"].as_str().unwrap_or_default();
    assert!(
        error_message.contains("target"),
        "expected error message to name 'target', got: {}",
        error_message
    );
}
