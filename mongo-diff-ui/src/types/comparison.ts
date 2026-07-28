import type { DocumentDiff } from './document.js'

export interface ComparisonResult {
  timestamp: string
  sourceInstance: string
  targetInstance: string
  sourceDatabase: string
  targetDatabase: string
  created: { count: number; samples: Record<string, unknown>[] }
  updated: { count: number; samples: DocumentDiff[] }
  deleted: { count: number; samples: Record<string, unknown>[] }
}
