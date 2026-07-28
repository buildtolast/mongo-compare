use anyhow::Result;
use mongo_compare::comparison::compare_documents;
use mongo_compare::mongo::connect_to_mongo;
use mongo_compare::mongo::get_collection;
use mongo_compare::output::print_summary;
use mongo_compare::output::write_summary;
use mongo_compare::types::ComparisonResult;
use std::time::Instant;

#[tokio::main]
async fn main() -> Result<()> {
    env_logger::Builder::from_default_env().init();

    println!("🔍 MongoDB Collection Comparison Tool");
    println!("=====================================\n");

    let config = mongo_compare::config::load_config()?;

    println!("📖 Loading config from: config.json");
    println!("   MongoDB URI: {}", config.mongo_uri);
    println!("   Database: {}", config.db_name);
    println!("   Collection A (before): {}", config.collection_before);
    println!("   Collection B (after): {}", config.collection_after);
    println!(
        "   Filter: {}\n",
        serde_json::to_string_pretty(&config.filter)?
    );

    println!("🔌 Connecting to MongoDB...");
    let start = Instant::now();
    let client = connect_to_mongo(&config.mongo_uri).await?;
    println!("✅ Connected in {:?}\n", start.elapsed());

    let filter_doc = serde_json::from_value(config.filter.clone())?;
    println!("📚 Processing collection A (before)...");
    let start = Instant::now();
    let docs_before = process_collection(
        &client,
        &config.db_name,
        &config.collection_before,
        &filter_doc,
        &config.unique_identifier_field,
        config.batch_size,
    )
    .await?;
    println!(
        "✅ Processed {} documents in {:?}\n",
        docs_before.len(),
        start.elapsed()
    );

    println!("📚 Processing collection B (after)...");
    let start = Instant::now();
    let docs_after = process_collection(
        &client,
        &config.db_name,
        &config.collection_after,
        &filter_doc,
        &config.unique_identifier_field,
        config.batch_size,
    )
    .await?;
    println!(
        "✅ Processed {} documents in {:?}\n",
        docs_after.len(),
        start.elapsed()
    );

    println!("🔍 Comparing collections...");
    let (created, updated, deleted, sample_updated, _, sample_deleted) = compare_documents(
        docs_before.clone(),
        docs_after.clone(),
        &config.unique_identifier_field,
        config.sample_limit,
        config.diff_strategy,
    )?;
    println!("✅ Comparison complete\n");

    print_summary(created, updated, deleted, &sample_updated, &sample_deleted);

    let total_before = docs_before.len();
    let total_after = docs_after.len();

    let result = ComparisonResult {
        started_at: chrono::Utc::now().to_rfc3339(),
        finished_at: chrono::Utc::now().to_rfc3339(),
        collection_before: config.collection_before.clone(),
        collection_after: config.collection_after.clone(),
        total_before,
        total_after,
        created_count: created,
        updated_count: updated,
        deleted_count: deleted,
        sample_created: vec![],
        sample_updated,
        sample_deleted,
    };

    println!("\n💾 Writing summary to: {}", config.output_file);
    write_summary(&result, &config.output_file)?;
    println!("✅ Summary written successfully\n");

    println!("✨ Comparison complete!");
    Ok(())
}

async fn process_collection(
    client: &mongodb::Client,
    db_name: &str,
    collection_name: &str,
    filter: &mongodb::bson::Document,
    _identifier_field: &str,
    _batch_size: usize,
) -> Result<Vec<serde_json::Value>> {
    let collection = get_collection(client, db_name, collection_name).await?;

    let mut all_docs: Vec<serde_json::Value> = Vec::new();

    let cursor = collection.find(filter.clone()).await?;

    while cursor.has_next() {
        let doc = cursor.deserialize_current()?;
        all_docs.push(serde_json::to_value(&doc)?);
    }

    Ok(all_docs)
}
