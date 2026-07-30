import type { ComparisonResult } from '@/types'
import { DiffEngine, DiffStrategy } from './diffEngine.js'
import type { MongoDBClient } from './mongoClient.js'

export interface ChangeEvent {
  operationType: 'insert' | 'update' | 'replace' | 'delete' | 'invalidate' | 'drop' | 'dropDatabase' | 'rename'
  fullDocument?: Record<string, unknown>
  documentKey: { _id: unknown }
  ns: { db: string; coll: string }
  updateDescription?: {
    updatedFields?: Record<string, unknown>
    removedFields?: string[]
  }
  clusterTime?: unknown
  txnNumber?: unknown
  lsid?: unknown
}

export interface MonitoringConfig {
  sourceConnectionString: string
  targetConnectionString: string
  database: string
  collection: string
  identifierField: string | string[]
  diffStrategy?: DiffStrategy
  diffFields?: string[]
  diffSampleLimit?: number
}

export interface MonitoringState {
  isMonitoring: boolean
  isConnected: boolean
  lastUpdate: string | null
  pendingChanges: ChangeEvent[]
  diffResult: ComparisonResult | null
  error: string | null
}

export interface ChangeNotification {
  id: string
  type: 'created' | 'updated' | 'deleted' | 'batch'
  message: string
  timestamp: string
  changeCount: number
}

export class MonitoringService {
  private sourceClient: MongoDBClient | null = null
  private targetClient: MongoDBClient | null = null
  private sourceDbName: string = ''
  private targetDbName: string = ''
  private sourceCollection: string = ''
  private targetCollection: string = ''
  private identifierField: string | string[] = '_id'
  private diffStrategy: DiffStrategy = DiffStrategy.All
  private diffFields: string[] = []
  private diffSampleLimit: number = 100

  private sourceStream: unknown = null
  private targetStream: unknown = null
  private sourceChangeListeners: Map<string, (change: ChangeEvent) => void> = new Map()
  private targetChangeListeners: Map<string, (change: ChangeEvent) => void> = new Map()
  
  private reconnectionAttempts: number = 0
  private maxReconnectionAttempts: number = 5
  private reconnectionDelay: number = 1000
  private reconnectionTimer: unknown = null

  private isMonitoring: boolean = false
  private isConnected: boolean = false
  private lastUpdate: string | null = null
  private pendingChanges: ChangeEvent[] = []
  private diffResult: ComparisonResult | null = null
  private error: string | null = null

  private notificationListeners: Map<string, (notification: ChangeNotification) => void> = new Map()
  private changeBatch: ChangeEvent[] = []
  private batchTimer: unknown = null
  private batchDelay: number = 500

  private diffEngine: DiffEngine = new DiffEngine()

  constructor(config: MonitoringConfig) {
    this.sourceDbName = config.database
    this.targetDbName = config.database
    this.sourceCollection = config.collection
    this.targetCollection = config.collection
    this.identifierField = config.identifierField
    this.diffStrategy = config.diffStrategy ?? DiffStrategy.All
    this.diffFields = config.diffFields ?? []
    this.diffSampleLimit = config.diffSampleLimit ?? 100
  }

  async connectSource(connectionString: string): Promise<void> {
    if (!this.sourceClient) {
      const { MongoDBClient } = await import('./mongoClient.js')
      this.sourceClient = new MongoDBClient()
    }

    try {
      await this.sourceClient.connect(connectionString, {})
      this.isConnected = true
      this.error = null
      this.reconnectionAttempts = 0
    } catch (error) {
      this.error = `Failed to connect to source: ${
        error instanceof Error ? error.message : String(error)
      }`
      throw error
    }
  }

  async connectTarget(connectionString: string): Promise<void> {
    if (!this.targetClient) {
      const { MongoDBClient } = await import('./mongoClient.js')
      this.targetClient = new MongoDBClient()
    }

    try {
      await this.targetClient.connect(connectionString, {})
      this.isConnected = true
      this.error = null
      this.reconnectionAttempts = 0
    } catch (error) {
      this.error = `Failed to connect to target: ${
        error instanceof Error ? error.message : String(error)
      }`
      throw error
    }
  }

  async startMonitoring(sourceConnectionString: string, targetConnectionString: string): Promise<void> {
    if (this.isMonitoring) {
      return
    }

    try {
      await this.connectSource(sourceConnectionString)
      await this.connectTarget(targetConnectionString)
      
      await this.startSourceChangeStream(sourceConnectionString)
      await this.startTargetChangeStream(targetConnectionString)
      
      this.isMonitoring = true
      this.error = null
      
      this.scheduleBatchProcessing()
      
      this.notify({
        id: 'monitoring-started',
        type: 'batch' as const,
        message: 'Real-time monitoring started',
        timestamp: new Date().toISOString(),
        changeCount: 0,
      })
    } catch (error) {
      this.error = `Failed to start monitoring: ${
        error instanceof Error ? error.message : String(error)
      }`
      this.notify({
        id: 'monitoring-error',
        type: 'batch' as const,
        message: `Monitoring failed: ${this.error}`,
        timestamp: new Date().toISOString(),
        changeCount: 0,
      })
      throw error
    }
  }

  async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) {
      return
    }

    await this.stopSourceChangeStream()
    await this.stopTargetChangeStream()
    
    this.isMonitoring = false
    this.pendingChanges = []
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer as unknown as number)
      this.batchTimer = null
    }
    
    this.notify({
      id: 'monitoring-stopped',
      type: 'batch' as const,
      message: 'Real-time monitoring stopped',
      timestamp: new Date().toISOString(),
      changeCount: 0,
    })
  }

  async startSourceChangeStream(connectionString: string): Promise<void> {
    if (!this.sourceClient || !this.sourceDbName || !this.sourceCollection) {
      throw new Error('Source client not initialized')
    }

    try {
      const db = await this.sourceClient.connect(connectionString, {})
      const collection = db.collection(this.sourceCollection)
      
      this.sourceStream = collection.watch([], {
        fullDocument: 'updateLookup',
      })

      const handleChange = (change: ChangeEvent) => {
        this.handleSourceChange(change)
      }

      ;(this.sourceStream as { on: (event: string, handler: (change: ChangeEvent) => void) => void }).on('change', handleChange)
      this.sourceChangeListeners.set('default', handleChange)

      ;(this.sourceStream as { on: (event: string, handler: (error: Error) => void) => void }).on('error', (error: Error) => {
        console.error('Source change stream error:', error)
        this.handleStreamError(error, 'source')
      })

      ;(this.sourceStream as { on: (event: string, handler: () => void) => void }).on('close', () => {
        this.handleStreamClose('source')
      })
    } catch (error) {
      this.error = `Failed to start source change stream: ${
        error instanceof Error ? error.message : String(error)
      }`
      throw error
    }
  }

  async startTargetChangeStream(connectionString: string): Promise<void> {
    if (!this.targetClient || !this.targetDbName || !this.targetCollection) {
      throw new Error('Target client not initialized')
    }

    try {
      const db = await this.targetClient.connect(connectionString, {})
      const collection = db.collection(this.targetCollection)
      
      this.targetStream = collection.watch([], {
        fullDocument: 'updateLookup',
      })

      const handleChange = (change: ChangeEvent) => {
        this.handleTargetChange(change)
      }

      ;(this.targetStream as { on: (event: string, handler: (change: ChangeEvent) => void) => void }).on('change', handleChange)
      this.targetChangeListeners.set('default', handleChange)

      ;(this.targetStream as { on: (event: string, handler: (error: Error) => void) => void }).on('error', (error: Error) => {
        console.error('Target change stream error:', error)
        this.handleStreamError(error, 'target')
      })

      ;(this.targetStream as { on: (event: string, handler: () => void) => void }).on('close', () => {
        this.handleStreamClose('target')
      })
    } catch (error) {
      this.error = `Failed to start target change stream: ${
        error instanceof Error ? error.message : String(error)
      }`
      throw error
    }
  }

 async stopSourceChangeStream(): Promise<void> {
    if (this.sourceStream) {
for (const [, listener] of this.sourceChangeListeners) {
         (this.sourceStream as { off: (event: string, handler: (change: ChangeEvent) => void) => void }).off('change', listener)
       }
      this.sourceChangeListeners.clear()
      
      try {
        await (this.sourceStream as { close: () => Promise<void> }).close()
      } catch {
        // ignore
      }
      
      this.sourceStream = null
    }
  }

async stopTargetChangeStream(): Promise<void> {
    if (this.targetStream) {
for (const [, listener] of this.targetChangeListeners) {
         (this.targetStream as { off: (event: string, handler: (change: ChangeEvent) => void) => void }).off('change', listener)
       }
      this.targetChangeListeners.clear()
      
      try {
        await (this.targetStream as { close: () => Promise<void> }).close()
      } catch {
        // ignore
      }
      
      this.targetStream = null
    }
  }

  private handleSourceChange(change: ChangeEvent): void {
    this.logChange('source', change)
    this.pendingChanges.push(change)
    this.changeBatch.push(change)
    
    if (this.isMonitoring && this.changeBatch.length >= 10) {
      this.processChangeBatch()
    }
  }

  private handleTargetChange(change: ChangeEvent): void {
    this.logChange('target', change)
    this.pendingChanges.push(change)
    this.changeBatch.push(change)
    
    if (this.isMonitoring && this.changeBatch.length >= 10) {
      this.processChangeBatch()
    }
  }

  private processChangeBatch(): void {
    if (this.changeBatch.length === 0) {
      return
    }

    const changes = this.changeBatch.splice(0, this.changeBatch.length)
    this.lastUpdate = new Date().toISOString()
    
    const changeTypes = new Set(changes.map((c) => c.operationType))
    
    this.notify({
      id: `batch-${Date.now()}`,
      type: 'batch' as const,
      message: `Detected ${changes.length} ${changeTypes.size > 1 ? 'mixed' : [...changeTypes][0]} changes`,
      timestamp: this.lastUpdate,
      changeCount: changes.length,
    })
    
    this.recomputeDiff()
  }

  private scheduleBatchProcessing(): void {
if (this.batchTimer) {
       clearTimeout(this.batchTimer as unknown as number)
     }
    
    this.batchTimer = setTimeout(() => {
      if (this.changeBatch.length > 0) {
        this.processChangeBatch()
      }
    }, this.batchDelay)
  }

  private logChange(stream: 'source' | 'target', change: ChangeEvent): void {
    console.log(`[${stream}] Change detected`, {
      operation: change.operationType,
      documentKey: change.documentKey,
      ns: change.ns,
      hasFullDocument: !!change.fullDocument,
    })
  }

  private async recomputeDiff(): Promise<void> {
    try {
      if (!this.sourceDbName || !this.targetDbName || !this.sourceCollection) {
        throw new Error('Clients not initialized')
      }

      const sourceClient = this.sourceClient
      const targetClient = this.targetClient

      if (!sourceClient || !targetClient) {
        throw new Error('Clients not connected')
      }

      const sourceDb = await sourceClient.connect('mongodb://localhost:27017', {})
      const targetDb = await targetClient.connect('mongodb://localhost:27018', {})

      const sourceCollection = sourceDb.collection(this.sourceCollection)
      const targetCollection = targetDb.collection(this.targetCollection)

      const sourceDocs = await sourceCollection.find({}).limit(this.diffSampleLimit).toArray()
      const targetDocs = await targetCollection.find({}).limit(this.diffSampleLimit).toArray()

      const result = this.diffEngine.compare(
        sourceDocs,
        targetDocs,
        this.identifierField,
        this.diffStrategy,
        this.diffFields,
        this.diffSampleLimit
      )

      this.diffResult = {
        ...result,
        timestamp: this.lastUpdate || result.timestamp,
      }
    } catch (error) {
      console.error('Failed to recompute diff:', error)
      this.error = `Diff recomputation failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    }
  }

  private handleStreamError(error: Error, stream: 'source' | 'target'): void {
    console.error(`[${stream}] Stream error:`, error)
    
    if (this.reconnectionAttempts < this.maxReconnectionAttempts) {
      this.reconnectionAttempts++
      
      this.reconnectionTimer = setTimeout(() => {
        this.reconnectStream(stream).catch((reconnectError) => {
          console.error(`[${stream}] Reconnection failed:`, reconnectError)
          this.handleStreamError(reconnectError, stream)
        })
      }, this.reconnectionDelay * Math.pow(2, this.reconnectionAttempts))
    } else {
      this.error = `Max reconnection attempts reached for ${stream} stream`
      this.notify({
        id: `${stream}-stream-error`,
        type: 'batch' as const,
        message: this.error,
        timestamp: new Date().toISOString(),
        changeCount: 0,
      })
    }
  }

  private handleStreamClose(stream: 'source' | 'target'): void {
    if (this.isMonitoring && this.reconnectionAttempts < this.maxReconnectionAttempts) {
      this.reconnectionAttempts++
      
      this.reconnectionTimer = setTimeout(() => {
        this.reconnectStream(stream).catch((error) => {
          console.error(`[${stream}] Reconnection failed:`, error)
        })
      }, this.reconnectionDelay * Math.pow(2, this.reconnectionAttempts))
    }
  }

  private async reconnectStream(stream: 'source' | 'target'): Promise<void> {
    if (stream === 'source') {
await this.stopSourceChangeStream()
       await this.startSourceChangeStream('mongodb://localhost:27017')
     } else {
       await this.stopTargetChangeStream()
       await this.startTargetChangeStream('mongodb://localhost:27018')
     }
     
     this.reconnectionAttempts = 0
   }

  notify(notification: ChangeNotification): void {
    for (const [, listener] of this.notificationListeners) {
      try {
        listener(notification)
      } catch (error) {
        console.error('Notification listener error:', error)
      }
    }
  }

  subscribe(listener: (notification: ChangeNotification) => void): () => void {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    this.notificationListeners.set(id, listener)
    return () => {
      this.notificationListeners.delete(id)
    }
  }

  getState(): MonitoringState {
    return {
      isMonitoring: this.isMonitoring,
      isConnected: this.isConnected,
      lastUpdate: this.lastUpdate,
      pendingChanges: this.pendingChanges,
      diffResult: this.diffResult,
      error: this.error,
    }
  }

  async disconnect(): Promise<void> {
    await this.stopMonitoring()
    
    if (this.sourceClient) {
      await this.sourceClient.closeAll()
      this.sourceClient = null
    }
    
    if (this.targetClient) {
      await this.targetClient.closeAll()
      this.targetClient = null
    }
    
    this.isConnected = false
  }

  getDiffResult(): ComparisonResult | null {
    return this.diffResult
  }

  getPendingChanges(): ChangeEvent[] {
    return this.pendingChanges
  }

  clearPendingChanges(): void {
    this.pendingChanges = []
  }

  setError(message: string): void {
    this.error = message
  }
}
