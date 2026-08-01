import { useState, useCallback, useMemo } from 'react'
import { Tabs, TabList, Tab, TabPanel } from '@/components/common/Tabs'
import type { DocumentDiff } from '@/types/document.js'

export interface ComparisonResult {
  timestamp: string
  source_instance: string
  target_instance: string
  source_database: string
  target_database: string
  total_before: number
  total_after: number
  created: { count: number; samples: unknown[] }
  updated: { count: number; samples: DocumentDiff[] }
  deleted: { count: number; samples: unknown[] }
}

export interface VirtualizedDiffListProps {
  result?: ComparisonResult
  error?: string
}

export function VirtualizedDiffList({
  result,
  error,
}: VirtualizedDiffListProps) {
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set())
  const [visibleStart, setVisibleStart] = useState(0)
  const [visibleEnd, setVisibleEnd] = useState(10)
  const _itemsPerPage = 10
  const rowHeight = 350
  const containerHeight = 600

  const handleToggleExpand = useCallback((path: string) => {
    setExpandedFields((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }, [])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget
    const startIndex = Math.floor(scrollTop / rowHeight)
    const endIndex = Math.min(startIndex + Math.ceil(containerHeight / rowHeight) + 1, result?.updated.samples.length || 0)
    
    if (startIndex !== visibleStart || endIndex !== visibleEnd) {
      setVisibleStart(startIndex)
      setVisibleEnd(endIndex)
    }
  }, [result?.updated.samples.length, visibleStart, visibleEnd])

  const getChangeColor = (type: 'added' | 'removed' | 'changed') => {
    switch (type) {
      case 'added':
        return 'text-[var(--accent)] bg-[var(--add-bg)]'
      case 'removed':
        return 'text-[var(--danger)] bg-[var(--danger-bg)]'
      case 'changed':
        return 'text-[var(--warn)] bg-[var(--warn-bg)]'
      default:
        return 'text-[var(--text-muted)]'
    }
  }

  const renderFieldValue = (value: unknown) => {
    if (value === undefined || value === null) {
      return <span className="text-[var(--text-muted)] italic">null</span>
    }
    
    if (typeof value === 'object') {
      return <pre className="text-xs text-[var(--text-2)] overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>
    }
    
    return <span className="font-mono text-sm">{String(value)}</span>
  }

  const DocumentDiffRow = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const doc = result?.updated.samples[index]
    if (!doc) return null

    const hasNestedFields = doc.changes.some((change) => change.path.includes('.'))

    return (
      <div style={style} className="p-1">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-[var(--add-bg)] px-3 py-1 text-sm font-medium text-[var(--accent)]">
                ID: {doc.identifier}
              </div>
            </div>
            <div className="text-sm text-[var(--text-muted)]">
              {doc.changes.length} changes
            </div>
          </div>

          <div className="space-y-2">
            {doc.changes.map((change, changeIndex) => (
              <div
                key={`${doc.identifier}-${changeIndex}`}
                className="rounded-lg border border-[var(--border)] bg-[var(--panel-2)] p-3"
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {hasNestedFields && (
                      <button
                        onClick={() => handleToggleExpand(change.path)}
                        className="text-[var(--text-muted)] hover:text-[var(--text-2)]"
                      >
                        <svg
                          className={`h-4 w-4 transition-transform ${
                            expandedFields.has(change.path) ? 'rotate-90' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-[var(--text-2)]">{change.path}</span>
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${getChangeColor(change.type)}`}>
                        {change.type}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {change.old_value !== undefined && (
                        <div className="space-y-1">
                          <span className="text-xs text-[var(--text-muted)]">Old Value</span>
                          <div className="rounded bg-[var(--danger-bg)] p-2">
                            {renderFieldValue(change.old_value)}
                          </div>
                        </div>
                      )}
                      {change.new_value !== undefined && (
                        <div className="space-y-1">
                          <span className="text-xs text-[var(--text-muted)]">New Value</span>
                          <div className="rounded bg-[var(--add-bg)] p-2">
                            {renderFieldValue(change.new_value)}
                          </div>
                        </div>
                      )}
                    </div>

                    {hasNestedFields && expandedFields.has(change.path) && (
                      <div className="mt-2 pl-4 border-l-2 border-[var(--border)]">
                        <p className="text-xs text-[var(--text-muted)]">
                          Nested field content expanded
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
   )
   }, [result, expandedFields, handleToggleExpand])

const updatedDocs = useMemo(() => result?.updated.samples || [], [result])
   const virtualizedDocs = useMemo(() => {
     return updatedDocs.slice(visibleStart, visibleEnd)
   }, [updatedDocs, visibleStart, visibleEnd])

    if (!result) {
     return (
       <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-8 text-center">
         <p className="text-[var(--text-muted)]">No comparison results available</p>
         <p className="text-sm text-[var(--text-muted)] mt-1">
           Run a comparison to see side-by-side document differences
         </p>
       </div>
     )
   }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[var(--accent)]">Document Differences</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-[var(--text-muted)]">
            Showing {updatedDocs.length} of {result.updated.count} updated documents
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-[var(--danger)] bg-[var(--danger-bg)] p-4">
          <div className="flex items-center space-x-2 text-[var(--danger)]">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {updatedDocs.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-8 text-center">
          <p className="text-[var(--text-muted)]">No updated documents found</p>
        </div>
      ) : (
        <div 
          className="h-[600px] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--panel)]"
          onScroll={handleScroll}
        >
          <div style={{ height: `${updatedDocs.length * rowHeight}px` }}>
            {virtualizedDocs.map((doc, index) => (
              <DocumentDiffRow 
                key={doc.identifier} 
                index={visibleStart + index} 
                style={{ position: 'absolute', top: (visibleStart + index) * rowHeight, left: 0, right: 0 }}
              />
            ))}
          </div>
        </div>
      )}

      <Tabs defaultTab="side-by-side">
        <TabList>
          <Tab id="side-by-side">Side-by-Side</Tab>
          <Tab id="unified">Unified</Tab>
        </TabList>
        <TabPanel id="side-by-side">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4">
              <h3 className="text-sm font-medium text-[var(--text-2)] mb-2">Source</h3>
              <pre className="text-xs text-[var(--text-muted)] overflow-x-auto">
                {JSON.stringify(result.created.samples[0] || {}, null, 2)}
              </pre>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4">
              <h3 className="text-sm font-medium text-[var(--text-2)] mb-2">Target</h3>
              <pre className="text-xs text-[var(--text-muted)] overflow-x-auto">
                {JSON.stringify(result.created.samples[0] || {}, null, 2)}
              </pre>
            </div>
          </div>
        </TabPanel>
        <TabPanel id="unified">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4">
            <h3 className="text-sm font-medium text-[var(--text-2)] mb-2">Unified View</h3>
            <pre className="text-xs text-[var(--text-muted)] overflow-x-auto">
              {JSON.stringify(result.created.samples[0] || {}, null, 2)}
            </pre>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  )
}

export default VirtualizedDiffList
