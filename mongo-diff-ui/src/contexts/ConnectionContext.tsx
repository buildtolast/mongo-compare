import { createContext, useContext, useReducer } from 'react'
import type { ConnectionConfig } from '@/types'

export interface ConnectionState {
  source: ConnectionConfig
  target: ConnectionConfig
  sourceConnected: boolean
  targetConnected: boolean
  databases: string[]
}

export type ConnectionAction =
  | { type: 'SET_SOURCE'; payload: ConnectionConfig }
  | { type: 'SET_TARGET'; payload: ConnectionConfig }
  | { type: 'SET_SOURCE_CONNECTED'; payload: boolean }
  | { type: 'SET_TARGET_CONNECTED'; payload: boolean }
  | { type: 'SET_DATABASES'; payload: string[] }
  | { type: 'RESET' }

const initialState: ConnectionState = {
  source: {
    connectionString: 'mongodb://mongo:27017',
    username: '',
    password: '',
    authDatabase: 'admin',
    database: 'sourcedb',
    tls: false,
    poolSize: 10,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
  },
  target: {
    connectionString: 'mongodb://mongo:27017',
    username: '',
    password: '',
    authDatabase: 'admin',
    database: 'targetdb',
    tls: false,
    poolSize: 10,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
  },
  sourceConnected: false,
  targetConnected: false,
  databases: [],
}

function connectionReducer(
  state: ConnectionState,
  action: ConnectionAction
): ConnectionState {
  switch (action.type) {
    case 'SET_SOURCE':
      return { ...state, source: action.payload }
    case 'SET_TARGET':
      return { ...state, target: action.payload }
    case 'SET_SOURCE_CONNECTED':
      return { ...state, sourceConnected: action.payload }
    case 'SET_TARGET_CONNECTED':
      return { ...state, targetConnected: action.payload }
    case 'SET_DATABASES':
      return { ...state, databases: action.payload }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

const ConnectionContext = createContext<{
  state: ConnectionState
  dispatch: React.Dispatch<ConnectionAction>
} | undefined>(undefined)

export function ConnectionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(connectionReducer, initialState)

  const value = {
    state,
    dispatch,
  }

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  )
}

export function useConnection() {
  const context = useContext(ConnectionContext)
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider')
  }
  return context
}
