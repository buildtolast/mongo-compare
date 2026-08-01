import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConnectionForm } from './ConnectionForm'
import { ConnectionProvider } from '@/contexts/ConnectionContext'

describe('ConnectionForm', () => {
  const TestComponent = () => {
    return (
      <ConnectionForm
        state={{
          source: { connectionString: '', database: '' },
          target: { connectionString: '', database: '' },
          sourceConnected: false,
          targetConnected: false,
          databases: [],
        }}
        dispatch={() => {}}
      />
    )
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
