use std::path::Path;
use std::process::Command;

pub async fn load_test_data(container: &MongoContainer, fixture_dir: &str) -> Result<(), String> {
    let fixture_path = Path::new(fixture_dir);
    
    if !fixture_path.exists() {
        return Err(format!("Fixture directory not found: {}", fixture_dir));
    }
    
    let mongorestore_path = std::env::var("MONGORESTORE_PATH").unwrap_or_else(|_| "mongorestore".to_string());
    
    let status = Command::new(&mongorestore_path)
        .arg("--host")
        .arg("localhost")
        .arg("--port")
        .arg(container.port().to_string())
        .arg("--db")
        .arg("mongo-compare-test")
        .arg("--drop")
        .arg(fixture_dir)
        .status()
        .map_err(|e| format!("Failed to execute mongorestore: {}", e))?;
    
    if status.success() {
        Ok(())
    } else {
        Err("mongorestore failed".to_string())
    }
}
