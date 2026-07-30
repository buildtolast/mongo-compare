import { describe, it, expect, beforeEach } from 'vitest'
import { SnapshotService } from './snapshotService'

describe('SnapshotService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('save', () => {
    it('should save a snapshot with id, name, description, timestamp, and config', async () => {
      const snapshotService = new SnapshotService()
      const snapshot = {
        id: 'test-snapshot-id',
        name: 'Test Snapshot',
        description: 'A test snapshot',
        createdAt: '2024-01-01T00:00:00.000Z',
        config: {
          source: {
            connectionString: 'mongodb://localhost:27017',
            database: 'testdb',
          },
          target: {
            connectionString: 'mongodb://localhost:27018',
            database: 'testdb2',
          },
          collections: {
            database: 'testdb',
            collections: ['users', 'posts'],
            identifierField: '_id',
          },
        },
      }

      await snapshotService.save(snapshot)

      const stored = localStorage.getItem('mongo-diff-snapshots')
      expect(stored).not.toBeNull()
      const snapshots = JSON.parse(stored!)
      expect(snapshots).toHaveLength(1)
      expect(snapshots[0]).toEqual(snapshot)
    })

    it('should generate id if not provided', async () => {
      const snapshotService = new SnapshotService()
      const snapshot = {
        name: 'Test Snapshot',
        description: 'A test snapshot',
        createdAt: '2024-01-01T00:00:00.000Z',
        config: {
          source: {
            connectionString: 'mongodb://localhost:27017',
            database: 'testdb',
          },
          target: {
            connectionString: 'mongodb://localhost:27018',
            database: 'testdb2',
          },
          collections: {
            database: 'testdb',
            collections: ['users'],
            identifierField: '_id',
          },
        },
      }

      await snapshotService.save(snapshot)

      const stored = localStorage.getItem('mongo-diff-snapshots')
      expect(stored).not.toBeNull()
      const snapshots = JSON.parse(stored!)
      expect(snapshots[0].id).toBeDefined()
    })

    it('should append to existing snapshots', async () => {
      const snapshotService = new SnapshotService()
      
      const snapshot1 = {
        id: 'snapshot-1',
        name: 'Snapshot 1',
        createdAt: '2024-01-01T00:00:00.000Z',
        config: {
          source: { connectionString: 'mongodb://localhost:27017', database: 'db1' },
          target: { connectionString: 'mongodb://localhost:27018', database: 'db1' },
          collections: { database: 'db1', collections: ['c1'], identifierField: '_id' },
        },
      }

      await snapshotService.save(snapshot1)

      const snapshot2 = {
        id: 'snapshot-2',
        name: 'Snapshot 2',
        createdAt: '2024-01-02T00:00:00.000Z',
        config: {
          source: { connectionString: 'mongodb://localhost:27017', database: 'db2' },
          target: { connectionString: 'mongodb://localhost:27018', database: 'db2' },
          collections: { database: 'db2', collections: ['c2'], identifierField: '_id' },
        },
      }

      await snapshotService.save(snapshot2)

      const stored = localStorage.getItem('mongo-diff-snapshots')
      const snapshots = JSON.parse(stored!)
      expect(snapshots).toHaveLength(2)
      expect(snapshots[0].name).toBe('Snapshot 1')
      expect(snapshots[1].name).toBe('Snapshot 2')
    })
  })

  describe('load', () => {
    it('should return empty array if no snapshots exist', async () => {
      const snapshotService = new SnapshotService()
      const snapshots = await snapshotService.load()
      expect(snapshots).toEqual([])
    })

    it('should load all saved snapshots', async () => {
      const snapshotService = new SnapshotService()
      
      await snapshotService.save({
        id: 'snapshot-1',
        name: 'Snapshot 1',
        createdAt: '2024-01-01T00:00:00.000Z',
        config: {
          source: { connectionString: 'mongodb://localhost:27017', database: 'db1' },
          target: { connectionString: 'mongodb://localhost:27018', database: 'db1' },
          collections: { database: 'db1', collections: ['c1'], identifierField: '_id' },
        },
      })

      await snapshotService.save({
        id: 'snapshot-2',
        name: 'Snapshot 2',
        createdAt: '2024-01-02T00:00:00.000Z',
        config: {
          source: { connectionString: 'mongodb://localhost:27017', database: 'db2' },
          target: { connectionString: 'mongodb://localhost:27018', database: 'db2' },
          collections: { database: 'db2', collections: ['c2'], identifierField: '_id' },
        },
      })

      const snapshots = await snapshotService.load()
      expect(snapshots).toHaveLength(2)
      // Snapshots are sorted by createdAt in descending order (newest first)
      expect(snapshots[0].name).toBe('Snapshot 2')
      expect(snapshots[1].name).toBe('Snapshot 1')
    })

    it('should return snapshots sorted by createdAt in descending order', async () => {
      const snapshotService = new SnapshotService()
      
      await snapshotService.save({
        id: 'snapshot-1',
        name: 'Snapshot 1',
        createdAt: '2024-01-03T00:00:00.000Z',
        config: {
          source: { connectionString: 'mongodb://localhost:27017', database: 'db1' },
          target: { connectionString: 'mongodb://localhost:27018', database: 'db1' },
          collections: { database: 'db1', collections: ['c1'], identifierField: '_id' },
        },
      })

      await snapshotService.save({
        id: 'snapshot-2',
        name: 'Snapshot 2',
        createdAt: '2024-01-01T00:00:00.000Z',
        config: {
          source: { connectionString: 'mongodb://localhost:27017', database: 'db2' },
          target: { connectionString: 'mongodb://localhost:27018', database: 'db2' },
          collections: { database: 'db2', collections: ['c2'], identifierField: '_id' },
        },
      })

      await snapshotService.save({
        id: 'snapshot-3',
        name: 'Snapshot 3',
        createdAt: '2024-01-02T00:00:00.000Z',
        config: {
          source: { connectionString: 'mongodb://localhost:27017', database: 'db3' },
          target: { connectionString: 'mongodb://localhost:27018', database: 'db3' },
          collections: { database: 'db3', collections: ['c3'], identifierField: '_id' },
        },
      })

      const snapshots = await snapshotService.load()
      expect(snapshots[0].name).toBe('Snapshot 1')
      expect(snapshots[1].name).toBe('Snapshot 3')
      expect(snapshots[2].name).toBe('Snapshot 2')
    })
  })

  describe('delete', () => {
    it('should delete a snapshot by id', async () => {
      const snapshotService = new SnapshotService()
      
      await snapshotService.save({
        id: 'snapshot-1',
        name: 'Snapshot 1',
        createdAt: '2024-01-01T00:00:00.000Z',
        config: {
          source: { connectionString: 'mongodb://localhost:27017', database: 'db1' },
          target: { connectionString: 'mongodb://localhost:27018', database: 'db1' },
          collections: { database: 'db1', collections: ['c1'], identifierField: '_id' },
        },
      })

      await snapshotService.save({
        id: 'snapshot-2',
        name: 'Snapshot 2',
        createdAt: '2024-01-02T00:00:00.000Z',
        config: {
          source: { connectionString: 'mongodb://localhost:27017', database: 'db2' },
          target: { connectionString: 'mongodb://localhost:27018', database: 'db2' },
          collections: { database: 'db2', collections: ['c2'], identifierField: '_id' },
        },
      })

      await snapshotService.delete('snapshot-1')

      const snapshots = await snapshotService.load()
      expect(snapshots).toHaveLength(1)
      expect(snapshots[0].name).toBe('Snapshot 2')
    })

    it('should not throw error if snapshot does not exist', async () => {
      const snapshotService = new SnapshotService()
      
      await expect(snapshotService.delete('non-existent')).resolves.not.toThrow()
    })

    it('should not modify other snapshots when deleting', async () => {
      const snapshotService = new SnapshotService()
      
      await snapshotService.save({
        id: 'snapshot-1',
        name: 'Snapshot 1',
        createdAt: '2024-01-01T00:00:00.000Z',
        config: {
          source: { connectionString: 'mongodb://localhost:27017', database: 'db1' },
          target: { connectionString: 'mongodb://localhost:27018', database: 'db1' },
          collections: { database: 'db1', collections: ['c1'], identifierField: '_id' },
        },
      })

      await snapshotService.save({
        id: 'snapshot-2',
        name: 'Snapshot 2',
        createdAt: '2024-01-02T00:00:00.000Z',
        config: {
          source: { connectionString: 'mongodb://localhost:27017', database: 'db2' },
          target: { connectionString: 'mongodb://localhost:27018', database: 'db2' },
          collections: { database: 'db2', collections: ['c2'], identifierField: '_id' },
        },
      })

      await snapshotService.delete('snapshot-1')

      const snapshots = await snapshotService.load()
      expect(snapshots[0].name).toBe('Snapshot 2')
      expect(snapshots[0].config.source.database).toBe('db2')
    })
  })
})
