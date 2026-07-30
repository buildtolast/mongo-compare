import type { ChangedField } from './diff.js'

export interface DocumentDiff {
  identifier: string
  changed_fields: ChangedField[]
}