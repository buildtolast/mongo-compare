import { useState, useCallback } from 'react'
import { Tabs, TabList, Tab, TabPanel } from '@/components/common/Tabs'
import { Button } from '@/components/common/Button'
import { HtmlReportService } from '@/services/htmlReportService'
import { ExportService } from '@/services/exportService'
import type { ComparisonResult, DocumentDiff } from '@/types'

export interface SideBySideDiffProps {
  result?: ComparisonResult
  error?: string
  onDocumentChange?: (index: number) => void
}

export function SideBySideDiff({
  result,
  error,
  onDocumentChange,
}: SideBySideDiffProps) {
  const [viewMode] = useState<'side-by-side' | 'unified'>('side-by-side')
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
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

  const handleExportHTML = async () => {
    if (!result) return

    setIsExporting(true)
    try {
      const htmlService = new HtmlReportService()
      const { href } = htmlService.exportReport(result)

      const link = document.createElement('a')
      link.href = href
      link.download = href.split('/').pop() || 'mongo-diff-report.html'
      link.click()
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }

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

  const   renderFieldValue = (value: unknown, showContext = true) => {
    if (value === undefined || value === null) {
      return <span className="text-[var(--text-muted)] italic">null</span>
    }
    
    if (typeof value === 'object') {
      const jsonString = JSON.stringify(value, null, 2)
      const lines = jsonString.split('\n')
      const maxLines = showContext ? 8 : 100
      const truncated = lines.slice(0, maxLines).join('\n')
      const isTruncated = lines.length > maxLines
      
      return (
        <pre className="text-xs text-[var(--text-2)] overflow-x-auto">
          {truncated}
          {isTruncated && <span className="text-[var(--text-muted)]">...</span>}
        </pre>
      )
    }
    
    return <span className="font-mono text-sm">{String(value)}</span>
  }

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

  const updatedDocs = result.updated.samples
  const totalPages = Math.ceil(updatedDocs.length / itemsPerPage)
  const paginatedDocs = updatedDocs.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  )

  return (
    <div className="space-y-6">
   <div className="flex items-center justify-between">
         <div className="flex items-center space-x-2">
           <Button
             variant="secondary"
             size="sm"
             isLoading={isExporting}
             onClick={handleExportHTML}
           >
             Export HTML Report
           </Button>
         </div>
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

interface DocumentDiffViewProps {
   document: DocumentDiff
   viewMode: 'side-by-side' | 'unified'
   expandedFields: Set<string>
   onToggleExpand: (path: string) => void
   renderFieldValue: (value: unknown, showContext?: boolean) => React.ReactNode
   getChangeColor: (type: 'added' | 'removed' | 'changed') => string
 }

function DocumentDiffView({
  document,
  expandedFields,
  onToggleExpand,
  renderFieldValue,
  getChangeColor,
}: DocumentDiffViewProps) {
  const hasNestedFields = document.changes.some((change) => change.path.includes('.'))

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-[var(--add-bg)] px-3 py-1 text-sm font-medium text-[var(--accent)]">
            ID: {document.identifier}
          </div>
        </div>
        <div className="text-sm text-[var(--text-muted)]">
          {document.changes.length} changes
        </div>
      </div>

      <div className="space-y-3">
        {document.changes.map((change) => (
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
                  <span className="text-sm font-medium text-[var(--text-2)]">{change.path}</span>
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${getChangeColor(change.type)}`}>
                    {change.type}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {change.old_value !== undefined && (
                     <div className="space-y-1">
                       <span className="text-xs text-[var(--text-muted)]">Old Value</span>
                       <div className="rounded bg-[var(--danger-bg)] p-2 max-h-32 overflow-y-auto">
                         {renderFieldValue(change.old_value)}
                       </div>
                     </div>
                   )}
                   {change.new_value !== undefined && (
                     <div className="space-y-1">
                       <span className="text-xs text-[var(--text-muted)]">New Value</span>
                       <div className="rounded bg-[var(--add-bg)] p-2 max-h-32 overflow-y-auto">
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
  )
}
