use actix_cors::Cors;
use actix_web::{App, HttpServer};
use anyhow::Result as AnyResult;
use mongo_compare::server_app::configure_app;

#[actix_web::main]
async fn main() -> AnyResult<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    log::info!("Starting MongoDB Diff Server on port 8080");

    HttpServer::new(|| {
        App::new()
            .wrap(
                Cors::default()
                    .allowed_origin("http://localhost")
                    .allowed_origin("http://127.0.0.1")
                    .allow_any_method()
                    .allow_any_header()
                    .max_age(3600)
            )
            .configure(configure_app)
    })
    .bind("127.0.0.1:3001")?
    .run()
    .await?;

    Ok(())
}
