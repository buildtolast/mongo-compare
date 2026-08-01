import type { DocumentDiff } from './document.js'

export interface ComparisonResult {
  timestamp: string
  source_instance: string
  target_instance: string
  source_database: string
  target_database: string
  total_before: number
  total_after: number
  created: CreatedDiff
  updated: UpdatedDiff
  deleted: DeletedDiff
}

export interface CreatedDiff {
  count: number
  samples: Record<string, unknown>[]
}

export interface UpdatedDiff {
  count: number
  samples: DocumentDiff[]
}

export interface DeletedDiff {
  count: number
  samples: Record<string, unknown>[]
}

export interface ChangeField {
  path: string
  old_value: string | undefined
  new_value: string | undefined
  type: 'added' | 'removed' | 'changed'
}

export type { DocumentDiff } from './document.js'