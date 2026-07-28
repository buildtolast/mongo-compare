use testcontainers::runners::AsyncRunner;
use testcontainers::Image;

pub struct MongoContainer {
    container: testcontainers::clients::ContainerAsync<testcontainers::images::mongo::Mongo>,
    port: u16,
}

impl MongoContainer {
    pub async fn start() -> Result<Self, String> {
        let image = testcontainers::images::mongo::Mongo::default();
        
        let container = image
            .start()
            .await
            .map_err(|e| format!("Failed to start MongoDB container: {}", e))?;
        
        let port = container
            .get_host_port_ipv4(27017)
            .await
            .map_err(|e| format!("Failed to get MongoDB port: {}", e))?;
        
        Ok(Self { container, port })
    }
    
    pub fn port(&self) -> u16 {
        self.port
    }
    
    pub fn connection_string(&self) -> String {
        format!("mongodb://localhost:{}", self.port)
    }
}

impl Drop for MongoContainer {
    fn drop(&mut self) {
        // Container will be cleaned up when dropped
    }
}
