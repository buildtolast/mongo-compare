//! Public interface for the comparison module.
+//!
+//! This file re‑exports the core functionality split across sub‑modules.
+pub mod compare;
+pub mod diff;
+
+// Re‑export the primary API so callers can continue using
+// `mongo_compare::comparison::compare_documents` and
+// `mongo_compare::comparison::find_field_diffs` as before.
+pub use compare::compare_documents;
+pub use diff::{find_field_diffs, FieldDiff};
