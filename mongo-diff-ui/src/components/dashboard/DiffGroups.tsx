import { useState } from 'react'
import type { DocumentDiff } from '@/types/document'

interface DiffGroupsProps {
  deleted: number
  updated: number
  added: number
  deletedItems: Record<string, unknown>[]
  updatedItems: DocumentDiff[]
  addedItems: Record<string, unknown>[]
}

export function DiffGroups({
  deleted,
  updated,
  added,
  deletedItems,
  updatedItems,
  addedItems,
}: DiffGroupsProps) {
  const [expanded, setExpanded] = useState(false)

  const toggleExpand = () => {
    setExpanded(!expanded)
  }

  const renderDeletedItems = () => (
    <>
      {deletedItems.map((item) => (
        <div
          key={String(item._id || item.identifier)}
          className="diff-item deleted"
        >
          <div className="diff-item-header">
            <span className="diff-icon deleted">🔴</span>
            <span className="diff-id">{String(item._id || item.identifier)}</span>
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

const renderUpdatedItems = () => (
    <>
      {updatedItems.map((item) => (
    <div key={String(item.identifier)} className="diff-item updated">
    <div className="diff-item-header">
             <span className="diff-icon added">🟢</span>
             <span className="diff-id">{item.identifier}</span>
             <span className="diff-info">
               <span>{item.changes.length} field{item.changes.length === 1 ? '' : 's'} changed</span>
             </span>
           </div>
           <div className="diff-details">
             {item.changes.map((field) => (
               <div key={field.path} className="field-diff">
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
        <div key={String(item._id || item.identifier)} className="diff-item added">
          <div className="diff-item-header">
            <span className="diff-icon added">🟢</span>
            <span className="diff-id">{String(item._id || item.identifier)}</span>
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