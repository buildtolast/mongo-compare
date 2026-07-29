use actix_cors::Cors;
use actix_web::{web, App, HttpServer, HttpResponse};
use anyhow::Result as AnyResult;
use futures_util::stream::StreamExt;
use futures_util::TryStreamExt;
use mongodb::bson::{doc, Document};
use mongo_compare::{
    comparison::compare_documents,
    mongo::{connect_to_mongo, get_collection},
    types::{ComparisonResult, DiffStrategy},
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

    let mut all_source_docs: Vec<serde_json::Value> = Vec::new();
    let mut all_target_docs: Vec<serde_json::Value> = Vec::new();

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

        let source_cursor = source_coll.find(doc! {}).await.unwrap();
        let target_cursor = target_coll.find(doc! {}).await.unwrap();

        let source_docs: Result<Vec<_>, _> = source_cursor.try_collect().await;
        let target_docs: Result<Vec<_>, _> = target_cursor.try_collect().await;

        if let Ok(docs) = source_docs {
            for doc in docs {
                if let Ok(doc_value) = serde_json::to_value(doc) {
                    all_source_docs.push(doc_value);
                }
            }
        }

        if let Ok(docs) = target_docs {
            for doc in docs {
                if let Ok(doc_value) = serde_json::to_value(doc) {
                    all_target_docs.push(doc_value);
                }
            }
        }
    }

    match compare_documents(
        all_source_docs.clone(),
        all_target_docs.clone(),
        &req.identifier_field,
        req.sample_limit,
        req.diff_strategy.clone(),
    ) {
        Ok((created, updated, deleted, sample_updated, sample_created, sample_deleted)) => {
            let result = ComparisonResult {
                started_at: chrono::Utc::now().to_rfc3339(),
                finished_at: chrono::Utc::now().to_rfc3339(),
                collection_before: req.collections.first().cloned().unwrap_or_default(),
                collection_after: req.collections.first().cloned().unwrap_or_default(),
                total_before: all_source_docs.len(),
                total_after: all_target_docs.len(),
                created_count: created,
                updated_count: updated,
                deleted_count: deleted,
                sample_created: sample_created.clone(),
                sample_updated: sample_updated.clone(),
                sample_deleted: sample_deleted.clone(),
            };

            HttpResponse::Ok().json(RunComparisonResponse {
                success: true,
                result,
            })
        }
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
            "success": false,
            "error": e.to_string()
        })),
    }
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
                    .allow_any_origin()
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
    .bind("0.0.0.0:3001")?
    .run()
    .await?;

    Ok(())
}
