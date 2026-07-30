import { useState } from 'react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Checkbox } from '@/components/common/Checkbox'
import type { ConnectionState, ConnectionAction } from '@/contexts/ConnectionContext'

interface ConnectionFormProps {
  state: ConnectionState
  dispatch: React.Dispatch<ConnectionAction>
  onConnect: (connectionType: 'source' | 'target') => Promise<void>
}

interface FormErrors {
  sourceConnectionString?: string
  targetConnectionString?: string
  sourceDatabase?: string
  targetDatabase?: string
  username?: string
  password?: string
  authDatabase?: string
  poolSize?: string
  connectTimeoutMS?: string
  socketTimeoutMS?: string
  serverSelectionTimeoutMS?: string
}

function isValidConnectionString(value: string): boolean {
  if (!value.trim()) return false
  const uriPattern = /^mongodb(\+srv)?:\/\/[^\s/$?#]+[^\s]*$/i
  return uriPattern.test(value.trim())
}

function _isValidDatabaseName(value: string): boolean {
  return value.trim().length > 0 && value.trim().length <= 64
}

function isPositiveNumber(value: string): boolean {
  const num = parseInt(value, 10)
  return !isNaN(num) && num > 0
}

export function ConnectionForm({ state, dispatch, onConnect }: ConnectionFormProps) {
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSourceTesting, setIsSourceTesting] = useState(false)
  const [isTargetTesting, setIsTargetTesting] = useState(false)
  const [testResults, setTestResults] = useState<{
    source?: { success: boolean; message: string }
    target?: { success: boolean; message: string }
  }>({})

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
      case 'username':
        if (value.trim().length > 128) return 'Username must be 128 characters or less'
        return undefined
      case 'password':
        if (value.trim().length > 128) return 'Password must be 128 characters or less'
        return undefined
      case 'authDatabase':
        if (!value.trim()) return 'Auth database is required'
        return undefined
      case 'poolSize':
        if (!isPositiveNumber(value)) return 'Pool size must be a positive number'
        if (parseInt(value, 10) > 1000) return 'Pool size must be 1000 or less'
        return undefined
      case 'connectTimeoutMS':
      case 'socketTimeoutMS':
      case 'serverSelectionTimeoutMS':
        if (!isPositiveNumber(value)) return 'Timeout must be a positive number'
        if (parseInt(value, 10) > 300000) return 'Timeout must be 300000ms or less'
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
    const isNumberField =
      fieldName === 'poolSize' ||
      fieldName === 'connectTimeoutMS' ||
      fieldName === 'socketTimeoutMS' ||
      fieldName === 'serverSelectionTimeoutMS'

    dispatch({
      type: section === 'source' ? 'SET_SOURCE' : 'SET_TARGET',
      payload: {
        ...state[section],
        [fieldName]: isNumberField ? parseInt(value, 10) : value,
      },
    })
  }

  const handleCheckboxChange = (checked: boolean, field: string) => {
    dispatch({
      type: 'SET_SOURCE',
      payload: {
        ...state.source,
        [field]: checked,
      },
    })
    dispatch({
      type: 'SET_TARGET',
      payload: {
        ...state.target,
        [field]: checked,
      },
    })
  }

  const handleTestConnection = async (
    connectionString: string,
    config: {
      username?: string
      password?: string
      authDatabase?: string
      tls?: boolean
      poolSize?: number
      connectTimeoutMS?: number
      socketTimeoutMS?: number
      serverSelectionTimeoutMS?: number
    },
    setIsTesting: (value: boolean) => void,
    setTestResult: (result: { success: boolean; message: string }) => void
  ) => {
    setIsTesting(true)

    try {
      const url = new URL(connectionString)
      if (config.username && config.password) {
        url.username = config.username
        url.password = config.password
      }

      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
           connection_string: url.toString(),
           config,
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
    const sourceConfig = {
      username: state.source.username,
      password: state.source.password,
      authDatabase: state.source.authDatabase,
      tls: state.source.tls,
      poolSize: state.source.poolSize,
      connectTimeoutMS: state.source.connectTimeoutMS,
      socketTimeoutMS: state.source.socketTimeoutMS,
      serverSelectionTimeoutMS: state.source.serverSelectionTimeoutMS,
    }

    await handleTestConnection(
      state.source.connectionString,
      sourceConfig,
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
    const targetConfig = {
      username: state.target.username,
      password: state.target.password,
      authDatabase: state.target.authDatabase,
      tls: state.target.tls,
      poolSize: state.target.poolSize,
      connectTimeoutMS: state.target.connectTimeoutMS,
      socketTimeoutMS: state.target.socketTimeoutMS,
      serverSelectionTimeoutMS: state.target.serverSelectionTimeoutMS,
    }

    await handleTestConnection(
      state.target.connectionString,
      targetConfig,
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
    alert('Snapshot saved successfully!')
  }

  const quickConnect = (type: 'source' | 'target') => {
    dispatch({
      type: type === 'source' ? 'SET_SOURCE' : 'SET_TARGET',
      payload: {
        connectionString: 'mongodb://mongo:27017',
        database: type === 'source' ? 'sourcedb' : 'targetdb',
        username: '',
        password: '',
        authDatabase: 'admin',
        tls: false,
        poolSize: 10,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
        serverSelectionTimeoutMS: 30000,
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 p-6 transition-all hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-emerald-400">Source Database</h2>
            <button
              onClick={() => quickConnect('source')}
              className="text-xs font-medium text-emerald-500 hover:text-emerald-400 transition-colors"
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

            <div className="border-t border-slate-700 pt-4">
              <h3 className="mb-3 text-sm font-medium text-slate-300">Authentication</h3>
              <div className="space-y-3">
                <Input
                  id="source-username"
                  label="Username"
                  placeholder="admin"
                  value={state.source.username}
                  onChange={(e) => handleInputChange(e, 'username', 'source')}
                  error={errors.username}
                />
                <Input
                  id="source-password"
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={state.source.password}
                  onChange={(e) => handleInputChange(e, 'password', 'source')}
                  error={errors.password}
                />
                <Input
                  id="source-auth-database"
                  label="Auth Database"
                  placeholder="admin"
                  value={state.source.authDatabase}
                  onChange={(e) => handleInputChange(e, 'authDatabase', 'source')}
                  error={errors.authDatabase}
                />
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <h3 className="mb-3 text-sm font-medium text-slate-300">Connection Pool</h3>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="source-pool-size"
                  label="Pool Size"
                  type="number"
                  placeholder="10"
                  value={state.source.poolSize?.toString() || ''}
                  onChange={(e) => handleInputChange(e, 'poolSize', 'source')}
                  error={errors.poolSize}
                />
                <Input
                  id="source-connect-timeout"
                  label="Connect Timeout"
                  type="number"
                  placeholder="30000"
                  value={state.source.connectTimeoutMS?.toString() || ''}
                  onChange={(e) => handleInputChange(e, 'connectTimeoutMS', 'source')}
                  error={errors.connectTimeoutMS}
                />
                <Input
                  id="source-socket-timeout"
                  label="Socket Timeout"
                  type="number"
                  placeholder="30000"
                  value={state.source.socketTimeoutMS?.toString() || ''}
                  onChange={(e) => handleInputChange(e, 'socketTimeoutMS', 'source')}
                  error={errors.socketTimeoutMS}
                />
                <Input
                  id="source-server-selection-timeout"
                  label="Server Selection"
                  type="number"
                  placeholder="30000"
                  value={state.source.serverSelectionTimeoutMS?.toString() || ''}
                  onChange={(e) => handleInputChange(e, 'serverSelectionTimeoutMS', 'source')}
                  error={errors.serverSelectionTimeoutMS}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 p-6 transition-all hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-cyan-500 to-blue-500" />
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-cyan-400">Target Database</h2>
            <button
              onClick={() => quickConnect('target')}
              className="text-xs font-medium text-cyan-500 hover:text-cyan-400 transition-colors"
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

            <div className="border-t border-slate-700 pt-4">
              <h3 className="mb-3 text-sm font-medium text-slate-300">Authentication</h3>
              <div className="space-y-3">
                <Input
                  id="target-username"
                  label="Username"
                  placeholder="admin"
                  value={state.target.username}
                  onChange={(e) => handleInputChange(e, 'username', 'target')}
                  error={errors.username}
                />
                <Input
                  id="target-password"
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={state.target.password}
                  onChange={(e) => handleInputChange(e, 'password', 'target')}
                  error={errors.password}
                />
                <Input
                  id="target-auth-database"
                  label="Auth Database"
                  placeholder="admin"
                  value={state.target.authDatabase}
                  onChange={(e) => handleInputChange(e, 'authDatabase', 'target')}
                  error={errors.authDatabase}
                />
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <h3 className="mb-3 text-sm font-medium text-slate-300">Connection Pool</h3>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="target-pool-size"
                  label="Pool Size"
                  type="number"
                  placeholder="10"
                  value={state.target.poolSize?.toString() || ''}
                  onChange={(e) => handleInputChange(e, 'poolSize', 'target')}
                  error={errors.poolSize}
                />
                <Input
                  id="target-connect-timeout"
                  label="Connect Timeout"
                  type="number"
                  placeholder="30000"
                  value={state.target.connectTimeoutMS?.toString() || ''}
                  onChange={(e) => handleInputChange(e, 'connectTimeoutMS', 'target')}
                  error={errors.connectTimeoutMS}
                />
                <Input
                  id="target-socket-timeout"
                  label="Socket Timeout"
                  type="number"
                  placeholder="30000"
                  value={state.target.socketTimeoutMS?.toString() || ''}
                  onChange={(e) => handleInputChange(e, 'socketTimeoutMS', 'target')}
                  error={errors.socketTimeoutMS}
                />
                <Input
                  id="target-server-selection-timeout"
                  label="Server Selection"
                  type="number"
                  placeholder="30000"
                  value={state.target.serverSelectionTimeoutMS?.toString() || ''}
                  onChange={(e) => handleInputChange(e, 'serverSelectionTimeoutMS', 'target')}
                  error={errors.serverSelectionTimeoutMS}
                />
              </div>
             </div>
           </div>
         </div>

         <div className="flex gap-3 pt-4 border-t border-slate-700">
           <Button
             variant={state.sourceConnected ? "success" : "primary"}
             size="sm"
             onClick={() => onConnect('source')}
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
           <Button
             variant={state.targetConnected ? "success" : "primary"}
             size="sm"
             onClick={() => onConnect('target')}
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

       <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6">
         <h2 className="mb-4 text-lg font-semibold text-slate-200">Security Settings</h2>
        <div className="space-y-4">
          <Checkbox
            id="enable-tls"
            label="Enable TLS/SSL for both connections"
            checked={state.source.tls || false}
            onChange={(checked) => handleCheckboxChange(checked, 'tls')}
          />
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3 rounded-lg bg-slate-900/50 px-4 py-2">
              <div
                className={`h-3 w-3 rounded-full ${
                  state.sourceConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-rose-500'
                }`} // Add shadow for glow effect
              />
              <span className="text-sm font-medium text-slate-300">
                Source: {state.sourceConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-slate-900/50 px-4 py-2">
              <div
                className={`h-3 w-3 rounded-full ${
                  state.targetConnected ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'bg-rose-500'
                }`}
              />
              <span className="text-sm font-medium text-slate-300">
                Target: {state.targetConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6">
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
                  testResults.source.success ? 'text-emerald-400' : 'text-rose-400'
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
                  testResults.target.success ? 'text-cyan-400' : 'text-rose-400'
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

      <div className="flex justify-end">
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
