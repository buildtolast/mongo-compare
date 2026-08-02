//! Low‑level diff utilities used by the high‑level `compare_documents` function.
+use crate::types::{ChangeField, DiffStrategy, DocumentDiff};
+use anyhow::Result;
+use serde_json::Value as JsonValue;
+
+/// Result of a field‑level diff operation.
+#[derive(Debug)]
+pub struct FieldDiff {
+    pub changed_fields: Vec<ChangeField>,
+}
+
+/// Compute field‑level differences between two JSON documents according to a
+/// `DiffStrategy`.
+pub fn find_field_diffs(
+    doc_before: &JsonValue,
+    doc_after: &JsonValue,
+    identifier_field: &str,
+    strategy: DiffStrategy,
+) -> Result<FieldDiff> {
+    let mut changed_fields: Vec<ChangeField> = Vec::new();
+
+    match &strategy {
+        DiffStrategy::All => diff_all(doc_before, doc_after, identifier_field, &mut changed_fields)?,
+        DiffStrategy::Whitelist(fields) => {
+            for field in fields {
+                if field == identifier_field {
+                    continue;
+                }
+                diff_field(doc_before, doc_after, field, &mut changed_fields)?;
+            }
+        }
+        DiffStrategy::Blacklist(fields) => {
+            let before_obj = doc_before.as_object();
+            let after_obj = doc_after.as_object().unwrap();
+            let before_keys: std::collections::BTreeSet<String> = before_obj
+                .map(|o| o.keys().cloned().collect())
+                .unwrap_or_default();
+            let after_keys: std::collections::BTreeSet<String> = after_obj.keys().cloned().collect();
+            for key in before_keys.union(&after_keys) {
+                if key == identifier_field || fields.contains(key) {
+                    continue;
+                }
+                diff_field(doc_before, doc_after, key, &mut changed_fields)?;
+            }
+        }
+        DiffStrategy::DeepEquality => diff_deep(doc_before, doc_after, identifier_field, &mut changed_fields)?,
+    }
+
+    // Deduplicate paths while preserving order.
+    let mut seen = std::collections::BTreeSet::new();
+    let mut dedup = Vec::new();
+    for f in changed_fields {
+        if seen.insert(f.path.clone()) {
+            dedup.push(f);
+        }
+    }
+    Ok(FieldDiff { changed_fields: dedup })
+}
+
+// ---------------------------------------------------------------------------
+// Helper implementations for each strategy.
+// ---------------------------------------------------------------------------
+
+fn diff_all(
+    before: &JsonValue,
+    after: &JsonValue,
+    identifier_field: &str,
+    out: &mut Vec<ChangeField>,
+) -> Result<()> {
+    let before_obj = before.as_object();
+    let after_obj = after.as_object().unwrap();
+    let before_keys: std::collections::BTreeSet<String> = before_obj
+        .map(|o| o.keys().cloned().collect())
+        .unwrap_or_default();
+    let after_keys: std::collections::BTreeSet<String> = after_obj.keys().cloned().collect();
+    for key in before_keys.union(&after_keys) {
+        if key == identifier_field {
+            continue;
+        }
+        diff_field(before, after, key, out)?;
+    }
+    Ok(())
+}
+
+fn diff_deep(
+    before: &JsonValue,
+    after: &JsonValue,
+    identifier_field: &str,
+    out: &mut Vec<ChangeField>,
+) -> Result<()> {
+    let before_obj = before.as_object();
+    let after_obj = after.as_object().unwrap();
+    let before_keys: std::collections::BTreeSet<String> = before_obj
+        .map(|o| o.keys().cloned().collect())
+        .unwrap_or_default();
+    let after_keys: std::collections::BTreeSet<String> = after_obj.keys().cloned().collect();
+    for key in before_keys.union(&after_keys) {
+        if key == identifier_field {
+            continue;
+        }
+        let v_before = before.get(key);
+        let v_after = after.get(key);
+        match (v_before, v_after) {
+            (Some(b), Some(a)) => {
+                if !json_eq(b, a) {
+                    // Primitive diff only – ignore nested objects.
+                    if !(b.is_object() && a.is_object()) {
+                        let old_str = strip_quotes(&b.to_string());
+                        let new_str = strip_quotes(&serde_json::to_string(a)?);
+                        out.push(ChangeField {
+                            path: key.clone(),
+                            old_value: Some(old_str),
+                            new_value: Some(new_str),
+                            change_type: "changed".to_string(),
+                        });
+                    }
+                }
+            }
+            (None, Some(a)) => {
+                if !a.is_object() {
+                    out.push(ChangeField {
+                        path: key.clone(),
+                        old_value: None,
+                        new_value: Some(strip_quotes(&serde_json::to_string(a)?)),
+                        change_type: "added".to_string(),
+                    });
+                }
+            }
+            (Some(b), None) => {
+                if !b.is_object() {
+                    out.push(ChangeField {
+                        path: key.clone(),
+                        old_value: Some(strip_quotes(&b.to_string())),
+                        new_value: None,
+                        change_type: "removed".to_string(),
+                    });
+                }
+            }
+            _ => {}
+        }
+    }
+    Ok(())
+}
+
+fn diff_field(
+    before: &JsonValue,
+    after: &JsonValue,
+    field: &str,
+    out: &mut Vec<ChangeField>,
+) -> Result<()> {
+    let v_before = get_nested_value(before, field);
+    let v_after = get_nested_value(after, field);
+    match (v_before, v_after) {
+        (Some(b), Some(a)) => {
+            if !json_eq(b, a) {
+                if b.is_object() && a.is_object() {
+                    // Recurse into nested objects.
+                    let mut nested: Vec<ChangeField> = Vec::new();
+                    find_nested_diffs(b, a, vec![field.to_string()], &mut nested)?;
+                    out.extend(nested);
+                } else {
+                    let old_str = strip_quotes(&b.to_string());
+                    let new_str = strip_quotes(&serde_json::to_string(a)?);
+                    out.push(ChangeField {
+                        path: field.to_string(),
+                        old_value: Some(old_str),
+                        new_value: Some(new_str),
+                        change_type: "changed".to_string(),
+                    });
+                }
+            }
+        }
+        (None, Some(a)) if !a.is_object() => {
+            out.push(ChangeField {
+                path: field.to_string(),
+                old_value: None,
+                new_value: Some(strip_quotes(&serde_json::to_string(a)?)),
+                change_type: "added".to_string(),
+            });
+        }
+        (Some(b), None) if !b.is_object() => {
+            out.push(ChangeField {
+                path: field.to_string(),
+                old_value: Some(strip_quotes(&b.to_string())),
+                new_value: None,
+                change_type: "removed".to_string(),
+            });
+        }
+        _ => {}
+    }
+    Ok(())
+}
+
+// ---------------------------------------------------------------------------
+// Recursive nested diff implementation.
+// ---------------------------------------------------------------------------
+
+fn find_nested_diffs(
+    before: &JsonValue,
+    after: &JsonValue,
+    path: Vec<String>,
+    result: &mut Vec<ChangeField>,
+) -> anyhow::Result<()> {
+    if let (JsonValue::Object(b_obj), JsonValue::Object(a_obj)) = (before, after) {
+        let before_keys: std::collections::BTreeSet<String> = b_obj.keys().cloned().collect();
+        let after_keys: std::collections::BTreeSet<String> = a_obj.keys().cloned().collect();
+        for key in before_keys.union(&after_keys) {
+            let mut new_path = path.clone();
+            new_path.push(key.clone());
+            match (b_obj.get(key), a_obj.get(key)) {
+                (Some(bv), Some(av)) => {
+                    if !json_eq(bv, av) {
+                        if bv.is_object() && av.is_object() {
+                            find_nested_diffs(bv, av, new_path, result)?;
+                        } else {
+                            result.push(ChangeField {
+                                path: new_path.join("."),
+                                old_value: Some(strip_quotes(&bv.to_string())),
+                                new_value: Some(strip_quotes(&serde_json::to_string(av)?)),
+                                change_type: "changed".to_string(),
+                            });
+                        }
+                    }
+                }
+                (Some(_), None) => {
+                    result.push(ChangeField {
+                        path: new_path.join("."),
+                        old_value: Some(strip_quotes(&b_obj.get(key).unwrap().to_string())),
+                        new_value: None,
+                        change_type: "removed".to_string(),
+                    });
+                }
+                (None, Some(_)) => {
+                    result.push(ChangeField {
+                        path: new_path.join("."),
+                        old_value: None,
+                        new_value: Some(strip_quotes(&serde_json::to_string(
+                            a_obj.get(key).unwrap(),
+                        )?)),
+                        change_type: "added".to_string(),
+                    });
+                }
+                (None, None) => {}
+            }
+        }
+    }
+    Ok(())
+}
+
+// ---------------------------------------------------------------------------
+// Utility helpers.
+// ---------------------------------------------------------------------------
+
+fn get_nested_value<'a>(doc: &'a JsonValue, path: &str) -> Option<&'a JsonValue> {
+    let mut current: Option<&JsonValue> = Some(doc);
+    for part in path.split('.') {
+        match current {
+            Some(JsonValue::Object(map)) => current = map.get(part),
+            _ => return None,
+        }
+    }
+    current
+}
+
+fn strip_quotes(value: &str) -> String {
+    if (value.starts_with('"') && value.ends_with('"'))
+        || (value.starts_with('\'') && value.ends_with('\''))
+    {
+        value[1..value.len() - 1].to_string()
+    } else {
+        value.to_string()
+    }
+}
+
+fn json_eq(a: &JsonValue, b: &JsonValue) -> bool {
+    match (a, b) {
+        (JsonValue::String(a), JsonValue::String(b)) => a == b,
+        (JsonValue::Number(a), JsonValue::Number(b)) => a == b,
+        (JsonValue::Bool(a), JsonValue::Bool(b)) => a == b,
+        (JsonValue::Array(a), JsonValue::Array(b)) => a == b,
+        (JsonValue::Object(a), JsonValue::Object(b)) => a == b,
+        (JsonValue::Null, JsonValue::Null) => true,
+        _ => false,
+    }
+}
