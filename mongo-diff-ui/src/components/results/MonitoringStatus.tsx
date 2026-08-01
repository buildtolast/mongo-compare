import { Button } from '@/components/common/Button'
import type { MonitoringState } from '@/services/monitoringService'

export interface MonitoringStatusProps {
  monitoringState: MonitoringState
  onToggle: (enabled: boolean) => void
  onRefresh: () => void
  isLoading?: boolean
}

export function MonitoringStatus({
  monitoringState,
  onToggle,
  onRefresh,
  isLoading = false,
}: MonitoringStatusProps) {
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Never'
    const date = new Date(timestamp)
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(date)
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
      <div className="flex flex-wrap items-center gap-6">
        {/* Monitoring Toggle */}
        <div className="flex items-center space-x-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={monitoringState.isMonitoring}
              onChange={(e) => onToggle(e.target.checked)}
            />
            <div className="pointer-events-none peer h-6 w-11 rounded-full bg-[var(--border)] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-[var(--accent-text)] after:transition-all after:content-[''] peer-checked:bg-[var(--accent)] peer-checked:after:translate-x-full"></div>
            <span className="ml-3 text-sm font-medium text-[var(--text-2)]">Monitoring</span>
          </label>
        </div>

        {/* Last Update */}
        <div className="flex items-center space-x-2 text-sm text-[var(--text-muted)]">
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
          <span>Last Update: {formatTimestamp(monitoringState.lastUpdate)}</span>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              monitoringState.isConnected ? 'bg-[var(--accent)]' : 'bg-[var(--danger)]'
            }`}
          />
          <span className="text-sm text-[var(--text-muted)]">
            {monitoringState.isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Change Count Badge */}
        {monitoringState.pendingChanges.length > 0 && (
          <div className="flex items-center space-x-2 rounded-full bg-[var(--warn-bg)] px-3 py-1">
            <div className="h-2 w-2 rounded-full bg-[var(--warn)]" />
            <span className="text-sm font-medium text-[var(--warn)]">
              {monitoringState.pendingChanges.length} pending changes
            </span>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <Button
        variant="primary"
        isLoading={isLoading}
        onClick={onRefresh}
        size="sm"
      >
        Refresh
      </Button>
    </div>
  )
}
