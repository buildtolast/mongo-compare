use super::types::Config;
use anyhow::Result;

pub fn load_config() -> Result<Config> {
    let config_path = std::env::args().nth(1).unwrap_or_else(|| "config.json".to_string());
    let config_content = std::fs::read_to_string(&config_path)?;
    let config: Config = serde_json::from_str(&config_content)?;
    Ok(config)
}