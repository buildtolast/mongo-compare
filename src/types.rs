use serde::{Deserialize, Deserializer, Serialize};
use serde_json::Value as JsonValue;

#[derive(Debug, Clone, PartialEq)]
pub enum DiffStrategy {
    /// Compare all fields (default behavior)
    All,
    /// Only compare specified fields (whitelist)
    Whitelist(Vec<String>),
    /// Compare all fields except specified ones (blacklist)
    Blacklist(Vec<String>),
    /// Use deep equality for nested objects instead of field-by-field
    DeepEquality,
}

impl<'de> Deserialize<'de> for DiffStrategy {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        struct DiffStrategyVisitor;

        impl<'de> serde::de::Visitor<'de> for DiffStrategyVisitor {
            type Value = DiffStrategy;

            fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
                formatter.write_str("Expected 'all', 'whitelist', 'blacklist', or 'deep_equality' as string, or an object with 'fields' array")
            }

            fn visit_str<E>(self, value: &str) -> Result<Self::Value, E>
            where
                E: serde::de::Error,
            {
                match value {
                    "all" => Ok(DiffStrategy::All),
                    "whitelist" => Ok(DiffStrategy::Whitelist(Vec::new())),
                    "blacklist" => Ok(DiffStrategy::Blacklist(Vec::new())),
                    "deep_equality" => Ok(DiffStrategy::DeepEquality),
                    _ => Err(serde::de::Error::custom(format!(
                        "Unknown diff strategy: {}",
                        value
                    ))),
                }
            }

            fn visit_map<M>(self, mut map: M) -> Result<Self::Value, M::Error>
            where
                M: serde::de::MapAccess<'de>,
            {
                let mut fields: Option<Vec<String>> = None;
                while let Some(key) = map.next_key()? {
                    match key {
                        "fields" => {
                            let vec = map.next_value()?;
                            fields = Some(vec);
                        }
                        _ => {
                            return Err(serde::de::Error::custom(format!(
                                "Unknown key in diff strategy: {}",
                                key
                            )));
                        }
                    }
                }

                match fields {
                    Some(fields) => Ok(DiffStrategy::Whitelist(fields)),
                    None => Err(serde::de::Error::custom(
                        "Missing 'fields' array in diff strategy",
                    )),
                }
            }
        }

        deserializer.deserialize_any(DiffStrategyVisitor)
    }
}

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
    pub sample_limit: usize,
    pub diff_strategy: DiffStrategy,
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

#[derive(Debug, Serialize, PartialEq, Clone)]
pub struct DocumentDiff {
    pub identifier: String,
    pub changed_fields: Vec<ChangedField>,
}

#[derive(Debug, Serialize, PartialEq, Clone)]
pub struct ChangedField {
    pub field_name: String,
    pub old_value: String,
    pub new_value: String,
}
