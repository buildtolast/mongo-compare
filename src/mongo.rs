use anyhow::Result;
use mongodb::bson::Document;
use mongodb::Client;

pub async fn connect_to_mongo(uri: &str) -> Result<Client> {
    let client = mongodb::Client::with_uri_str(uri).await?;
    Ok(client)
}

pub async fn get_collection(
    client: &Client,
    db_name: &str,
    collection_name: &str,
) -> Result<mongodb::Collection<Document>> {
    let db = client.database(db_name);
    let collection = db.collection::<Document>(collection_name);
    Ok(collection)
}
