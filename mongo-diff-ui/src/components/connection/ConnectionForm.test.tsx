import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConnectionForm } from './ConnectionForm'
import { ConnectionProvider } from '@/contexts/ConnectionContext'

interface ConnectionState {
  source: { connectionString: string; database: string; username: string; password: string; authDatabase: string; tls: boolean; poolSize: number; connectTimeoutMS: number; socketTimeoutMS: number; serverSelectionTimeoutMS: number }
  target: { connectionString: string; database: string; username: string; password: string; authDatabase: string; tls: boolean; poolSize: number; connectTimeoutMS: number; socketTimeoutMS: number; serverSelectionTimeoutMS: number }
  sourceConnected: boolean
  targetConnected: boolean
  databases: string[]
}

describe('ConnectionForm', () => {
  const TestComponent = () => {
    return <ConnectionForm state={{ source: { connectionString: '', database: '', username: '', password: '', authDatabase: '', tls: false, poolSize: 10, connectTimeoutMS: 10000, socketTimeoutMS: 30000, serverSelectionTimeoutMS: 30000 }, target: { connectionString: '', database: '', username: '', password: '', authDatabase: '', tls: false, poolSize: 10, connectTimeoutMS: 10000, socketTimeoutMS: 30000, serverSelectionTimeoutMS: 30000 }, sourceConnected: false, targetConnected: false, databases: [] }} dispatch={() => {}} onConnect={async () => {}} />
  }

  it('renders connection string inputs', () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )
    expect(screen.getAllByLabelText(/connection string/i)).toHaveLength(2)
  })

  it('renders database name inputs', () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )
    expect(screen.getAllByLabelText(/database name/i)).toHaveLength(2)
  })

  it('renders authentication section', () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )
    expect(screen.getAllByLabelText(/username/i)).toHaveLength(2)
    expect(screen.getAllByLabelText(/password/i)).toHaveLength(2)
    expect(screen.getAllByLabelText(/auth database/i)).toHaveLength(2)
  })

  it('renders TLS/SSL toggle', () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )
    expect(screen.getByLabelText(/enable tls\/ssl/i)).toBeInTheDocument()
  })

  it('renders connection pool settings', () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )
    expect(screen.getAllByLabelText(/pool size/i)).toHaveLength(2)
    expect(screen.getAllByLabelText(/connect timeout/i)).toHaveLength(2)
    expect(screen.getAllByLabelText(/socket timeout/i)).toHaveLength(2)
    expect(screen.getAllByLabelText(/server selection/i)).toHaveLength(2)
  })

  it('renders test connection buttons', () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )
    expect(screen.getByRole('button', { name: /test source/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /test target/i })).toBeInTheDocument()
  })

  it('renders save button', () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )
    expect(screen.getByRole('button', { name: /save configuration/i })).toBeInTheDocument()
  })

  it('has source and target connection sections', () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )
    expect(screen.getAllByLabelText(/connection string/i)).toHaveLength(2)
  })
})
