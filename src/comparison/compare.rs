//! Document comparison core logic – high‑level orchestration.
+use crate::types::{ChangeField, DocumentDiff};
+use anyhow::Result;
+use serde_json::Value as JsonValue;
+use std::collections::{HashMap, BTreeSet};
+
+/// Internal tuple used by `compare_documents` to return statistics and sample documents.
+/// Keeping it private avoids leaking a positional API to callers.
+type ComparisonStats = (
+    usize,
+    usize,
+    usize,
+    Vec<DocumentDiff>,
+    Vec<JsonValue>,
+    Vec<JsonValue>,
+);
+
+/// Compare two batches of MongoDB documents and identify differences.
+///
+/// Returns a tuple `(created, updated, deleted, updated_samples, created_samples, deleted_samples)`.
+pub fn compare_documents(
+    docs_before: Vec<JsonValue>,
+    docs_after: Vec<JsonValue>,
+    identifier_field: &str,
+    sample_limit: usize,
+    diff_strategy: crate::types::DiffStrategy,
+) -> Result<ComparisonStats> {
+    let mut created_count = 0usize;
+    let mut updated_count = 0usize;
+    let mut deleted_count = 0usize;
+    let mut sample_created: Vec<JsonValue> = Vec::new();
+    let mut sample_updated: Vec<DocumentDiff> = Vec::new();
+    let mut sample_deleted: Vec<JsonValue> = Vec::new();
+
+    // Build a map of identifier → document for the before‑side.
+    let mut before_map: HashMap<String, JsonValue> = HashMap::new();
+    for doc in &docs_before {
+        if let Some(id) = doc.get(identifier_field) {
+            before_map.insert(id.to_string(), doc.clone());
+        } else {
+            log::warn!(
+                "Skipping before‑side document lacking identifier field '{}'",
+                identifier_field
+            );
+        }
+    }
+
+    // Walk the after‑side documents and classify them.
+    for doc_after in &docs_after {
+        if doc_after.get(identifier_field).is_none() {
+            log::warn!(
+                "Skipping after‑side document lacking identifier field '{}'",
+                identifier_field
+            );
+        }
+        if let Some(id) = doc_after.get(identifier_field) {
+            let id_str = id.to_string();
+            if let Some(doc_before) = before_map.get(&id_str) {
+                // Document exists on both sides – diff it.
+                let diff = crate::comparison::diff::find_field_diffs(
+                    doc_before,
+                    doc_after,
+                    identifier_field,
+                    diff_strategy.clone(),
+                )?;
+                if !diff.changed_fields.is_empty() {
+                    updated_count += 1;
+                    if sample_limit > 0 && sample_updated.len() < sample_limit {
+                        sample_updated.push(DocumentDiff {
+                            identifier: id_str.clone(),
+                            changes: diff.changed_fields,
+                        });
+                    }
+                }
+            } else {
+                // New document.
+                created_count += 1;
+                if sample_limit > 0 && sample_created.len() < sample_limit {
+                    sample_created.push(doc_after.clone());
+                }
+            }
+        }
+    }
+
+    // Determine deletions by comparing identifier sets.
+    let after_ids: BTreeSet<String> = docs_after
+        .iter()
+        .filter_map(|doc| doc.get(identifier_field).map(|id| id.to_string()))
+        .collect();
+    for id in before_map.keys() {
+        if !after_ids.contains(id) {
+            deleted_count += 1;
+            if sample_limit > 0 && sample_deleted.len() < sample_limit {
+                sample_deleted.push(before_map.get(id).unwrap().clone());
+            }
+        }
+    }
+
+    Ok((created_count, updated_count, deleted_count, sample_updated, sample_created, sample_deleted))
+}
