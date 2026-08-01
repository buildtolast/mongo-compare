import type { ChangeField } from './diff.js'

export interface DocumentDiff {
  identifier: string
  changes: ChangeField[]
}