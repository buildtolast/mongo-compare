import { MongoClient, Db } from 'mongodb'

export interface MongoDBClientConfig {
  username?: string
  password?: string
  authDatabase?: string
  tls?: boolean
  poolSize?: number
  connectTimeoutMS?: number
  socketTimeoutMS?: number
  serverSelectionTimeoutMS?: number
}

export class MongoDBClient {
  private connections: Map<string, { client: MongoClient; db: Db }> = new Map()
  private connectionStrings: Set<string> = new Set()

  async connect(
    connectionString: string,
    config: MongoDBClientConfig
  ): Promise<Db> {
    if (this.connectionStrings.has(connectionString)) {
      const existing = this.connections.get(connectionString)
      if (existing) return existing.db
    }

    const options: Record<string, unknown> = {
      tls: config.tls ?? false,
      maxPoolSize: config.poolSize ?? 10,
      serverSelectionTimeoutMS: config.serverSelectionTimeoutMS ?? 30000,
      socketTimeoutMS: config.socketTimeoutMS ?? 30000,
    } as Record<string, unknown>

    if (config.username && config.password) {
      options.auth = {
        username: config.username,
        password: config.password,
      }
      if (config.authDatabase) {
        options.authSource = config.authDatabase
      }
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = new MongoClient(connectionString, options as any)
      await client.connect()
      const db = client.db()

      this.connections.set(connectionString, { client, db })
      this.connectionStrings.add(connectionString)

      return db
    } catch (error) {
      throw new Error(
        `Failed to connect to MongoDB: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async disconnect(connectionString: string): Promise<void> {
    const connection = this.connections.get(connectionString)
    if (connection) {
      await connection.client.close()
      this.connections.delete(connectionString)
      this.connectionStrings.delete(connectionString)
    }
  }

  async getDatabases(connectionString: string): Promise<string[]> {
    const connection = this.connections.get(connectionString)
    if (!connection) {
      throw new Error(
        'Not connected. Call connect() first with the same connection string.'
      )
    }

    try {
      const databases = await connection.client.db().admin().listDatabases()
      return databases.databases.map((db) => db.name)
    } catch (error) {
      throw new Error(
        `Failed to list databases: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async getCollections(
    connectionString: string,
    database: string
  ): Promise<string[]> {
    const connection = this.connections.get(connectionString)
    if (!connection) {
      throw new Error(
        'Not connected. Call connect() first with the same connection string.'
      )
    }

    try {
      const db = connection.client.db(database)
      const collections = await db.listCollections().toArray()
      return collections.map((collection) => collection.name)
    } catch (error) {
      throw new Error(
        `Failed to list collections in database '${database}': ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async getSampleDocument(
    connectionString: string,
    database: string,
    collection: string
  ): Promise<Record<string, unknown> | null> {
    const connection = this.connections.get(connectionString)
    if (!connection) {
      throw new Error(
        'Not connected. Call connect() first with the same connection string.'
      )
    }

    try {
      const db = connection.client.db(database)
      const doc = await db.collection(collection).findOne({})
      return doc
    } catch (error) {
      throw new Error(
        `Failed to get sample document from '${database}.${collection}': ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  isConnected(connectionString: string): boolean {
    return this.connectionStrings.has(connectionString)
  }

  async closeAll(): Promise<void> {
    const connections = Array.from(this.connections.values())
    this.connections.clear()
    this.connectionStrings.clear()

    await Promise.all(
      connections.map((conn) => conn.client.close().catch(() => {}))
    )
  }
}
