//! Document comparison module for MongoDB document diffing
//!
//! This module provides functionality to compare batches of MongoDB documents
//! and identify differences between them. It supports multiple diffing strategies
//! including full comparison, whitelist/blacklist filtering, and deep equality checks.
//!
//! # Types
//!
//! - `ComparisonResult`: A tuple containing comparison statistics and sample documents
//! - `FieldDiff`: A struct representing field-level differences in documents
//!
//! # Main Function
//!
//! `compare_documents` performs a three-way comparison between two document batches:
//! - **Created**: Documents present in the after batch but not in the before batch
//! - **Updated**: Documents present in both batches with field-level differences
//! - **Deleted**: Documents present in the before batch but not in the after batch
//!
//! # Diff Strategies
//!
//! - **All**: Compare all fields in both documents
//! - **Whitelist**: Only compare specified fields
//! - **Blacklist**: Compare all fields except specified ones
//! - **DeepEquality**: Compare only primitive fields, treating nested objects as units
//!
//! # Examples
//!
//! ```
//! use serde_json::json;
//! use mongo_compare::comparison::compare_documents;
//! use mongo_compare::types::DiffStrategy;
//!
//! let docs_before = vec![json!({"id": "1", "name": "Alice", "age": 30})];
//! let docs_after = vec![json!({"id": "1", "name": "Alice", "age": 31})];
//!
//! let result = compare_documents(
//!     docs_before,
//!     docs_after,
//!     "id",
//!     1,
//!     DiffStrategy::All
//! ).unwrap();
//!
//! assert_eq!(result.0, 0); // created
//! assert_eq!(result.1, 1); // updated
//! assert_eq!(result.2, 0); // deleted
//! ```

use crate::types::{ChangeField, DiffStrategy, DocumentDiff};
use anyhow::Result;
use serde_json::Value as JsonValue;

/// A tuple type representing the result of document comparison
///
/// Contains:
/// - `usize` - Number of created documents
/// - `usize` - Number of updated documents
/// - `usize` - Number of deleted documents
/// - `Vec<DocumentDiff>` - Sample of updated documents with field differences
/// - `Vec<JsonValue>` - Sample of created documents
/// - `Vec<JsonValue>` - Sample of deleted documents
type ComparisonStats = (
    usize,
    usize,
    usize,
    Vec<DocumentDiff>,
    Vec<JsonValue>,
    Vec<JsonValue>,
);

/// Compare two batches of MongoDB documents and identify differences
///
/// This function performs a three-way comparison between documents from two
/// time periods (before and after) to identify created, updated, and deleted documents.
///
/// # Parameters
///
/// - `docs_before`: Vector of documents from the baseline period
/// - `docs_after`: Vector of documents from the comparison period
/// - `identifier_field`: The field name used to uniquely identify documents (e.g., "_id")
/// - `sample_limit`: Maximum number of samples to collect for each change type (0 = no limit)
/// - `diff_strategy`: The strategy to use for comparing field differences
///
/// # Returns
///
/// Returns a `ComparisonStats` tuple containing:
/// - The count of newly created documents
/// - The count of updated documents
/// - The count of deleted documents
/// - A sample of updated documents with their field differences
/// - A sample of created documents
/// - A sample of deleted documents
///
/// # Behavior
///
/// - Documents are identified by their value in the `identifier_field`
/// - Documents in both batches with the same identifier are compared
/// - Documents only in `docs_after` are considered created
/// - Documents only in `docs_before` are considered deleted
/// - Documents in both batches are compared using the specified `diff_strategy`
/// - If `sample_limit` is 0, no samples are collected
/// - Documents without the identifier field are skipped with a warning
///
/// # Example
///
/// ```
/// use serde_json::json;
/// use mongo_compare::comparison::compare_documents;
/// use mongo_compare::types::DiffStrategy;
///
/// let before = vec![
///     json!({"id": "1", "name": "Alice", "age": 30, "email": "alice@example.com"}),
///     json!({"id": "2", "name": "Bob", "age": 25}),
/// ];
///
/// let after = vec![
///     json!({"id": "1", "name": "Alice", "age": 31, "email": "alice@example.com"}),
///     json!({"id": "3", "name": "Charlie", "age": 35, "email": "charlie@example.com"}),
/// ];
///
/// let result = compare_documents(before, after, "id", 1, DiffStrategy::All).unwrap();
/// assert_eq!(result.0, 1); // 1 created (id=3)
/// assert_eq!(result.1, 1); // 1 updated (id=1)
/// assert_eq!(result.2, 1); // 1 deleted (id=2)
/// ```
pub fn compare_documents(
    docs_before: Vec<JsonValue>,
    docs_after: Vec<JsonValue>,
    identifier_field: &str,
    sample_limit: usize,
    diff_strategy: DiffStrategy,
) -> Result<ComparisonStats> {
    let mut created_count = 0;
    let mut updated_count = 0;
    let mut deleted_count = 0;
    let mut sample_created: Vec<JsonValue> = Vec::new();
    let mut sample_updated: Vec<DocumentDiff> = Vec::new();
    let mut sample_deleted: Vec<JsonValue> = Vec::new();

    let mut before_map: std::collections::HashMap<String, JsonValue> =
        std::collections::HashMap::new();

    for doc in &docs_before {
        if let Some(id) = doc.get(identifier_field) {
            before_map.insert(id.to_string(), doc.clone());
        } else {
            log::warn!(
                "Skipping before-side document lacking identifier field '{}'",
                identifier_field
            );
        }
    }

    for doc_after in &docs_after {
        if doc_after.get(identifier_field).is_none() {
            log::warn!(
                "Skipping after-side document lacking identifier field '{}'",
                identifier_field
            );
        }
        if let Some(id) = doc_after.get(identifier_field) {
            let id_str = id.to_string();
            if before_map.contains_key(&id_str) {
                let doc_before = before_map.get(&id_str).unwrap();
                let diff = find_field_diffs(
                    doc_before,
                    doc_after,
                    identifier_field,
                    diff_strategy.clone(),
                )?;
                if !diff.changed_fields.is_empty() {
                    updated_count += 1;
                    if sample_limit > 0 && sample_updated.len() < sample_limit {
                        sample_updated.push(DocumentDiff {
                            identifier: id_str.clone(),
                            changes: diff.changed_fields,
                        });
                    }
                }
            } else {
                created_count += 1;
                if sample_limit > 0 && sample_created.len() < sample_limit {
                    sample_created.push(doc_after.clone());
                }
            }
        }
    }

    let after_ids: std::collections::BTreeSet<String> = docs_after
        .iter()
        .filter_map(|doc| doc.get(identifier_field).map(|id| id.to_string()))
        .collect();

    for id in before_map.keys() {
        if !after_ids.contains(id) {
            deleted_count += 1;
            if sample_limit > 0 && sample_deleted.len() < sample_limit {
                sample_deleted.push(before_map.get(id).unwrap().clone());
            }
        }
    }

    Ok((
        created_count,
        updated_count,
        deleted_count,
        sample_updated,
        sample_created,
        sample_deleted,
    ))
}

/// Represents field-level differences between two document versions
///
/// This struct serves as a container for field-level change information
/// discovered during document comparison. It aggregates all `ChangeField`
/// instances found in a comparison operation, making it easy to serialize
/// and report detailed differences.
///
/// # Usage Context
///
/// - Created when `find_field_diffs()` is called to compare two documents
/// - Contains only the fields that actually changed (not all fields in the document)
/// - Each field can indicate whether it was added, removed, or changed
/// - Field paths use dot notation for nested fields (e.g., "address.city")
///
/// # Relationship to Other Types
///
/// - **`FieldDiff`**: Aggregates individual field changes for a single document comparison
/// - **`ComparisonResult`**: Contains multiple `FieldDiff` instances for all updated documents
/// - **`ChangeField`**: Represents a single field-level change with old/new values
///
/// # Example
///
/// ```
/// use serde_json::json;
/// use mongo_compare::comparison::find_field_diffs;
/// use mongo_compare::types::DiffStrategy;
///
/// let before = json!({"name": "Alice", "age": 30, "email": "alice@example.com"});
/// let after = json!({"name": "Alice", "age": 31, "email": "alice@example.com"});
///
/// let result = find_field_diffs(&before, &after, "id", DiffStrategy::All).unwrap();
/// println!("{} fields changed", result.changed_fields.len());
///
/// for change in result.changed_fields {
///     println!("Field '{}' changed from '{}' to '{}'", 
///         change.path, 
///         change.old_value.unwrap_or_else(|| "N/A".to_string()),
///         change.new_value.unwrap_or_else(|| "N/A".to_string())
///     );
/// }
/// ```
///
/// # Fields
///
/// - `changed_fields`: Vector of individual field changes with their old and new values
///   - Each change includes the field path, old value (if existed), new value (if added)
///   - Change type indicates "changed", "added", or "removed"
///   - Nested objects are flattened with dot notation in the path
///   - Field paths are deduplicated to avoid reporting the same field multiple times
pub struct FieldDiff {
    pub changed_fields: Vec<ChangeField>,
}

/// Find field-level differences between two documents
///
/// This function compares two JSON documents and identifies which fields
/// have changed, been added, or been removed. The behavior depends on the
/// provided `diff_strategy`.
///
/// # Parameters
///
/// - `doc_before`: The original document from the baseline period
/// - `doc_after`: The document from the comparison period
/// - `identifier_field`: The field name used to identify documents (not compared)
/// - `strategy`: The diffing strategy to apply
///
/// # Returns
///
/// Returns a `FieldDiff` struct containing a vector of `ChangeField` instances
/// describing all differences found.
///
/// # Diff Strategies
///
/// ## DiffStrategy::All
///
/// Compares all fields in both documents. Nested objects are recursively compared.
/// This is the default behavior when no specific strategy is needed.
///
/// ## DiffStrategy::Whitelist(fields)
///
/// Only compares the specified fields. If a field is missing in one document,
/// it's reported as added or removed. Nested objects in whitelisted fields
/// are recursively compared.
///
/// ## DiffStrategy::Blacklist(fields)
///
/// Compares all fields except those in the blacklist. Fields listed here are
/// ignored during comparison, even if they differ between documents.
///
/// ## DiffStrategy::DeepEquality
///
/// Compares only primitive fields (strings, numbers, booleans). Nested objects
/// are treated as atomic values - their internal structure is not compared.
/// This is useful when you want to know if a document has changed, without
/// caring about which specific fields changed.
///
/// # Example
///
/// ```
/// use serde_json::json;
/// use mongo_compare::comparison::find_field_diffs;
/// use mongo_compare::types::DiffStrategy;
///
/// let before = json!({"name": "Alice", "age": 30});
/// let after = json!({"name": "Alice", "age": 31});
///
/// let result = find_field_diffs(&before, &after, "id", DiffStrategy::All).unwrap();
///
/// // Result would contain one change field for "age"
/// ```
pub fn find_field_diffs(
    doc_before: &JsonValue,
    doc_after: &JsonValue,
    identifier_field: &str,
    strategy: DiffStrategy,
) -> Result<FieldDiff> {
    let mut changed_fields: Vec<ChangeField> = Vec::new();

    match &strategy {
        DiffStrategy::All => {
            let before_obj = doc_before.as_object();
            let after_obj = doc_after.as_object().unwrap();
            let before_keys: std::collections::BTreeSet<String> = before_obj
                .map(|o| o.keys().cloned().collect())
                .unwrap_or_default();
            let after_keys: std::collections::BTreeSet<String> =
                after_obj.keys().cloned().collect();

            for key in before_keys.union(&after_keys) {
                if key == identifier_field {
                    continue;
                }

                let value_before = doc_before.get(key);
                let value_after = doc_after.get(key);

                match (value_before, value_after) {
                    (Some(v_before), Some(v_after)) => {
                        if !json_eq(v_before, v_after) {
                            let old_str = strip_quotes(&v_before.to_string());
                            let new_str = strip_quotes(&serde_json::to_string(v_after)?);

                            if v_before.is_object() && v_after.is_object() {
                                let mut nested_diffs: Vec<ChangeField> = Vec::new();
                                find_nested_diffs(
                                    v_before,
                                    v_after,
                                    vec![key.clone()],
                                    &mut nested_diffs,
                                )?;
                                changed_fields.extend(nested_diffs);
                            } else {
                                changed_fields.push(ChangeField {
                                    path: key.clone(),
                                    old_value: Some(old_str),
                                    new_value: Some(new_str),
                                    change_type: "changed".to_string(),
                                });
                            }
                        }
                    }
                    (None, Some(v_after)) => {
                        if !v_after.is_object() {
                            changed_fields.push(ChangeField {
                                path: key.clone(),
                                old_value: None,
                                new_value: Some(strip_quotes(&serde_json::to_string(v_after)?)),
                                change_type: "added".to_string(),
                            });
                        }
                    }
                    (Some(v_before), None) => {
                        if !v_before.is_object() {
                            changed_fields.push(ChangeField {
                                path: key.clone(),
                                old_value: Some(strip_quotes(&v_before.to_string())),
                                new_value: None,
                                change_type: "removed".to_string(),
                            });
                        }
                    }
                    (None, None) => {}
                }
            }
        }
        DiffStrategy::Whitelist(fields) => {
            if !fields.is_empty() {
                for field in fields {
                    if field == identifier_field {
                        continue;
                    }

                    let value_before = get_nested_value(doc_before, field);
                    let value_after = get_nested_value(doc_after, field);

                    match (value_before, value_after) {
                        (Some(v_before), Some(v_after)) => {
                            if !json_eq(v_before, v_after) {
                                let old_str = strip_quotes(&v_before.to_string());
                                let new_str = strip_quotes(&serde_json::to_string(v_after)?);

                                if v_before.is_object() && v_after.is_object() {
                                    let mut nested_diffs: Vec<ChangeField> = Vec::new();
                                    find_nested_diffs(
                                        v_before,
                                        v_after,
                                        vec![field.clone()],
                                        &mut nested_diffs,
                                    )?;
                                    changed_fields.extend(nested_diffs);
                                } else {
                                    changed_fields.push(ChangeField {
                                        path: field.clone(),
                                        old_value: Some(old_str),
                                        new_value: Some(new_str),
                                        change_type: "changed".to_string(),
                                    });
                                }
                            }
                        }
                        (None, Some(v_after)) if !v_after.is_object() => {
                            changed_fields.push(ChangeField {
                                path: field.clone(),
                                old_value: None,
                                new_value: Some(strip_quotes(&serde_json::to_string(v_after)?)),
                                change_type: "added".to_string(),
                            });
                        }
                        (Some(v_before), None) if !v_before.is_object() => {
                            changed_fields.push(ChangeField {
                                path: field.clone(),
                                old_value: Some(strip_quotes(&v_before.to_string())),
                                new_value: None,
                                change_type: "removed".to_string(),
                            });
                        }
                        _ => {}
                    }
                }
            }
        }
        DiffStrategy::Blacklist(fields) => {
            let before_obj = doc_before.as_object();
            let after_obj = doc_after.as_object().unwrap();
            let before_keys: std::collections::BTreeSet<String> = before_obj
                .map(|o| o.keys().cloned().collect())
                .unwrap_or_default();
            let after_keys: std::collections::BTreeSet<String> =
                after_obj.keys().cloned().collect();

            for key in before_keys.union(&after_keys) {
                if key == identifier_field {
                    continue;
                }

                if fields.contains(key) {
                    continue;
                }

                let value_before = doc_before.get(key);
                let value_after = doc_after.get(key);

                match (value_before, value_after) {
                    (Some(v_before), Some(v_after)) => {
                        if !json_eq(v_before, v_after) {
                            let old_str = strip_quotes(&v_before.to_string());
                            let new_str = strip_quotes(&serde_json::to_string(v_after)?);

                            if v_before.is_object() && v_after.is_object() {
                                let mut nested_diffs: Vec<ChangeField> = Vec::new();
                                find_nested_diffs(
                                    v_before,
                                    v_after,
                                    vec![key.clone()],
                                    &mut nested_diffs,
                                )?;
                                changed_fields.extend(nested_diffs);
                            } else {
                                changed_fields.push(ChangeField {
                                    path: key.clone(),
                                    old_value: Some(old_str),
                                    new_value: Some(new_str),
                                    change_type: "changed".to_string(),
                                });
                            }
                        }
                    }
                    (None, Some(v_after)) => {
                        if !v_after.is_object() {
                            changed_fields.push(ChangeField {
                                path: key.clone(),
                                old_value: None,
                                new_value: Some(strip_quotes(&serde_json::to_string(v_after)?)),
                                change_type: "added".to_string(),
                            });
                        }
                    }
                    (Some(v_before), None) => {
                        if !v_before.is_object() {
                            changed_fields.push(ChangeField {
                                path: key.clone(),
                                old_value: Some(strip_quotes(&v_before.to_string())),
                                new_value: None,
                                change_type: "removed".to_string(),
                            });
                        }
                    }
                    (None, None) => {}
                }
            }
        }
        DiffStrategy::DeepEquality => {
            let before_obj = doc_before.as_object();
            let after_obj = doc_after.as_object().unwrap();
            let before_keys: std::collections::BTreeSet<String> = before_obj
                .map(|o| o.keys().cloned().collect())
                .unwrap_or_default();
            let after_keys: std::collections::BTreeSet<String> =
                after_obj.keys().cloned().collect();

            for key in before_keys.union(&after_keys) {
                if key == identifier_field {
                    continue;
                }

                let value_before = doc_before.get(key);
                let value_after = doc_after.get(key);

                match (value_before, value_after) {
                    (Some(v_before), Some(v_after)) => {
                        if !json_eq(v_before, v_after) {
                            if v_before.is_object() && v_after.is_object() {
                                // DeepEquality: don't report nested object changes, only primitive changes
                                // Nested objects are treated as single units
                            } else {
                                let old_str = strip_quotes(&v_before.to_string());
                                let new_str = strip_quotes(&serde_json::to_string(v_after)?);

                                changed_fields.push(ChangeField {
                                    path: key.clone(),
                                    old_value: Some(old_str),
                                    new_value: Some(new_str),
                                    change_type: "changed".to_string(),
                                });
                            }
                        }
                    }
                    (None, Some(v_after)) => {
                        if !v_after.is_object() {
                            let new_str = strip_quotes(&serde_json::to_string(v_after)?);

                            changed_fields.push(ChangeField {
                                path: key.clone(),
                                old_value: None,
                                new_value: Some(new_str),
                                change_type: "added".to_string(),
                            });
                        }
                    }
                    (Some(v_before), None) => {
                        if !v_before.is_object() {
                            changed_fields.push(ChangeField {
                                path: key.clone(),
                                old_value: Some(strip_quotes(&v_before.to_string())),
                                new_value: None,
                                change_type: "removed".to_string(),
                            });
                        }
                    }
                    (None, None) => {}
                }
            }
        }
    }

    let mut seen_fields: std::collections::BTreeSet<String> = std::collections::BTreeSet::new();
    let mut deduplicated: Vec<ChangeField> = Vec::new();

    for field in changed_fields {
        if !seen_fields.contains(&field.path) {
            seen_fields.insert(field.path.clone());
            deduplicated.push(field);
        }
    }

    Ok(FieldDiff {
        changed_fields: deduplicated,
    })
}

fn find_nested_diffs(
    before: &JsonValue,
    after: &JsonValue,
    path: Vec<String>,
    result: &mut Vec<ChangeField>,
) -> anyhow::Result<()> {
    if let (JsonValue::Object(before_obj), JsonValue::Object(after_obj)) = (before, after) {
        let before_keys: std::collections::BTreeSet<String> = before_obj.keys().cloned().collect();
        let after_keys: std::collections::BTreeSet<String> = after_obj.keys().cloned().collect();

        for key in before_keys.union(&after_keys) {
            let mut new_path = path.clone();
            new_path.push(key.clone());

            if let (Some(before_val), Some(after_val)) = (before_obj.get(key), after_obj.get(key)) {
                if !json_eq(before_val, after_val) {
                    if before_val.is_object() && after_val.is_object() {
                        find_nested_diffs(before_val, after_val, new_path, result)?;
                    } else {
                        result.push(ChangeField {
                            path: new_path.join("."),
                            old_value: Some(strip_quotes(&before_val.to_string())),
                            new_value: Some(strip_quotes(&serde_json::to_string(after_val)?)),
                            change_type: "changed".to_string(),
                        });
                    }
                }
            } else if before_obj.contains_key(key) {
                result.push(ChangeField {
                    path: new_path.join("."),
                    old_value: Some(strip_quotes(&before_obj.get(key).unwrap().to_string())),
                    new_value: None,
                    change_type: "removed".to_string(),
                });
            } else {
                result.push(ChangeField {
                    path: new_path.join("."),
                    old_value: None,
                    new_value: Some(strip_quotes(&serde_json::to_string(after_obj.get(key).unwrap())?)),
                    change_type: "added".to_string(),
                });
            }
        }
    }
    Ok(())
}

fn get_nested_value<'a>(doc: &'a JsonValue, path: &str) -> Option<&'a JsonValue> {
    let parts: Vec<&str> = path.split('.').collect();
    let mut current: Option<&'a JsonValue> = Some(doc);

    for part in parts {
        match current {
            Some(JsonValue::Object(obj)) => {
                current = obj.get(part);
            }
            _ => return None,
        }
    }

    current
}

fn strip_quotes(value: &str) -> String {
    if (value.starts_with('"') && value.ends_with('"'))
        || (value.starts_with('\'') && value.ends_with('\''))
    {
        value[1..value.len() - 1].to_string()
    } else {
        value.to_string()
    }
}

fn json_eq(a: &JsonValue, b: &JsonValue) -> bool {
    match (a, b) {
        (JsonValue::String(a), JsonValue::String(b)) => a == b,
        (JsonValue::Number(a), JsonValue::Number(b)) => a == b,
        (JsonValue::Bool(a), JsonValue::Bool(b)) => a == b,
        (JsonValue::Array(a), JsonValue::Array(b)) => a == b,
        (JsonValue::Object(a), JsonValue::Object(b)) => a == b,
        (JsonValue::Null, JsonValue::Null) => true,
        _ => false,
    }
}
