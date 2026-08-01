use actix_cors::Cors;
use actix_web::{web, App, HttpServer, HttpResponse};
use anyhow::Result as AnyResult;
use futures_util::stream::StreamExt;
use futures_util::TryStreamExt;
use mongodb::bson::{doc, Document};
use mongo_compare::{
    comparison::compare_documents,
    mongo::{connect_to_mongo, get_collection},
    types::{ComparisonResult, CreatedDiff, DeletedDiff, DiffStrategy, UpdatedDiff},
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
struct TestConnectionRequest {
    connection_string: String,
}

#[derive(Debug, Serialize)]
struct TestConnectionResponse {
    success: bool,
    message: String,
}

async fn test_connection(
    req: web::Json<TestConnectionRequest>,
) -> HttpResponse {
    match connect_to_mongo(&req.connection_string).await {
        Ok(_) => HttpResponse::Ok().json(TestConnectionResponse {
            success: true,
            message: "Connection successful".to_string(),
        }),
        Err(e) => HttpResponse::BadRequest().json(TestConnectionResponse {
            success: false,
            message: e.to_string(),
        }),
    }
}

#[derive(Debug, Deserialize)]
struct GetDatabasesRequest {
    connection_string: String,
}

#[derive(Debug, Serialize)]
struct GetDatabasesResponse {
    success: bool,
    databases: Vec<String>,
}

async fn get_databases(
    req: web::Json<GetDatabasesRequest>,
) -> HttpResponse {
    let client = match connect_to_mongo(&req.connection_string).await {
        Ok(c) => c,
        Err(e) => {
            return HttpResponse::BadRequest().json(serde_json::json!({
                "success": false,
                "error": e.to_string()
            }));
        }
    };

    match client.list_database_names().await {
        Ok(dbs) => HttpResponse::Ok().json(GetDatabasesResponse {
            success: true,
            databases: dbs,
        }),
        Err(e) => HttpResponse::BadRequest().json(serde_json::json!({
            "success": false,
            "error": e.to_string()
        })),
    }
}

#[derive(Debug, Deserialize)]
struct GetCollectionsRequest {
    connection_string: String,
    database: String,
}

#[derive(Debug, Serialize)]
struct GetCollectionsResponse {
    success: bool,
    collections: Vec<String>,
}

async fn get_collections(
    req: web::Json<GetCollectionsRequest>,
) -> HttpResponse {
    let client = match connect_to_mongo(&req.connection_string).await {
        Ok(c) => c,
        Err(e) => {
            return HttpResponse::BadRequest().json(serde_json::json!({
                "success": false,
                "error": e.to_string()
            }));
        }
    };

    let db = client.database(&req.database);
    
    match db.list_collection_names().await {
        Ok(colls) => HttpResponse::Ok().json(GetCollectionsResponse {
            success: true,
            collections: colls,
        }),
        Err(e) => HttpResponse::BadRequest().json(serde_json::json!({
            "success": false,
            "error": e.to_string()
        })),
    }
}

#[derive(Debug, Deserialize)]
struct RunComparisonRequest {
    source_connection_string: String,
    target_connection_string: String,
    database: String,
    target_database: Option<String>,
    collections: Vec<String>,
    identifier_field: String,
    sample_limit: usize,
    diff_strategy: DiffStrategy,
    source_filter: Option<serde_json::Value>,
    target_filter: Option<serde_json::Value>,
}

fn build_filter_doc(filter: &Option<serde_json::Value>) -> Result<Document, String> {
    match filter {
        None => Ok(doc! {}),
        Some(value) => mongodb::bson::to_document(value)
            .map_err(|e| format!("Invalid filter JSON: {}", e)),
    }
}

#[derive(Debug, Serialize)]
struct RunComparisonResponse {
    success: bool,
    result: ComparisonResult,
}

async fn run_comparison(
    req: web::Json<RunComparisonRequest>,
) -> HttpResponse {
    let source_client = match connect_to_mongo(&req.source_connection_string).await {
        Ok(c) => c,
        Err(e) => {
            return HttpResponse::BadRequest().json(serde_json::json!({
                "success": false,
                "error": format!("Source connection failed: {}", e)
            }));
        }
    };

    let target_client = match connect_to_mongo(&req.target_connection_string).await {
        Ok(c) => c,
        Err(e) => {
            return HttpResponse::BadRequest().json(serde_json::json!({
                "success": false,
                "error": format!("Target connection failed: {}", e)
            }));
        }
    };

    let mut total_before: usize = 0;
    let mut total_after: usize = 0;
    let mut total_created: usize = 0;
    let mut total_updated: usize = 0;
    let mut total_deleted: usize = 0;
    let mut all_sample_created: Vec<serde_json::Value> = Vec::new();
    let mut all_sample_updated: Vec<mongo_compare::types::DocumentDiff> = Vec::new();
    let mut all_sample_deleted: Vec<serde_json::Value> = Vec::new();

    for collection in &req.collections {
        let source_coll = match get_collection(&source_client, &req.database, collection).await {
            Ok(c) => c,
            Err(e) => {
                return HttpResponse::BadRequest().json(serde_json::json!({
                    "success": false,
                    "error": format!("Failed to get source collection {}: {}", collection, e)
                }));
            }
        };

        let target_coll = match get_collection(&target_client, req.target_database.as_ref().unwrap_or(&req.database), collection).await {
            Ok(c) => c,
            Err(e) => {
                return HttpResponse::BadRequest().json(serde_json::json!({
                    "success": false,
                    "error": format!("Failed to get target collection {}: {}", collection, e)
                }));
            }
        };

        let source_filter_doc = match build_filter_doc(&req.source_filter) {
            Ok(d) => d,
            Err(e) => {
                return HttpResponse::BadRequest().json(serde_json::json!({
                    "success": false,
                    "error": format!("Invalid filter JSON for source: {}", e)
                }));
            }
        };

        let target_filter_doc = match build_filter_doc(&req.target_filter) {
            Ok(d) => d,
            Err(e) => {
                return HttpResponse::BadRequest().json(serde_json::json!({
                    "success": false,
                    "error": format!("Invalid filter JSON for target: {}", e)
                }));
            }
        };

        let source_cursor = match source_coll.find(source_filter_doc).await {
            Ok(cursor) => cursor,
            Err(e) => {
                return HttpResponse::InternalServerError().json(serde_json::json!({
                    "success": false,
                    "error": format!("Failed to query source collection {}: {}", collection, e)
                }));
            }
        };

        let target_cursor = match target_coll.find(target_filter_doc).await {
            Ok(cursor) => cursor,
            Err(e) => {
                return HttpResponse::InternalServerError().json(serde_json::json!({
                    "success": false,
                    "error": format!("Failed to query target collection {}: {}", collection, e)
                }));
            }
        };

        let source_docs: Result<Vec<_>, _> = source_cursor.try_collect().await;
        let target_docs: Result<Vec<_>, _> = target_cursor.try_collect().await;

        let mut source_json_docs: Vec<serde_json::Value> = Vec::new();
        let mut target_json_docs: Vec<serde_json::Value> = Vec::new();

        match source_docs {
            Ok(docs) => {
                for doc in docs {
                    if let Ok(doc_value) = serde_json::to_value(doc) {
                        source_json_docs.push(doc_value);
                    }
                }
            }
            Err(e) => {
                log::warn!(
                    "Failed to decode source documents for collection '{}': {}",
                    collection,
                    e
                );
            }
        }

        match target_docs {
            Ok(docs) => {
                for doc in docs {
                    if let Ok(doc_value) = serde_json::to_value(doc) {
                        target_json_docs.push(doc_value);
                    }
                }
            }
            Err(e) => {
                log::warn!(
                    "Failed to decode target documents for collection '{}': {}",
                    collection,
                    e
                );
            }
        }

        total_before += source_json_docs.len();
        total_after += target_json_docs.len();

        match compare_documents(
            source_json_docs,
            target_json_docs,
            &req.identifier_field,
            req.sample_limit,
            req.diff_strategy.clone(),
        ) {
            Ok((created, updated, deleted, sample_updated, sample_created, sample_deleted)) => {
                total_created += created;
                total_updated += updated;
                total_deleted += deleted;

                for sample in sample_created {
                    if all_sample_created.len() >= req.sample_limit {
                        break;
                    }
                    all_sample_created.push(sample);
                }
                for sample in sample_updated {
                    if all_sample_updated.len() >= req.sample_limit {
                        break;
                    }
                    all_sample_updated.push(sample);
                }
                for sample in sample_deleted {
                    if all_sample_deleted.len() >= req.sample_limit {
                        break;
                    }
                    all_sample_deleted.push(sample);
                }
            }
            Err(e) => {
                return HttpResponse::InternalServerError().json(serde_json::json!({
                    "success": false,
                    "error": format!("Comparison failed for collection {}: {}", collection, e)
                }));
            }
        }
    }

    let result = ComparisonResult {
        timestamp: chrono::Utc::now().to_rfc3339(),
        source_instance: req.source_connection_string.clone(),
        target_instance: req.target_connection_string.clone(),
        source_database: req.database.clone(),
        target_database: req
            .target_database
            .clone()
            .unwrap_or_else(|| req.database.clone()),
        total_before,
        total_after,
        created: CreatedDiff {
            count: total_created,
            samples: all_sample_created,
        },
        updated: UpdatedDiff {
            count: total_updated,
            samples: all_sample_updated,
        },
        deleted: DeletedDiff {
            count: total_deleted,
            samples: all_sample_deleted,
        },
    };

    HttpResponse::Ok().json(RunComparisonResponse {
        success: true,
        result,
    })
}

async fn health() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "ok"
    }))
}

#[actix_web::main]
async fn main() -> AnyResult<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    log::info!("Starting MongoDB Diff Server on port 8080");

    HttpServer::new(|| {
        App::new()
            .wrap(
                Cors::default()
                    .allowed_origin("http://localhost")
                    .allowed_origin("http://127.0.0.1")
                    .allow_any_method()
                    .allow_any_header()
                    .max_age(3600)
            )
            .route("/health", web::get().to(health))
            .route("/api/test-connection", web::post().to(test_connection))
            .route("/api/get-databases", web::post().to(get_databases))
            .route("/api/get-collections", web::post().to(get_collections))
            .route("/api/run-comparison", web::post().to(run_comparison))
    })
    .bind("127.0.0.1:3001")?
    .run()
    .await?;

    Ok(())
}
