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

export function transformRustComparison(rustResult: any): ComparisonResult {
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

function transformUpdatedDocuments(sampleUpdated: any[]): DocumentDiff[] {
  return sampleUpdated.map((doc: any) => ({
    identifier: doc.identifier || '',
    changes: doc.changed_fields?.map((field: RustChangedField) => ({
      path: field.field_name || '',
      oldValue: field.old_value,
      newValue: field.new_value,
      type: field.old_value === null ? 'added' : field.new_value === null ? 'removed' : 'changed'
    })) || []
  }))
}
