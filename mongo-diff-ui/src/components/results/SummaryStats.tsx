import { useState, useCallback } from 'react'
import { Button } from '@/components/common/Button'
import type { MonitoringState } from '@/services/monitoringService'
import { MonitoringStatus } from './MonitoringStatus'

export interface SummaryStatsProps {
  result?: {
    timestamp: string
    sourceInstance: string
    targetInstance: string
    sourceDatabase: string
    targetDatabase: string
    created: { count: number }
    updated: { count: number }
    deleted: { count: number }
  }
  isLoading?: boolean
  error?: string
  onExport?: (format: 'json' | 'csv' | 'html') => void
  onRefresh?: () => void
  onMonitoringToggle?: (enabled: boolean) => void
  monitoringState?: MonitoringState
}

export function SummaryStats({
  result,
  isLoading = false,
  error,
  onExport,
  onRefresh,
  onMonitoringToggle,
  monitoringState,
}: SummaryStatsProps) {
  const [monitoringEnabled, setMonitoringEnabled] = useState(false)

  const handleMonitoringToggle = useCallback(() => {
    const newEnabled = !monitoringEnabled
    setMonitoringEnabled(newEnabled)
    onMonitoringToggle?.(newEnabled)
  }, [monitoringEnabled, onMonitoringToggle])

  const formatCount = (count: number) => {
    return count.toLocaleString()
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(date)
  }

  if (!result) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-8 text-center">
        <p className="text-slate-400">No comparison results available</p>
        <p className="text-sm text-slate-500 mt-1">
          Run a comparison to see summary statistics
        </p>
      </div>
    )
  }

  const statCardBaseClasses =
    'rounded-xl border p-6 transition-all duration-200 hover:shadow-lg'
  const statLabelClasses = 'text-sm font-medium uppercase tracking-wider'
  const statValueClasses = 'text-4xl font-bold'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-emerald-400">Comparison Results</h2>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={monitoringEnabled}
                onChange={handleMonitoringToggle}
                disabled={isLoading}
              />
              <div className="pointer-events-none peer h-6 w-11 rounded-full bg-slate-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-disabled:opacity-50"></div>
              <span className="ml-3 text-sm font-medium text-slate-300">Monitoring</span>
            </label>
          </div>
          <Button
            variant="primary"
            isLoading={isLoading}
            onClick={onRefresh}
            size="sm"
          >
            Refresh
          </Button>
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Created Card */}
        <div data-testid="stat-card-created" className={`${statCardBaseClasses} bg-emerald-900/30 border-emerald-500/30`}>
          <div className="flex items-center space-x-2 text-emerald-400">
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className={statLabelClasses}>Created</span>
          </div>
          <div className="mt-2">
            <span className={statValueClasses} data-testid="created-count">
              {formatCount(result.created.count)}
            </span>
          </div>
        </div>

        {/* Updated Card */}
        <div data-testid="stat-card-updated" className={`${statCardBaseClasses} bg-amber-900/30 border-amber-500/30`}>
          <div className="flex items-center space-x-2 text-amber-400">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className={statLabelClasses}>Updated</span>
          </div>
          <div className="mt-2">
            <span className={statValueClasses} data-testid="updated-count">
              {formatCount(result.updated.count)}
            </span>
          </div>
        </div>

        {/* Deleted Card */}
        <div data-testid="stat-card-deleted" className={`${statCardBaseClasses} bg-rose-900/30 border-rose-500/30`}>
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
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className={statLabelClasses}>Deleted</span>
          </div>
          <div className="mt-2">
            <span className={statValueClasses} data-testid="deleted-count">
              {formatCount(result.deleted.count)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-700 bg-slate-800 p-4">
        <div className="flex items-center space-x-2 text-sm text-slate-400">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            Comparison performed at {formatTimestamp(result.timestamp)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onExport?.('json')}
          >
            Export JSON
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onExport?.('csv')}
          >
            Export CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onExport?.('html')}
          >
            Export HTML
          </Button>
        </div>
      </div>

      {/* Real-time Monitoring Status */}
      {monitoringState && (
        <MonitoringStatus
          monitoringState={monitoringState}
          onToggle={(enabled) => {
            setMonitoringEnabled(enabled)
            onMonitoringToggle?.(enabled)
          }}
          onRefresh={onRefresh || (() => {})}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
