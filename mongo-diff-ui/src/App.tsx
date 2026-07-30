import { useState } from 'react'
import { ConnectionProvider, useConnection } from '@/contexts/ConnectionContext'
import { ConnectionForm } from '@/components/connection/ConnectionForm'
import { CollectionDiscovery } from '@/components/collection/CollectionDiscovery'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { DiffGroups } from '@/components/dashboard/DiffGroups'
import type { ComparisonResult } from '@/types/comparison'
import { Button } from '@/components/common/Button'
import './App.css'

function DashboardContent() {
  const { state, dispatch } = useConnection()
  const [result, setResult] = useState<ComparisonResult | null>(null)
  const [sourceIdentifierField, setSourceIdentifierField] = useState('_id')
  const [targetIdentifierField, setTargetIdentifierField] = useState('_id')
  const [sourceCollections, setSourceCollections] = useState<string[]>([])
  const [targetCollections, setTargetCollections] = useState<string[]>([])

  const handleConnect = async (connectionType: 'source' | 'target') => {
    try {
      const response = await fetch('/api/get-databases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connection_string: connectionType === 'source'
            ? state.source.connectionString
            : state.target.connectionString,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          dispatch({
            type: connectionType === 'source' ? 'SET_SOURCE_CONNECTED' : 'SET_TARGET_CONNECTED',
            payload: true,
          })
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

  const handleIdentifierChange = (
    connectionType: 'source' | 'target',
    field: string
  ) => {
    if (connectionType === 'source') {
      setSourceIdentifierField(field)
    } else {
      setTargetIdentifierField(field)
    }
  }

  const handleRunComparison = async () => {
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
          diff_strategy: 'All',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setResult(data.result)
        }
      }
    } catch (error) {
      console.error('Comparison failed:', error)
    }
  }

  const handleReset = () => {
    dispatch({ type: 'RESET' })
    setResult(null)
    setSourceCollections([])
    setTargetCollections([])
    setSourceIdentifierField('_id')
    setTargetIdentifierField('_id')
  }

  const handleDisconnect = (connectionType: 'source' | 'target') => {
    dispatch({
      type: connectionType === 'source' ? 'SET_SOURCE_CONNECTED' : 'SET_TARGET_CONNECTED',
      payload: false,
    })
  }

  return (
    <div className="min-h-screen">
      <div className="container">
        <header>
          <h1>MongoDB Compare</h1>
          <p className="subtitle">Database Diff Tool</p>
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
                  <p className="text-sm text-slate-400">Select collections from target panel</p>
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
                  <p className="text-sm text-slate-400">Select collections from source panel</p>
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

        {/* Comparison Results */}
        {result && (
          <div className="results-section">
            <div className="results-header">
              <h2 className="results-title">COMPARISON RESULTS</h2>
              <input
                type="text"
                className="search-box"
                placeholder="Search..."
              />
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

            {/* Diff Groups */}
            <DiffGroups
              deleted={result.deleted_count}
              updated={result.updated_count}
              added={result.created_count}
              deletedItems={result.sample_deleted || []}
              updatedItems={result.sample_updated || []}
              addedItems={result.sample_created || []}
              onToggle={() => {}}
              onExpand={() => {}}
            />

            {/* Export Section */}
            <div className="export-section">
              <Button variant="secondary" size="sm">Download CSV</Button>
              <Button variant="secondary" size="sm">Download JSON</Button>
              <Button variant="secondary" size="sm">HTML Report</Button>
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