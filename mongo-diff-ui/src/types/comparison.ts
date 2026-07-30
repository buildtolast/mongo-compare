import type { DocumentDiff } from './document.js'

export interface ComparisonResult {
  started_at: string
  finished_at: string
  collection_before: string
  collection_after: string
  total_before: number
  total_after: number
  created_count: number
  updated_count: number
  deleted_count: number
  sample_created: Record<string, unknown>[]
  sample_updated: DocumentDiff[]
  sample_deleted: Record<string, unknown>[]
}

export interface ChangedField {
  field_name: string
  old_value: string
  new_value: string
}

export interface DocumentDiff {
  identifier: string
  changed_fields: ChangedField[]
}