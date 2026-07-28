use crate::types::{ComparisonResult, DocumentDiff};
use anyhow::Result;
use serde_json;

pub fn write_summary(result: &ComparisonResult, output_path: &str) -> Result<()> {
    let json_output = serde_json::to_string_pretty(result)?;
    std::fs::write(output_path, json_output)?;
    Ok(())
}

pub fn print_summary(
    created: usize,
    updated: usize,
    deleted: usize,
    sample_updated: &[DocumentDiff],
    sample_deleted: &[serde_json::Value],
) {
    println!("\n📊 Comparison Summary:");
    println!("  🟢 Created: {}", created);
    println!("  🔵 Updated: {}", updated);
    println!("  🔴 Deleted: {}", deleted);

    if !sample_updated.is_empty() {
        println!("\n📝 Updated documents (sample):");
        for diff in sample_updated {
            println!("\n  ID: {}", diff.identifier);
            for field in &diff.changed_fields {
                println!(
                    "    {}: {} → {}",
                    field.field_name, field.old_value, field.new_value
                );
            }
        }
    }

    if !sample_deleted.is_empty() {
        println!("\n🗑️  Deleted documents (sample):");
        for doc in sample_deleted {
            println!(
                "  ID: {}",
                doc.get("_id").unwrap_or(&serde_json::Value::Null)
            );
        }
    }
}
