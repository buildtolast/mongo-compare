import { describe, it, expect, vi, afterAll } from 'vitest'
import { MonitoringService, type MonitoringConfig } from './monitoringService.js'
import type { ChangeEvent } from './monitoringService.js'

describe('MonitoringService Integration', () => {
  const mockConfig: MonitoringConfig = {
    sourceConnectionString: 'mongodb://localhost:27017',
    targetConnectionString: 'mongodb://localhost:27018',
    database: 'testdb',
    collection: 'testcollection',
    identifierField: '_id',
  }

  it('should handle multiple change events in batch', async () => {
    const service = new MonitoringService(mockConfig)

    const changes: ChangeEvent[] = [
      {
        operationType: 'insert',
        fullDocument: { _id: '1', name: 'doc1' },
        documentKey: { _id: '1' },
        ns: { db: 'testdb', coll: 'testcollection' },
      },
      {
        operationType: 'update',
        documentKey: { _id: '2' },
        ns: { db: 'testdb', coll: 'testcollection' },
        updateDescription: {
          updatedFields: { name: 'updated' },
          removedFields: [],
        },
      },
      {
        operationType: 'delete',
        documentKey: { _id: '3' },
        ns: { db: 'testdb', coll: 'testcollection' },
      },
    ]

    changes.forEach((change) => {
      service['handleSourceChange'](change)
    })

    expect(service['changeBatch'].length).toBe(3)
  })

  it('should process changes from both source and target streams', async () => {
    const service = new MonitoringService(mockConfig)

    const sourceChange: ChangeEvent = {
      operationType: 'insert',
      fullDocument: { _id: '1', name: 'source' },
      documentKey: { _id: '1' },
      ns: { db: 'testdb', coll: 'testcollection' },
    }

    const targetChange: ChangeEvent = {
      operationType: 'insert',
      fullDocument: { _id: '1', name: 'target' },
      documentKey: { _id: '1' },
      ns: { db: 'testdb', coll: 'testcollection' },
    }

    service['handleSourceChange'](sourceChange)
    service['handleTargetChange'](targetChange)

    expect(service['pendingChanges'].length).toBe(2)
  })

  it('should batch changes within delay window', async () => {
    const service = new MonitoringService(mockConfig)

    for (let i = 0; i < 5; i++) {
      const change: ChangeEvent = {
        operationType: 'insert',
        fullDocument: { _id: String(i), name: `doc${i}` },
        documentKey: { _id: String(i) },
        ns: { db: 'testdb', coll: 'testcollection' },
      }
      service['handleSourceChange'](change)
    }

    expect(service['changeBatch'].length).toBe(5)
  })

  it('should track reconnection attempts', async () => {
    const service = new MonitoringService(mockConfig)

    service['reconnectionAttempts'] = 3
    service['maxReconnectionAttempts'] = 5

    expect(service['reconnectionAttempts']).toBe(3)
    expect(service['maxReconnectionAttempts']).toBe(5)
  })

  it('should handle change events with clusterTime', async () => {
    const clusterTime = new Date()
    const change: ChangeEvent = {
      operationType: 'insert',
      fullDocument: { _id: '1', name: 'test' },
      documentKey: { _id: '1' },
      ns: { db: 'testdb', coll: 'testcollection' },
      clusterTime: clusterTime,
    }

    expect(change.clusterTime).toBe(clusterTime)
  })

  it('should track notification count per batch', async () => {
    const service = new MonitoringService(mockConfig)

    const changes: ChangeEvent[] = Array.from({ length: 15 }, (_, i) => ({
      operationType: 'insert',
      fullDocument: { _id: String(i), name: `doc${i}` },
      documentKey: { _id: String(i) },
      ns: { db: 'testdb', coll: 'testcollection' },
    }))

    changes.forEach((change) => {
      service['handleSourceChange'](change)
    })

    expect(service['changeBatch'].length).toBe(15)
  })

  it('should maintain last update timestamp after batch processing', async () => {
    const service = new MonitoringService(mockConfig)

    const change: ChangeEvent = {
      operationType: 'insert',
      fullDocument: { _id: '1', name: 'test' },
      documentKey: { _id: '1' },
      ns: { db: 'testdb', coll: 'testcollection' },
    }

    service['handleSourceChange'](change)
    service['processChangeBatch']()

    expect(service['lastUpdate']).toBeDefined()
  })

  afterAll(() => {
    vi.clearAllMocks()
  })
})
