import type { ChangedField } from './diff.js'

export interface DocumentDiff {
  identifier: string
  changes: ChangedField[]
}
