import { useState, useCallback } from 'react'
import { Button } from '@/components/common/Button'
import type { ComparisonResult, DocumentDiff } from '@/types'

export interface ColorDiffProps {
  result?: ComparisonResult
  error?: string
}

const COLOR_SCHEME = {
  added: {
    bg: '#d1fae5',
    text: '#065f46',
    lightBg: 'bg-[var(--add-bg)]',
    lightText: 'text-[var(--accent)]',
  },
  removed: {
    bg: '#fee2e2',
    text: '#991b1b',
    lightBg: 'bg-[var(--danger-bg)]',
    lightText: 'text-[var(--danger)]',
  },
  changed: {
    bg: '#fef3c7',
    text: '#92400e',
    lightBg: 'bg-[var(--warn-bg)]',
    lightText: 'text-[var(--warn)]',
  },
}

export function ColorDiff({
  result,
  error,
}: ColorDiffProps) {
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(0)
  const [copiedField, setCopiedField] = useState<string | null>(null)
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
    }
  }, [currentPage])

  const handleNextPage = useCallback(() => {
    const totalPages = Math.ceil((result?.updated.count || 0) / itemsPerPage)
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1)
    }
  }, [currentPage, result?.updated.count])

  const handleCopyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(text)
      setTimeout(() => setCopiedField(null), 2000)
    })
  }, [])

 const handleExportDocument = useCallback((docDiff: DocumentDiff) => {
    const exportData = {
      identifier: docDiff.identifier,
      changes: docDiff.changes.map((change) => ({
        path: change.path,
        old_value: change.old_value,
        new_value: change.new_value,
        type: change.type,
      })),
      exportedAt: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `document-${docDiff.identifier}-diff.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  const getChangeColor = (type: string) => {
    const colors = COLOR_SCHEME[type as 'added' | 'removed' | 'changed']
    return {
      bg: colors.bg,
      text: colors.text,
      lightBg: colors.lightBg,
      lightText: colors.lightText,
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

  if (!result) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-8 text-center">
        <p className="text-[var(--text-muted)]">No comparison results available</p>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Run a comparison to see color-coded document differences
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

      <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
        <h3 className="text-sm font-medium text-[var(--text-2)] mb-3">Legend:</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div
              className="h-4 w-4 rounded"
              style={{ backgroundColor: COLOR_SCHEME.added.bg }}
            />
            <span className="text-sm text-[var(--text-2)]">Added</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className="h-4 w-4 rounded"
              style={{ backgroundColor: COLOR_SCHEME.removed.bg }}
            />
            <span className="text-sm text-[var(--text-2)]">Removed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className="h-4 w-4 rounded"
              style={{ backgroundColor: COLOR_SCHEME.changed.bg }}
            />
            <span className="text-sm text-[var(--text-2)]">Changed</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {paginatedDocs.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-8 text-center">
            <p className="text-[var(--text-muted)]">No updated documents found</p>
          </div>
        ) : (
          paginatedDocs.map((doc) => (
            <DocumentDiffView
              key={doc.identifier}
              document={doc}
              expandedFields={expandedFields}
              onToggleExpand={handleToggleExpand}
              renderFieldValue={renderFieldValue}
              getChangeColor={getChangeColor}
              onCopyToClipboard={handleCopyToClipboard}
              copiedField={copiedField}
              onExport={handleExportDocument}
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
            <span className="text-sm text-[var(--text-muted)]">
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
    </div>
  )
}

interface DocumentDiffViewProps {
  document: DocumentDiff
  expandedFields: Set<string>
  onToggleExpand: (path: string) => void
  renderFieldValue: (value: unknown) => React.ReactNode
  getChangeColor: (type: string) => {
    bg: string
    text: string
    lightBg: string
    lightText: string
  }
  onCopyToClipboard: (text: string) => void
  copiedField: string | null
  onExport: (document: DocumentDiff) => void
}

function DocumentDiffView({
  document,
  expandedFields,
  onToggleExpand,
  renderFieldValue,
  getChangeColor,
  onCopyToClipboard,
  copiedField,
  onExport,
}: DocumentDiffViewProps) {
  const hasNestedFields = document.changes.some((change) => change.path.includes('.'))

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className="rounded-lg px-3 py-1 text-sm font-medium"
            style={{
              backgroundColor: '#065f46',
              color: '#d1fae5',
            }}
          >
            ID: {document.identifier}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-[var(--text-muted)]">
            {document.changes.length} changes
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onExport(document)}
          >
            Export This Document
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {document.changes.map((change) => {
          const colors = getChangeColor(change.type)
          const isExpanded = expandedFields.has(change.path)
          const _copyText = `${change.path}: ${change.old_value !== undefined ? String(change.old_value) : 'null'} → ${change.new_value !== undefined ? String(change.new_value) : 'null'}`

          return (
            <div
              key={change.path}
              className="rounded-lg border border-[var(--border)] bg-[var(--panel-2)] p-4"
            >
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  {hasNestedFields && (
                    <button
                      onClick={() => onToggleExpand(change.path)}
                      className="text-[var(--text-muted)] hover:text-[var(--text-2)]"
                    >
                      <svg
                        className={`h-4 w-4 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-[var(--text-2)]">
                        {change.path}
                      </span>
                      <span
                        className="rounded px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: colors.bg,
                          color: colors.text,
                        }}
                      >
                        {change.type}
                      </span>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onCopyToClipboard(change.path)}
                      className="text-xs px-2 py-1"
                    >
                      {copiedField === change.path ? 'Copied!' : 'Copy to Clipboard'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {change.old_value !== undefined && (
                      <div className="space-y-1">
                        <span className="text-xs text-[var(--text-muted)]">Old Value</span>
                        <div
                          className="rounded p-2"
                          style={{
                            backgroundColor: colors.bg,
                          }}
                        >
                          {renderFieldValue(change.old_value)}
                        </div>
                      </div>
                    )}
                    {change.new_value !== undefined && (
                      <div className="space-y-1">
                        <span className="text-xs text-[var(--text-muted)]">New Value</span>
                        <div
                          className="rounded p-2"
                          style={{
                            backgroundColor: colors.bg,
                          }}
                        >
                          {renderFieldValue(change.new_value)}
                        </div>
                      </div>
                    )}
                  </div>

                  {hasNestedFields && isExpanded && (
                    <div className="mt-2 pl-4 border-l-2 border-[var(--border)]">
                      <p className="text-xs text-[var(--text-muted)]">
                        Nested field content expanded
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
