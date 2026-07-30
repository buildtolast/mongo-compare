import { useState } from 'react'
import { useConnection } from '@/contexts/ConnectionContext'
import { Button } from '@/components/common/Button'
import { SummaryStats } from '@/components/results/SummaryStats'
import { SideBySideDiff } from '@/components/results/SideBySideDiff'
import { VirtualizedDiffList } from '@/components/results/VirtualizedDiffList'
import type { ChangedField as RustChangedField } from '@/types/rust-comparison'

interface RustComparisonResult {
  success: boolean
  result: {
    started_at: string
    finished_at: string
    collection_before: string
    collection_after: string
    total_before: number
    total_after: number
    created_count: number
    updated_count: number
    deleted_count: number
    sample_created: unknown[]
    sample_updated: unknown[]
    sample_deleted: unknown[]
  }
}

interface ChangedField {
  path: string
  oldValue: unknown
  newValue: unknown
  type: 'added' | 'removed' | 'changed'
}

interface DocumentDiff {
  identifier: string
  changes: ChangedField[]
}

interface ComparisonResult {
  timestamp: string
  sourceInstance: string
  targetInstance: string
  sourceDatabase: string
   targetDatabase: string
   created: { count: number; samples: unknown[] }
   updated: { count: number; samples: DocumentDiff[] }
   deleted: { count: number; samples: unknown[] }
 }

function transformRustComparison(rustResult: RustComparisonResult): ComparisonResult {
  const now = new Date().toISOString()
  
  const transformUpdated = (samples: { identifier?: string; changed_fields?: { field_name: string; old_value: string; new_value: string }[] }[]): DocumentDiff[] => {
    return samples.map((doc) => ({
      identifier: doc.identifier || '',
      changes: (doc.changed_fields || []).map((field) => ({
        path: field.field_name,
        oldValue: field.old_value,
        newValue: field.new_value,
        type: field.old_value === 'null' ? 'added' : field.new_value === 'null' ? 'removed' : 'changed'
      }))
    }))
  }

  return {
    timestamp: now,
    sourceInstance: 'localhost:3001',
    targetInstance: 'localhost:3001',
    sourceDatabase: 'sourcedb',
    targetDatabase: 'targetdb',
    created: {
      count: rustResult.result.created_count || 0,
      samples: rustResult.result.sample_created as unknown[]
    },
    updated: {
      count: rustResult.result.updated_count || 0,
      samples: transformUpdated(rustResult.result.sample_updated as { identifier?: string; changed_fields?: { field_name: string; old_value: string; new_value: string }[] }[])
    },
    deleted: {
      count: rustResult.result.deleted_count || 0,
      samples: rustResult.result.sample_deleted as unknown[]
    }
  }
}

export default function ComparisonView() {
  const { state } = useConnection()
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const runComparison = async () => {
    setIsLoading(true)
    setError(undefined)

    try {
      const response = await fetch('http://localhost:80/api/run-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_connection_string: state.source.connectionString,
          target_connection_string: state.target.connectionString,
          database: state.source.database,
          target_database: state.target.database,
          collections: ['users'],
          identifier_field: '_id',
          sample_limit: 10,
          diff_strategy: 'all'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Comparison failed')
      }

      const rustResult: RustComparisonResult = await response.json()
      setComparisonResult(transformRustComparison(rustResult))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Comparison Results</h1>
          <p className="text-sm text-slate-400">
            Source: {state.source.database} | Target: {state.target.database}
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          isLoading={isLoading}
          onClick={runComparison}
        >
          Run Comparison
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-900/20 p-4">
          <div className="flex items-center space-x-2 text-rose-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {comparisonResult ? (
        <>
          <SummaryStats result={comparisonResult} />
          
          {comparisonResult.updated.count > 100 ? (
            <VirtualizedDiffList result={comparisonResult} error={error} />
          ) : (
            <SideBySideDiff result={comparisonResult} error={error} />
          )}
        </>
      ) : (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-12 text-center">
          <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-slate-700/50 flex items-center justify-center">
            <svg className="h-10 w-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-200 mb-2">No Results Yet</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Click "Run Comparison" to compare your MongoDB databases and view side-by-side document differences
          </p>
        </div>
      )}
    </div>
  )
}
