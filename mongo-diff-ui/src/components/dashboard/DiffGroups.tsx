import { useState } from 'react'
import type { DocumentDiff } from '@/types/comparison'

interface DiffItem {
  identifier: string
  _id?: any
  name?: string
  age?: number
  email?: string
  status?: string | null
  tags?: any[]
  metadata?: any
  notes?: string | null
  empty_field?: string | null
  nested?: any
  [key: string]: any
}

interface DiffGroupsProps {
  deleted: number
  updated: number
  added: number
  deletedItems: Record<string, unknown>[]
  updatedItems: DocumentDiff[]
  addedItems: Record<string, unknown>[]
  onToggle: (item: Record<string, unknown>) => void
  onExpand: () => void
}

export function DiffGroups({
  deleted,
  updated,
  added,
  deletedItems,
  updatedItems,
  addedItems,
  onToggle,
  onExpand,
}: DiffGroupsProps) {
  const [expanded, setExpanded] = useState(false)

  const toggleExpand = () => {
    setExpanded(!expanded)
    onExpand()
  }

  const renderDeletedItems = () => (
    <div className="diff-item deleted" onClick={() => onToggle(deletedItems[0])}>
      <div className="diff-item-header">
        <span className="diff-icon deleted">🔴</span>
        <span className="diff-id">{String(deletedItems[0]._id || deletedItems[0].identifier)}</span>
        <span className="diff-info">
          <span>name: {String(deletedItems[0].name || '')}</span>
          <span>age: {deletedItems[0].age !== undefined ? String(deletedItems[0].age) : ''}</span>
          <span>email: {String(deletedItems[0].email || '')}</span>
        </span>
      </div>
    </div>
  )

  const renderUpdatedItems = () => (
    <>
      {updatedItems.map((item) => (
   <div key={String(item.identifier)} className="diff-item updated">
   <div className="diff-item-header">
            <span className="diff-icon added">🟢</span>
            <span className="diff-id">{item.identifier}</span>
            <span className="diff-info">
              <span>name: {String(item.changed_fields[0]?.old_value || '')} → {String(item.changed_fields[0]?.new_value || '')}</span>
              <span>age: {String(item.changed_fields[1]?.old_value || '')} → {String(item.changed_fields[1]?.new_value || '')}</span>
              <span>email: {String(item.changed_fields[2]?.old_value || '')} → {String(item.changed_fields[2]?.new_value || '')}</span>
            </span>
          </div>
          <div className="diff-details">
            {item.changed_fields.map((field) => (
              <div key={field.field_name} className="field-diff">
                <span className="field-old">{field.old_value}</span>
                <span className="field-arrow">→</span>
                <span className="field-new">{field.new_value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  )

  const renderAddedItems = () => (
    <>
      {addedItems.map((item) => (
  <div key={String(item.identifier)} className="diff-item added">
            <div className="diff-item-header">
              <span className="diff-icon added">🟢</span>
        <span className="diff-id">{String(item.identifier)}</span>
              <span className="diff-info">
                <span>name: {String(item.name || '')}</span>
                <span>age: {item.age !== undefined ? String(item.age) : ''}</span>
                <span>email: {String(item.email || '')}</span>
              </span>
            </div>
          </div>
      ))}
    </>
  )

  return (
    <div className="diff-section">
      <div className="diff-section-header">
        <h3 className="diff-section-title">
          {deleted > 0 && 'DELETED '}({deleted}) {updated > 0 && 'UPDATED '}({updated}) {added > 0 && 'ADDED '}({added})
        </h3>
        <button className="expand-btn" onClick={toggleExpand}>
          {expanded ? 'Collapse All ▲' : 'Expand All ▼'}
        </button>
      </div>

      <div>
        {deleted > 0 && renderDeletedItems()}
        {updated > 0 && renderUpdatedItems()}
        {added > 0 && renderAddedItems()}
        {added === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '12px' }}>
            No new documents added
          </p>
        )}
      </div>
    </div>
  )
}