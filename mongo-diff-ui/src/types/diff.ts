export interface ChangedField {
  path: string
  oldValue: unknown
  newValue: unknown
  type: 'added' | 'removed' | 'changed'
}
