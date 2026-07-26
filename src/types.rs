use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;

#[derive(Debug, Deserialize)]
pub struct Config {
    pub mongo_uri: String,
    pub db_name: String,
    pub collection_before: String,
    pub collection_after: String,
    pub filter: serde_json::Value,
    pub unique_identifier_field: String,
    pub batch_size: usize,
    pub output_file: String,
}

#[derive(Debug, Serialize)]
pub struct ComparisonResult {
    pub started_at: String,
    pub finished_at: String,
    pub collection_before: String,
    pub collection_after: String,
    pub total_before: usize,
    pub total_after: usize,
    pub created_count: usize,
    pub updated_count: usize,
    pub deleted_count: usize,
    pub sample_created: Vec<JsonValue>,
    pub sample_updated: Vec<DocumentDiff>,
    pub sample_deleted: Vec<JsonValue>,
}

#[derive(Debug, Serialize, PartialEq)]
pub struct DocumentDiff {
    pub identifier: String,
    pub changed_fields: Vec<ChangedField>,
}

#[derive(Debug, Serialize, PartialEq)]
pub struct ChangedField {
    pub field_name: String,
    pub old_value: String,
    pub new_value: String,
}