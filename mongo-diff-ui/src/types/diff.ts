export interface ChangeField {
  path: string
  old_value: string | undefined | null
  new_value: string | undefined | null
  type: 'added' | 'removed' | 'changed'
}