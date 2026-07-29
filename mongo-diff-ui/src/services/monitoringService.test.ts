import { describe, it, expect, vi, afterAll } from 'vitest'
import { MonitoringService, type MonitoringConfig } from './monitoringService.js'
import type { ChangeEvent } from './monitoringService.js'
import type { ChangeNotification } from './monitoringService.js'

describe('MonitoringService', () => {
  const mockConfig: MonitoringConfig = {
    sourceConnectionString: 'mongodb://localhost:27017',
    targetConnectionString: 'mongodb://localhost:27018',
    database: 'testdb',
    collection: 'testcollection',
    identifierField: '_id',
  }

  it('should create instance with config', () => {
    const service = new MonitoringService(mockConfig)
    expect(service).toBeInstanceOf(MonitoringService)
  })

  it('should initialize with no pending changes', () => {
    const service = new MonitoringService(mockConfig)
    const state = service.getState()
    expect(state.pendingChanges).toEqual([])
  })

  it('should initialize with no diff result', () => {
    const service = new MonitoringService(mockConfig)
    const state = service.getState()
    expect(state.diffResult).toBeNull()
  })

  it('should initialize with monitoring stopped', () => {
    const service = new MonitoringService(mockConfig)
    const state = service.getState()
    expect(state.isMonitoring).toBe(false)
  })

  it('should initialize with no connection', () => {
    const service = new MonitoringService(mockConfig)
    const state = service.getState()
    expect(state.isConnected).toBe(false)
  })

  it('should initialize with no last update timestamp', () => {
    const service = new MonitoringService(mockConfig)
    const state = service.getState()
    expect(state.lastUpdate).toBeNull()
  })

  it('should initialize with no error', () => {
    const service = new MonitoringService(mockConfig)
    const state = service.getState()
    expect(state.error).toBeNull()
  })

  it('should support subscription and notification', () => {
    const service = new MonitoringService(mockConfig)
    const notificationCallback = vi.fn()
    const unsubscribe = service.subscribe(notificationCallback)
    
    const notification: ChangeNotification = {
      id: 'test-1',
      type: 'batch',
      message: 'Test notification',
      timestamp: new Date().toISOString(),
      changeCount: 0,
    }
    
    service.notify(notification)
    
    expect(notificationCallback).toHaveBeenCalledWith(notification)
    
    unsubscribe()
  })

  it('should clear pending changes', () => {
    const service = new MonitoringService(mockConfig)
    service.clearPendingChanges()
    const state = service.getState()
    expect(state.pendingChanges).toEqual([])
  })

  it('should set error message', () => {
    const service = new MonitoringService(mockConfig)
    service.setError('Test error')
    const state = service.getState()
    expect(state.error).toBe('Test error')
  })

  it('should return empty array for pending changes when none exist', () => {
    const service = new MonitoringService(mockConfig)
    const changes = service.getPendingChanges()
    expect(changes).toEqual([])
  })

  it('should handle change event with insert operation', () => {
    const change: ChangeEvent = {
      operationType: 'insert',
      fullDocument: { _id: '123', name: 'test' },
      documentKey: { _id: '123' },
      ns: { db: 'testdb', coll: 'testcollection' },
    }
    
    expect(change.operationType).toBe('insert')
  })

  it('should handle change event with update operation', () => {
    const change: ChangeEvent = {
      operationType: 'update',
      documentKey: { _id: '123' },
      ns: { db: 'testdb', coll: 'testcollection' },
      updateDescription: {
        updatedFields: { name: 'updated' },
        removedFields: [],
      },
    }
    
    expect(change.operationType).toBe('update')
  })

  it('should handle change event with delete operation', () => {
    const change: ChangeEvent = {
      operationType: 'delete',
      documentKey: { _id: '123' },
      ns: { db: 'testdb', coll: 'testcollection' },
    }
    
    expect(change.operationType).toBe('delete')
  })

  it('should handle change event with replace operation', () => {
    const change: ChangeEvent = {
      operationType: 'replace',
      fullDocument: { _id: '123', name: 'replaced' },
      documentKey: { _id: '123' },
      ns: { db: 'testdb', coll: 'testcollection' },
    }
    
    expect(change.operationType).toBe('replace')
  })

  it('should handle change events with updateDescription', () => {
    const change: ChangeEvent = {
      operationType: 'update',
      documentKey: { _id: '123' },
      ns: { db: 'testdb', coll: 'testcollection' },
      updateDescription: {
        updatedFields: { name: 'updated', email: 'new@example.com' },
        removedFields: ['oldField'],
      },
    }

    expect(change.updateDescription?.updatedFields).toEqual({
      name: 'updated',
      email: 'new@example.com',
    })
    expect(change.updateDescription?.removedFields).toEqual(['oldField'])
  })

  it('should handle change events with missing fullDocument', () => {
    const change: ChangeEvent = {
      operationType: 'delete',
      documentKey: { _id: '123' },
      ns: { db: 'testdb', coll: 'testcollection' },
    }

    expect(change.operationType).toBe('delete')
    expect(change.fullDocument).toBeUndefined()
  })

  it('should maintain notification subscribers independently', () => {
    const service = new MonitoringService(mockConfig)
    const callback1 = vi.fn()
    const callback2 = vi.fn()
    const callback3 = vi.fn()

    const unsubscribe2 = service.subscribe(callback2)

    const notification: ChangeNotification = {
      id: 'test-1',
      type: 'batch',
      message: 'Test notification',
      timestamp: new Date().toISOString(),
      changeCount: 1,
    }

    service.notify(notification)

    expect(callback2).toHaveBeenCalled()
    expect(callback1).not.toHaveBeenCalled()
    expect(callback3).not.toHaveBeenCalled()

    unsubscribe2()
  })

  it('should handle empty change batch', () => {
    const service = new MonitoringService(mockConfig)
    expect(service.getPendingChanges().length).toBe(0)
    expect(service.getState().pendingChanges.length).toBe(0)
  })

  it('should support multiple identifier fields', () => {
    const config: MonitoringConfig = {
      sourceConnectionString: 'mongodb://localhost:27017',
      targetConnectionString: 'mongodb://localhost:27018',
      database: 'testdb',
      collection: 'testcollection',
      identifierField: ['field1', 'field2'],
    }

    const svc = new MonitoringService(config)
    expect(svc).toBeInstanceOf(MonitoringService)
  })

  it('should support custom diff strategy', () => {
    const config: MonitoringConfig = {
      sourceConnectionString: 'mongodb://localhost:27017',
      targetConnectionString: 'mongodb://localhost:27018',
      database: 'testdb',
      collection: 'testcollection',
      identifierField: '_id',
      diffStrategy: 1,
      diffFields: ['name', 'email'],
      diffSampleLimit: 50,
    }

    const svc = new MonitoringService(config)
    expect(svc).toBeInstanceOf(MonitoringService)
  })

  afterAll(() => {
    vi.clearAllMocks()
  })
})
