import { describe, it, expect } from 'vitest'
import type { ConnectionConfig, CollectionSelector, ChangeField, DocumentDiff, ComparisonResult, ExportConfig, Snapshot } from '@/types'

describe('Types', () => {
  describe('ConnectionConfig', () => {
    it('should have required properties', () => {
      const config: ConnectionConfig = {
        connectionString: 'mongodb://localhost:27017',
      }
      expect(config.connectionString).toBe('mongodb://localhost:27017')
    })

    it('should have optional properties', () => {
      const config: ConnectionConfig = {
        connectionString: 'mongodb://localhost:27017',
        username: 'admin',
        password: 'secret',
        authDatabase: 'admin',
        tls: true,
        poolSize: 10,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
        serverSelectionTimeoutMS: 30000,
      }
      expect(config.username).toBe('admin')
      expect(config.tls).toBe(true)
      expect(config.poolSize).toBe(10)
    })
  })

  describe('CollectionSelector', () => {
    it('should have required properties', () => {
      const selector: CollectionSelector = {
        database: 'test',
        collections: ['users', 'orders'],
        identifierField: 'id',
      }
      expect(selector.database).toBe('test')
      expect(selector.collections).toEqual(['users', 'orders'])
      expect(selector.identifierField).toBe('id')
    })

    it('should have optional properties', () => {
      const selector: CollectionSelector = {
        database: 'test',
        collections: ['users'],
        pattern: '^(users|orders)$',
        identifierField: 'id',
        compositeKeys: ['field1', 'field2'],
      }
      expect(selector.pattern).toBe('^(users|orders)$')
      expect(selector.compositeKeys).toEqual(['field1', 'field2'])
    })
  })

  describe('ChangeField', () => {
    it('should track field changes', () => {
      const field: ChangeField = {
        path: 'user.name',
        old_value: 'John',
        new_value: 'Jane',
        type: 'changed',
      }
      expect(field.path).toBe('user.name')
      expect(field.old_value).toBe('John')
      expect(field.new_value).toBe('Jane')
      expect(field.type).toBe('changed')
    })

    it('should track added fields', () => {
      const field: ChangeField = {
        path: 'user.email',
        old_value: undefined,
        new_value: 'john@example.com',
        type: 'added',
      }
      expect(field.type).toBe('added')
    })

    it('should track removed fields', () => {
      const field: ChangeField = {
        path: 'user.phone',
        old_value: '+1234567890',
        new_value: undefined,
        type: 'removed',
      }
      expect(field.type).toBe('removed')
    })
  })

  describe('DocumentDiff', () => {
    it('should track document differences', () => {
      const diff: DocumentDiff = {
        identifier: '12345',
        changes: [
          {
            path: 'name',
            old_value: 'John',
            new_value: 'Jane',
            type: 'changed',
          },
        ],
      }
      expect(diff.identifier).toBe('12345')
      expect(diff.changes).toHaveLength(1)
    })
  })

  describe('ComparisonResult', () => {
    it('should contain comparison summary', () => {
      const result: ComparisonResult = {
        timestamp: '2024-01-15T10:00:00Z',
        source_instance: 'mongodb://localhost:27017',
        target_instance: 'mongodb://localhost:27018',
        source_database: 'production',
        target_database: 'staging',
        total_before: 100,
        total_after: 95,
        created: { count: 5, samples: [] },
        updated: { count: 10, samples: [] },
        deleted: { count: 2, samples: [] },
      }
      expect(result.created.count).toBe(5)
      expect(result.updated.count).toBe(10)
      expect(result.deleted.count).toBe(2)
    })
  })

  describe('ExportConfig', () => {
    it('should specify export format', () => {
      const config: ExportConfig = {
        format: 'json',
      }
      expect(config.format).toBe('json')
    })

    it('should support all formats', () => {
      const jsonConfig: ExportConfig = { format: 'json' }
      const csvConfig: ExportConfig = { format: 'csv' }
      const htmlConfig: ExportConfig = { format: 'html' }
      expect(jsonConfig.format).toBe('json')
      expect(csvConfig.format).toBe('csv')
      expect(htmlConfig.format).toBe('html')
    })
  })

  describe('Snapshot', () => {
    it('should store comparison configuration', () => {
      const snapshot: Snapshot = {
        id: '1',
        name: 'Production to Staging',
        createdAt: '2024-01-15T10:00:00Z',
        config: {
          source: { connectionString: 'mongodb://localhost:27017' },
          target: { connectionString: 'mongodb://localhost:27018' },
          collections: {
            database: 'test',
            collections: ['users'],
            identifierField: 'id',
          },
        },
      }
      expect(snapshot.name).toBe('Production to Staging')
      expect(snapshot.config.source.connectionString).toBe('mongodb://localhost:27017')
    })
  })
})
