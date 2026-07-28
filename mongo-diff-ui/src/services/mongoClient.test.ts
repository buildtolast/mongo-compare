import { describe, it, expect, beforeEach } from 'vitest'
import { MongoDBClient, MongoDBClientConfig } from './mongoClient'

describe('MongoDBClient', () => {
  let client: MongoDBClient

  beforeEach(() => {
    client = new MongoDBClient()
  })

  describe('isConnected', () => {
    it('should return false for not connected connection string', async () => {
      expect(client.isConnected('mongodb://not-connected:27017')).toBe(false)
    })
  })

  describe('getDatabases', () => {
    it('should throw error if not connected', async () => {
      const connectionString = 'mongodb://localhost:27017'

      await expect(
        client.getDatabases(connectionString)
      ).rejects.toThrow('Not connected. Call connect() first with the same connection string.')
    })
  })

  describe('getCollections', () => {
    it('should throw error if not connected', async () => {
      const connectionString = 'mongodb://localhost:27017'
      const database = 'test'

      await expect(
        client.getCollections(connectionString, database)
      ).rejects.toThrow('Not connected. Call connect() first with the same connection string.')
    })
  })

  describe('getSampleDocument', () => {
    it('should throw error if not connected', async () => {
      const connectionString = 'mongodb://localhost:27017'
      const database = 'test'
      const collection = 'users'

      await expect(
        client.getSampleDocument(connectionString, database, collection)
      ).rejects.toThrow('Not connected. Call connect() first with the same connection string.')
    })
  })

  describe('disconnect', () => {
    it('should not throw error if connection does not exist', async () => {
      const connectionString = 'mongodb://localhost:27017'

      await expect(
        client.disconnect(connectionString)
      ).resolves.toBeUndefined()
    })
  })

  describe('closeAll', () => {
    it('should not throw error if no connections exist', async () => {
      await expect(client.closeAll()).resolves.toBeUndefined()
    })
  })
})
