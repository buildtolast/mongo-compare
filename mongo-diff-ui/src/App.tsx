import { useEffect, useState } from 'react'
import { ConnectionProvider, useConnection } from '@/contexts/ConnectionContext'
import { ConnectionForm } from '@/components/connection/ConnectionForm'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { DiffGroups } from '@/components/dashboard/DiffGroups'
import { SideBySideDiff } from '@/components/results/SideBySideDiff'
import type { ComparisonResult } from '@/types/comparison'
import { Button } from '@/components/common/Button'
import { ExportService } from '@/services/exportService'
import { HtmlReportService } from '@/services/htmlReportService'
import './App.css'

const exportService = new ExportService()
const htmlReportService = new HtmlReportService()

const THEME_STORAGE_KEY = 'mongo-compare-theme'

interface ThemeOption {
  id: string
  label: string
  swatch: string
}

const THEME_OPTIONS: ThemeOption[] = [
  { id: 'navy', label: 'Navy', swatch: '#10b981' },
  { id: 'slate', label: 'Slate mono', swatch: '#c9cdd6' },
  { id: 'light', label: 'Light editorial', swatch: '#1d9e75' },
  { id: 'mono', label: 'Terminal', swatch: '#2ee06a' },
  { id: 'warm', label: 'Warm amber', swatch: '#e08a3c' },
  { id: 'violet', label: 'Violet', swatch: '#a48ef0' },
]

const VALID_THEME_IDS = THEME_OPTIONS.map((option) => option.id)

function getInitialTheme(): string {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  return stored && VALID_THEME_IDS.includes(stored) ? stored : 'navy'
}

function downloadBlob(content: string, mimeType: string, filename: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function DashboardContent() {
  const { state, dispatch } = useConnection()
  const [result, setResult] = useState<ComparisonResult | null>(null)
  const [sourceIdentifierField] = useState('_id')
  const [sourceCollections, setSourceCollections] = useState<string[]>([])
  const [targetCollections, setTargetCollections] = useState<string[]>([])
  const [sourceDatabases, setSourceDatabases] = useState<string[]>([])
  const [targetDatabases, setTargetDatabases] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [comparisonError, setComparisonError] = useState<string | null>(null)
  const [theme, setTheme] = useState<string>(getInitialTheme)
  const [resultsView, setResultsView] = useState<'summary' | 'side-by-side'>('summary')
  const [sourceFilterInput, setSourceFilterInput] = useState('')
  const [targetFilterInput, setTargetFilterInput] = useState('')
  const [filterError, setFilterError] = useState<string | null>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const handleConnect = async (connectionType: 'source' | 'target') => {
    try {
      const connectionString = connectionType === 'source'
        ? state.source.connectionString
        : state.target.connectionString

      const response = await fetch('/api/get-databases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection_string: connectionString }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          dispatch({
            type: connectionType === 'source' ? 'SET_SOURCE_CONNECTED' : 'SET_TARGET_CONNECTED',
            payload: true,
          })

          if (connectionType === 'source') {
            setSourceDatabases(result.databases || [])
          } else {
            setTargetDatabases(result.databases || [])
          }

          const database = connectionType === 'source'
            ? state.source.database
            : state.target.database

          if (database) {
            const collectionsResponse = await fetch('/api/get-collections', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ connection_string: connectionString, database }),
            })

            if (collectionsResponse.ok) {
              const collectionsResult = await collectionsResponse.json()
              if (collectionsResult.success) {
                handleCollectionsChange(connectionType, collectionsResult.collections || [])
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(`Failed to connect ${connectionType}:`, error)
    }
  }

  const handleCollectionsChange = (
    connectionType: 'source' | 'target',
    collections: string[]
  ) => {
    if (connectionType === 'source') {
      setSourceCollections(collections)
    } else {
      setTargetCollections(collections)
    }
  }

  const handleRunComparison = async () => {
    setFilterError(null)

    let sourceFilter: unknown
    if (sourceFilterInput.trim()) {
      try {
        sourceFilter = JSON.parse(sourceFilterInput)
      } catch {
        setFilterError('Source filter is not valid JSON')
        return
      }
    }

    let targetFilter: unknown
    if (targetFilterInput.trim()) {
      try {
        targetFilter = JSON.parse(targetFilterInput)
      } catch {
        setFilterError('Target filter is not valid JSON')
        return
      }
    }

    setIsRunning(true)
    setComparisonError(null)
    try {
      const response = await fetch('/api/run-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_connection_string: state.source.connectionString,
          target_connection_string: state.target.connectionString,
          database: state.source.database,
          target_database: state.target.database,
          collections: sourceCollections.length > 0 ? sourceCollections : ['users'],
          identifier_field: sourceIdentifierField,
          sample_limit: 5,
          diff_strategy: 'all',
          ...(sourceFilter !== undefined ? { source_filter: sourceFilter } : {}),
          ...(targetFilter !== undefined ? { target_filter: targetFilter } : {}),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setResult(data.result)
        } else {
          setComparisonError(data.error || 'Comparison failed')
        }
      } else {
        setComparisonError(`Comparison failed: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('Comparison failed:', error)
      setComparisonError(error instanceof Error ? error.message : 'Comparison failed')
    } finally {
      setIsRunning(false)
    }
  }

  const handleReset = () => {
    dispatch({ type: 'RESET' })
    setResult(null)
    setSourceCollections([])
    setTargetCollections([])
    setSourceDatabases([])
    setTargetDatabases([])
    setSourceFilterInput('')
    setTargetFilterInput('')
    setFilterError(null)
    setResultsView('summary')
  }

  const handleExportCSV = () => {
    if (!result) return
    const csv = exportService.exportCSV(result)
    downloadBlob(csv, 'text/csv', exportService.getFilename('csv', result.timestamp))
  }

  const handleExportJSON = () => {
    if (!result) return
    const json = exportService.exportJSON(result)
    downloadBlob(json, 'application/json', exportService.getFilename('json', result.timestamp))
  }

  const handleExportHTML = () => {
    if (!result) return
    const html = htmlReportService.generateHTMLReport(result)
    downloadBlob(
      html,
      'text/html',
      `mongo-diff-report-${htmlReportService.formatTimestampForFilename(result.timestamp)}.html`
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container">
        <header>
          <h1>MongoDB Compare</h1>
          <p className="subtitle">Database Diff Tool</p>
          <div className="theme-switcher">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`theme-swatch${theme === option.id ? ' active' : ''}`}
                onClick={() => setTheme(option.id)}
                aria-pressed={theme === option.id}
              >
                <span className="theme-swatch-dot" style={{ background: option.swatch }} />
                {option.label}
              </button>
            ))}
          </div>
        </header>

        {/* Connection Panels */}
        {!result && (
          <div className="split-view">
            <div className="panel panel-source">
              <div className="panel-header">
                <h2 className="panel-title">SOURCE</h2>
                <span className="connection-status">
                  <div className={`status-dot ${state.sourceConnected ? 'connected' : ''}`} />
                  <span className="status-text">{state.sourceConnected ? 'Connected' : 'Disconnected'}</span>
                </span>
              </div>
              <div className="connection-string">
                {state.source.connectionString}
              </div>
              {sourceDatabases.length > 0 && (
                <div className="databases-section">
                  <p className="collections-title">Databases: {sourceDatabases.join(', ')}</p>
                </div>
              )}
              <div className="collections-section">
                <p className="collections-title">Collections:</p>
                {sourceCollections.length > 0 ? (
                  sourceCollections.map((collection) => (
                    <div key={collection} className="collection-item">
                      <span className="collection-name">{collection}</span>
                      <span className="collection-count">N/A</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">Select collections from target panel</p>
                )}
              </div>
              <Button
                variant={state.sourceConnected ? "success" : "primary"}
                size="sm"
                onClick={() => handleConnect('source')}
                disabled={state.sourceConnected}
              >
                {state.sourceConnected ? (
                  <>
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Connected
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Connect Source
                  </>
                )}
              </Button>
            </div>

            <div className="panel panel-target">
              <div className="panel-header">
                <h2 className="panel-title">TARGET</h2>
                <span className="connection-status">
                  <div className={`status-dot ${state.targetConnected ? 'connected' : ''}`} />
                  <span className="status-text">{state.targetConnected ? 'Connected' : 'Disconnected'}</span>
                </span>
              </div>
              <div className="connection-string">
                {state.target.connectionString}
              </div>
              {targetDatabases.length > 0 && (
                <div className="databases-section">
                  <p className="collections-title">Databases: {targetDatabases.join(', ')}</p>
                </div>
              )}
              <div className="collections-section">
                <p className="collections-title">Collections:</p>
                {targetCollections.length > 0 ? (
                  targetCollections.map((collection) => (
                    <div key={collection} className="collection-item">
                      <span className="collection-name">{collection}</span>
                      <span className="collection-count">N/A</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">Select collections from source panel</p>
                )}
              </div>
              <Button
                variant={state.targetConnected ? "success" : "primary"}
                size="sm"
                onClick={() => handleConnect('target')}
                disabled={state.targetConnected}
              >
                {state.targetConnected ? (
                  <>
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Connected
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Connect Target
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Connection Form */}
        <div className="connection-form-section">
          <ConnectionForm
            state={state}
            dispatch={dispatch}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
            <div>
              <label
                htmlFor="source-filter"
                className="block text-sm font-medium text-[var(--text-2)] mb-1"
              >
                Source Filter (optional)
              </label>
              <textarea
                id="source-filter"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--panel)] p-2 text-sm font-mono text-[var(--text)]"
                rows={2}
                placeholder='{"status": "active"}'
                value={sourceFilterInput}
                onChange={(e) => setSourceFilterInput(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="target-filter"
                className="block text-sm font-medium text-[var(--text-2)] mb-1"
              >
                Target Filter (optional)
              </label>
              <textarea
                id="target-filter"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--panel)] p-2 text-sm font-mono text-[var(--text)]"
                rows={2}
                placeholder='{"status": "active"}'
                value={targetFilterInput}
                onChange={(e) => setTargetFilterInput(e.target.value)}
              />
            </div>
          </div>
          {filterError && (
            <div className="flex items-center text-sm font-medium text-[var(--danger)] mt-1">
              {filterError}
            </div>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={handleRunComparison}
            disabled={!state.sourceConnected || !state.targetConnected || isRunning}
            isLoading={isRunning}
          >
            {isRunning ? 'Running...' : 'Run Comparison'}
          </Button>
          {comparisonError && (
            <div className="flex items-center text-sm font-medium text-[var(--danger)]">
              {comparisonError}
            </div>
          )}
        </div>

        {/* Comparison Results */}
        {result && (
          <div className="results-section">
            <div className="results-header">
              <h2 className="results-title">COMPARISON RESULTS</h2>
            </div>

            {/* Summary Cards */}
            <SummaryCards result={result} />

            {/* Color Legend */}
            <div className="color-legend">
              <div className="legend-item">
                <div className="legend-dot" style={{ background: 'var(--danger)' }} />
                <span>Deleted</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: 'var(--success)' }} />
                <span>Added</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: 'var(--warning)' }} />
                <span>Updated</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: 'var(--primary)' }} />
                <span>Source</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: 'var(--secondary)' }} />
                <span>Target</span>
              </div>
            </div>

            {/* Results View Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                variant={resultsView === 'summary' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setResultsView('summary')}
              >
                Summary
              </Button>
              <Button
                variant={resultsView === 'side-by-side' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setResultsView('side-by-side')}
              >
                Side-by-side
              </Button>
            </div>

            {resultsView === 'summary' ? (
              <DiffGroups
                deleted={result.deleted.count}
                updated={result.updated.count}
                added={result.created.count}
                deletedItems={result.deleted.samples || []}
                updatedItems={result.updated.samples || []}
                addedItems={result.created.samples || []}
              />
            ) : (
              <SideBySideDiff
                result={result}
                error={comparisonError ?? undefined}
              />
            )}

            {/* Export Section */}
            <div className="export-section">
              <Button variant="secondary" size="sm" onClick={handleExportCSV} disabled={!result}>
                Download CSV
              </Button>
              <Button variant="secondary" size="sm" onClick={handleExportJSON} disabled={!result}>
                Download JSON
              </Button>
              <Button variant="secondary" size="sm" onClick={handleExportHTML} disabled={!result}>
                HTML Report
              </Button>
            </div>

            {/* Reset Button */}
            <div className="flex justify-center pt-4">
              <Button variant="secondary" size="md" onClick={handleReset}>
                Start Over
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <ConnectionProvider>
      <DashboardContent />
    </ConnectionProvider>
  )
}

export default App
