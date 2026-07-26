use serde_json::Value as JsonValue;
use crate::types::{DocumentDiff, ChangedField};
use anyhow::Result;

pub fn compare_documents(
    docs_before: Vec<JsonValue>,
    docs_after: Vec<JsonValue>,
    identifier_field: &str,
) -> Result<(usize, usize, usize, Vec<DocumentDiff>, Vec<JsonValue>, Vec<JsonValue>)> {
    let mut created_count = 0;
    let mut updated_count = 0;
    let mut deleted_count = 0;
    let mut sample_created: Vec<JsonValue> = Vec::new();
    let mut sample_updated: Vec<DocumentDiff> = Vec::new();
    let mut sample_deleted: Vec<JsonValue> = Vec::new();

    let mut before_map: std::collections::HashMap<String, JsonValue> = std::collections::HashMap::new();

    for doc in &docs_before {
        if let Some(id) = doc.get(identifier_field) {
            before_map.insert(id.to_string(), doc.clone());
        }
    }

    for doc_after in &docs_after {
        if let Some(id) = doc_after.get(identifier_field) {
            let id_str = id.to_string();
            if before_map.contains_key(&id_str) {
                let doc_before = before_map.get(&id_str).unwrap();
                let diff = find_field_diffs(doc_before, doc_after, identifier_field)?;
                if !diff.changed_fields.is_empty() {
                    updated_count += 1;
                    if sample_updated.len() < 5 {
                        sample_updated.push(DocumentDiff {
                            identifier: id_str.clone(),
                            changed_fields: diff.changed_fields,
                        });
                    }
                }
            } else {
                created_count += 1;
                if sample_created.len() < 5 {
                    sample_created.push(doc_after.clone());
                }
            }
        }
    }

    let after_ids: std::collections::HashSet<String> = docs_after
        .iter()
        .filter_map(|doc| doc.get(identifier_field).map(|id| id.to_string()))
        .collect();

    for id in before_map.keys() {
        if !after_ids.contains(id) {
            deleted_count += 1;
            if sample_deleted.len() < 5 {
                sample_deleted.push(before_map.get(id).unwrap().clone());
            }
        }
    }

    Ok((created_count, updated_count, deleted_count, sample_updated, sample_created, sample_deleted))
}

pub struct FieldDiff {
    pub changed_fields: Vec<ChangedField>,
}

pub fn find_field_diffs(
    doc_before: &JsonValue,
    doc_after: &JsonValue,
    identifier_field: &str,
) -> Result<FieldDiff> {
    let mut changed_fields: Vec<ChangedField> = Vec::new();

    for (key, value_after) in doc_after.as_object().unwrap() {
        if key == identifier_field {
            continue;
        }

        let value_before = doc_before.get(key);

        match (value_before, value_after) {
            (Some(v_before), v_after) => {
                if !json_eq(&v_before, v_after) {
                    let old_str = strip_quotes(&v_before.to_string());
                    let new_str = strip_quotes(&serde_json::to_string(v_after)?);
                    
                    if v_before.is_object() && v_after.is_object() {
                        let mut nested_diffs: Vec<ChangedField> = Vec::new();
                        find_nested_diffs(v_before, v_after, vec![key.clone()], &mut nested_diffs)?;
                        changed_fields.extend(nested_diffs);
                    } else {
                        changed_fields.push(ChangedField {
                            field_name: key.clone(),
                            old_value: old_str,
                            new_value: new_str,
                        });
                    }
                }
            }
            (None, v_after) => {
                if !v_after.is_object() {
                    changed_fields.push(ChangedField {
                        field_name: key.clone(),
                        old_value: "null".to_string(),
                        new_value: strip_quotes(&serde_json::to_string(v_after)?),
                    });
                }
            }
        }
    }

    let mut nested_diffs: Vec<ChangedField> = Vec::new();
    find_nested_diffs(doc_before, doc_after, vec![], &mut nested_diffs)?;

    let mut seen_fields: std::collections::HashSet<String> = std::collections::HashSet::new();
    let mut deduplicated: Vec<ChangedField> = Vec::new();

    for field in changed_fields.into_iter().chain(nested_diffs) {
        if !seen_fields.contains(&field.field_name) {
            seen_fields.insert(field.field_name.clone());
            deduplicated.push(field);
        }
    }

    Ok(FieldDiff { changed_fields: deduplicated })
}

fn find_nested_diffs(
    before: &JsonValue,
    after: &JsonValue,
    path: Vec<String>,
    result: &mut Vec<ChangedField>,
) -> anyhow::Result<()> {
    match (before, after) {
        (JsonValue::Object(before_obj), JsonValue::Object(after_obj)) => {
            let mut before_keys: std::collections::HashSet<String> = before_obj.keys().cloned().collect();
            let mut after_keys: std::collections::HashSet<String> = after_obj.keys().cloned().collect();

            for key in before_keys.union(&after_keys) {
                let mut new_path = path.clone();
                new_path.push(key.clone());

                if let (Some(before_val), Some(after_val)) = (before_obj.get(key), after_obj.get(key)) {
                    if !json_eq(before_val, after_val) {
                        if before_val.is_object() && after_val.is_object() {
                            find_nested_diffs(before_val, after_val, new_path, result)?;
                        } else {
                            result.push(ChangedField {
                                field_name: new_path.join("."),
                                old_value: strip_quotes(&before_val.to_string()),
                                new_value: strip_quotes(&serde_json::to_string(after_val)?),
                            });
                        }
                    }
                } else if before_obj.contains_key(key) {
                    result.push(ChangedField {
                        field_name: new_path.join("."),
                        old_value: strip_quotes(&before_obj.get(key).unwrap().to_string()),
                        new_value: "null".to_string(),
                    });
                } else {
                    result.push(ChangedField {
                        field_name: new_path.join("."),
                        old_value: "null".to_string(),
                        new_value: strip_quotes(&serde_json::to_string(after_obj.get(key).unwrap())?),
                    });
                }
            }
        }
        _ => {}
    }
    Ok(())
}

fn truncate_string(value: &str, max_length: usize) -> String {
    if value.len() <= max_length {
        value.to_string()
    } else {
        format!("{}...", &value[..max_length])
    }
}

fn strip_quotes(value: &str) -> String {
    if (value.starts_with('"') && value.ends_with('"')) || (value.starts_with('\'') && value.ends_with('\'')) {
        value[1..value.len()-1].to_string()
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
        _ => false,
    }
}