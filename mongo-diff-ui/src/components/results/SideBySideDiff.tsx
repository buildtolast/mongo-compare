import { useState, useCallback } from 'react'
import { Tabs, TabList, Tab, TabPanel } from '@/components/common/Tabs'
import { Button } from '@/components/common/Button'
import type { ChangedField, DocumentDiff } from '@/types'

export interface ComparisonResult {
  timestamp: string
  sourceInstance: string
  targetInstance: string
  sourceDatabase: string
  targetDatabase: string
  created: { count: number; samples: Record<string, unknown>[] }
  updated: { count: number; samples: DocumentDiff[] }
  deleted: { count: number; samples: Record<string, unknown>[] }
}

export interface SideBySideDiffProps {
  result?: ComparisonResult
  isLoading?: boolean
  error?: string
  onDocumentChange?: (index: number) => void
}

export function SideBySideDiff({
  result,
  isLoading = false,
  error,
  onDocumentChange,
}: SideBySideDiffProps) {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side')
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 10

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

  const handlePrevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1)
      onDocumentChange?.(currentPage - 1)
    }
  }, [currentPage, onDocumentChange])

  const handleNextPage = useCallback(() => {
    const totalPages = Math.ceil((result?.updated.count || 0) / itemsPerPage)
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1)
      onDocumentChange?.(currentPage + 1)
    }
  }, [currentPage, result?.updated.count, onDocumentChange])

  const getChangeColor = (type: 'added' | 'removed' | 'changed') => {
    switch (type) {
      case 'added':
        return 'text-emerald-400 bg-emerald-900/30'
      case 'removed':
        return 'text-rose-400 bg-rose-900/30'
      case 'changed':
        return 'text-amber-400 bg-amber-900/30'
      default:
        return 'text-slate-400'
    }
  }

  const renderFieldValue = (value: unknown) => {
    if (value === undefined || value === null) {
      return <span className="text-slate-500 italic">null</span>
    }
    
    if (typeof value === 'object') {
      return <pre className="text-xs text-slate-300 overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>
    }
    
    return <span className="font-mono text-sm">{String(value)}</span>
  }

  if (!result) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-8 text-center">
        <p className="text-slate-400">No comparison results available</p>
        <p className="text-sm text-slate-500 mt-1">
          Run a comparison to see side-by-side document differences
        </p>
      </div>
    )
  }

  const updatedDocs = result.updated.samples
  const totalPages = Math.ceil(updatedDocs.length / itemsPerPage)
  const paginatedDocs = updatedDocs.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-emerald-400">Document Differences</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-400">
            Showing {updatedDocs.length} of {result.updated.count} updated documents
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-900/20 p-4">
          <div className="flex items-center space-x-2 text-rose-400">
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

      <div className="space-y-4">
        {paginatedDocs.length === 0 ? (
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-8 text-center">
            <p className="text-slate-400">No updated documents found</p>
          </div>
        ) : (
          paginatedDocs.map((doc, index) => (
            <DocumentDiffView
              key={doc.identifier}
              document={doc}
              viewMode={viewMode}
              expandedFields={expandedFields}
              onToggleExpand={handleToggleExpand}
              renderFieldValue={renderFieldValue}
              getChangeColor={getChangeColor}
            />
          ))
        )}

        {paginatedDocs.length > 0 && (
          <div className="flex items-center justify-between space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 0}
            >
              ← Previous
            </Button>
            <span className="text-sm text-slate-400">
              Page {currentPage + 1} of {totalPages || 1}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
            >
              Next →
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultTab="side-by-side">
        <TabList>
          <Tab id="side-by-side">Side-by-Side</Tab>
          <Tab id="unified">Unified</Tab>
        </TabList>
        <TabPanel id="side-by-side">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
              <h3 className="text-sm font-medium text-slate-300 mb-2">Source</h3>
              <pre className="text-xs text-slate-400 overflow-x-auto">
                {JSON.stringify(result.created.samples[0] || {}, null, 2)}
              </pre>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
              <h3 className="text-sm font-medium text-slate-300 mb-2">Target</h3>
              <pre className="text-xs text-slate-400 overflow-x-auto">
                {JSON.stringify(result.created.samples[0] || {}, null, 2)}
              </pre>
            </div>
          </div>
        </TabPanel>
        <TabPanel id="unified">
          <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Unified View</h3>
            <pre className="text-xs text-slate-400 overflow-x-auto">
              {JSON.stringify(result.created.samples[0] || {}, null, 2)}
            </pre>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  )
}

interface DocumentDiffViewProps {
  document: DocumentDiff
  viewMode: 'side-by-side' | 'unified'
  expandedFields: Set<string>
  onToggleExpand: (path: string) => void
  renderFieldValue: (value: unknown) => React.ReactNode
  getChangeColor: (type: 'added' | 'removed' | 'changed') => string
}

function DocumentDiffView({
  document,
  viewMode,
  expandedFields,
  onToggleExpand,
  renderFieldValue,
  getChangeColor,
}: DocumentDiffViewProps) {
  const hasNestedFields = document.changes.some((change) => change.path.includes('.'))

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-emerald-900/50 px-3 py-1 text-sm font-medium text-emerald-400">
            ID: {document.identifier}
          </div>
        </div>
        <div className="text-sm text-slate-500">
          {document.changes.length} changes
        </div>
      </div>

      <div className="space-y-3">
        {document.changes.map((change) => (
          <div
            key={change.path}
            className="rounded-lg border border-slate-700 bg-slate-900/50 p-4"
          >
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                {hasNestedFields && (
                  <button
                    onClick={() => onToggleExpand(change.path)}
                    className="text-slate-400 hover:text-slate-200"
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
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-slate-300">{change.path}</span>
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${getChangeColor(change.type)}`}>
                    {change.type}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {change.oldValue !== undefined && (
                    <div className="space-y-1">
                      <span className="text-xs text-slate-500">Old Value</span>
                      <div className="rounded bg-rose-900/20 p-2">
                        {renderFieldValue(change.oldValue)}
                      </div>
                    </div>
                  )}
                  {change.newValue !== undefined && (
                    <div className="space-y-1">
                      <span className="text-xs text-slate-500">New Value</span>
                      <div className="rounded bg-emerald-900/20 p-2">
                        {renderFieldValue(change.newValue)}
                      </div>
                    </div>
                  )}
                </div>

                {hasNestedFields && expandedFields.has(change.path) && (
                  <div className="mt-2 pl-4 border-l-2 border-slate-700">
                    <p className="text-xs text-slate-400">
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
  )
}
