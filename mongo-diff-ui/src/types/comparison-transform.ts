import type { ChangedField as RustChangedField } from '@/types/rust-comparison'

export interface ChangedField {
  path: string
  oldValue: unknown
  newValue: unknown
  type: 'added' | 'removed' | 'changed'
}

export interface DocumentDiff {
  identifier: string
  changes: ChangedField[]
}

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

export function transformRustComparison(rustResult: { source_database?: string; target_database?: string; created_count?: number; sample_created?: Record<string, unknown>[]; updated_count?: number; sample_updated?: { identifier?: string; changed_fields?: { field_name: string; old_value: string; new_value: string }[] }[]; deleted_count?: number; sample_deleted?: Record<string, unknown>[] }): ComparisonResult {
  const now = new Date().toISOString()
  
  return {
    timestamp: now,
    sourceInstance: 'localhost:3001',
    targetInstance: 'localhost:3001',
    sourceDatabase: rustResult.source_database || 'source',
    targetDatabase: rustResult.target_database || 'target',
    created: {
      count: rustResult.created_count || 0,
      samples: rustResult.sample_created || []
    },
    updated: {
      count: rustResult.updated_count || 0,
      samples: transformUpdatedDocuments(rustResult.sample_updated || [])
    },
    deleted: {
      count: rustResult.deleted_count || 0,
      samples: rustResult.sample_deleted || []
    }
  }
}

function transformUpdatedDocuments(sampleUpdated: { identifier?: string; changed_fields?: { field_name: string; old_value: string; new_value: string }[] }[]): DocumentDiff[] {
  return sampleUpdated.map((doc) => ({
    identifier: doc.identifier || '',
    changes: doc.changed_fields?.map((field) => ({
      path: field.field_name,
      oldValue: field.old_value,
      newValue: field.new_value,
      type: field.old_value === null ? 'added' : field.new_value === null ? 'removed' : 'changed'
    })) || []
  }))
}
