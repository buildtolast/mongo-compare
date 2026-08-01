pub mod comparison;
pub mod config;
pub mod mongo;
pub mod output;
pub mod types;

pub use comparison::{compare_documents, find_field_diffs};
pub use types::{ChangeField, ComparisonResult, DiffStrategy, DocumentDiff};
