export interface ConnectionConfig {
  connectionString: string
  username?: string
  password?: string
  authDatabase?: string
  database?: string
  tls?: boolean
  poolSize?: number
  connectTimeoutMS?: number
  socketTimeoutMS?: number
  serverSelectionTimeoutMS?: number
}
