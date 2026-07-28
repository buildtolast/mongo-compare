import type { ConnectionConfig } from './connection.js'
import type { CollectionSelector } from './collection.js'

export interface Snapshot {
  id?: string
  name: string
  description?: string
  createdAt: string
  config: {
    source: ConnectionConfig
    target: ConnectionConfig
    collections: CollectionSelector
  }
}
