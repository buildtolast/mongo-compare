import { useState } from 'react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import type { ConnectionState, ConnectionAction } from '@/contexts/ConnectionContext'

interface ConnectionFormProps {
  state: ConnectionState
  dispatch: React.Dispatch<ConnectionAction>
}

interface FormErrors {
  sourceConnectionString?: string
  targetConnectionString?: string
  sourceDatabase?: string
  targetDatabase?: string
}

function isValidConnectionString(value: string): boolean {
  if (!value.trim()) return false
  const uriPattern = /^mongodb(\+srv)?:\/\/[^\s/$?#]+[^\s]*$/i
  return uriPattern.test(value.trim())
}

function _isValidDatabaseName(value: string): boolean {
  return value.trim().length > 0 && value.trim().length <= 64
}

export function ConnectionForm({ state, dispatch }: ConnectionFormProps) {
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSourceTesting, setIsSourceTesting] = useState(false)
  const [isTargetTesting, setIsTargetTesting] = useState(false)
  const [testResults, setTestResults] = useState<{
    source?: { success: boolean; message: string }
    target?: { success: boolean; message: string }
  }>({})
  const [snapshotSaved, setSnapshotSaved] = useState(false)

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'sourceConnectionString':
      case 'targetConnectionString':
        if (!value.trim()) return 'Connection string is required'
        if (!isValidConnectionString(value)) return 'Invalid connection string format'
        return undefined
      case 'sourceDatabase':
      case 'targetDatabase':
        if (!value.trim()) return 'Database name is required'
        return undefined
      default:
        return undefined
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
    section: 'source' | 'target'
  ) => {
    const value = e.target.value
    const error = validateField(field, value)

    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }))

    const fieldName = field.replace(section, '').replace(/^(source|target)/, '').toLowerCase()

    dispatch({
      type: section === 'source' ? 'SET_SOURCE' : 'SET_TARGET',
      payload: {
        ...state[section],
        [fieldName]: value,
      },
    })
  }

  const handleTestConnection = async (
    connectionString: string,
    setIsTesting: (value: boolean) => void,
    setTestResult: (result: { success: boolean; message: string }) => void
  ) => {
    setIsTesting(true)

    try {
      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connection_string: connectionString,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setTestResult({ success: true, message: result.message || 'Connection successful' })
      } else {
        const error = await response.json()
        setTestResult({ success: false, message: error.message || 'Connection failed' })
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed',
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleTestSourceConnection = async () => {
    await handleTestConnection(
      state.source.connectionString,
      setIsSourceTesting,
      (result) => {
        setTestResults((prev) => ({
          ...prev,
          source: result,
        }))
      }
    )
  }

  const handleTestTargetConnection = async () => {
    await handleTestConnection(
      state.target.connectionString,
      setIsTargetTesting,
      (result) => {
        setTestResults((prev) => ({
          ...prev,
          target: result,
        }))
      }
    )
  }

  const handleSaveSnapshot = () => {
    const snapshot = {
      source: state.source,
      target: state.target,
      timestamp: new Date().toISOString(),
    }

    localStorage.setItem('mongo-diff-snapshot', JSON.stringify(snapshot))
    setSnapshotSaved(true)
  }

  const quickConnect = (type: 'source' | 'target') => {
    dispatch({
      type: type === 'source' ? 'SET_SOURCE' : 'SET_TARGET',
      payload: {
        ...state[type],
        connectionString: 'mongodb://mongo:27017',
        database: type === 'source' ? 'sourcedb' : 'targetdb',
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6 transition-all hover:border-[var(--accent)] hover:shadow-lg hover:shadow-[var(--add-bg)]">
          <div className="absolute top-0 left-0 h-1 w-full bg-[var(--accent)]" />
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--accent)]">Source Database</h2>
            <button
              onClick={() => quickConnect('source')}
              className="text-xs font-medium text-[var(--accent)] hover:opacity-80 transition-colors"
            >
              Use defaults
            </button>
          </div>

          <div className="space-y-4">
            <Input
              id="source-connection-string"
              label="Connection String"
              placeholder="mongodb://mongo:27017"
              value={state.source.connectionString}
              onChange={(e) => handleInputChange(e, 'sourceConnectionString', 'source')}
              error={errors.sourceConnectionString}
            />

            <Input
              id="source-database"
              label="Database Name"
              placeholder="sourcedb"
              value={state.source.database}
              onChange={(e) => handleInputChange(e, 'sourceDatabase', 'source')}
              error={errors.sourceDatabase}
            />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6 transition-all hover:border-[var(--accent2)] hover:shadow-lg hover:shadow-[var(--add-bg)]">
          <div className="absolute top-0 left-0 h-1 w-full bg-[var(--accent2)]" />
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--accent2)]">Target Database</h2>
            <button
              onClick={() => quickConnect('target')}
              className="text-xs font-medium text-[var(--accent2)] hover:opacity-80 transition-colors"
            >
              Use defaults
            </button>
          </div>

          <div className="space-y-4">
            <Input
              id="target-connection-string"
              label="Connection String"
              placeholder="mongodb://mongo:27017"
              value={state.target.connectionString}
              onChange={(e) => handleInputChange(e, 'targetConnectionString', 'target')}
              error={errors.targetConnectionString}
            />

            <Input
              id="target-database"
              label="Database Name"
              placeholder="targetdb"
              value={state.target.database}
              onChange={(e) => handleInputChange(e, 'targetDatabase', 'target')}
              error={errors.targetDatabase}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="success"
              size="md"
              isLoading={isSourceTesting}
              onClick={handleTestSourceConnection}
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Test Source
            </Button>
            <Button
              variant="success"
              size="md"
              isLoading={isTargetTesting}
              onClick={handleTestTargetConnection}
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Test Target
            </Button>
          </div>
          <div className="flex items-center gap-6">
            {testResults.source && (
              <span
                className={`flex items-center text-sm font-medium ${
                  testResults.source.success ? 'text-[var(--accent)]' : 'text-[var(--danger)]'
                }`}
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {testResults.source.success ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
                {testResults.source.message}
              </span>
            )}
            {testResults.target && (
              <span
                className={`flex items-center text-sm font-medium ${
                  testResults.target.success ? 'text-[var(--accent2)]' : 'text-[var(--danger)]'
                }`}
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {testResults.target.success ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
                {testResults.target.message}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        {snapshotSaved && (
          <span className="text-sm font-medium text-[var(--accent)]">Snapshot saved</span>
        )}
        <Button variant="primary" size="lg" onClick={handleSaveSnapshot}>
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save Configuration
        </Button>
      </div>
    </div>
  )
}
