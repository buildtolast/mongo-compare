import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ConnectionForm } from './ConnectionForm'
import { ConnectionProvider, useConnection } from '@/contexts/ConnectionContext'

describe('ConnectionForm', () => {
  const TestComponent = () => {
    const { state, dispatch } = useConnection()
    return <ConnectionForm state={state} dispatch={dispatch} />
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders source and target connection string inputs', () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )

    expect(screen.getByLabelText(/source connection string/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/target connection string/i)).toBeInTheDocument()
  })

  it('renders source and target database inputs', () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )

    expect(screen.getByLabelText(/source database/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/target database/i)).toBeInTheDocument()
  })

  it('renders authentication section', () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )

    const usernames = screen.getAllByLabelText(/username/i)
    expect(usernames.length).toBe(2)
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

    expect(screen.getByRole('button', { name: /test source connection/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /test target connection/i })).toBeInTheDocument()
  })

  it('renders save button', () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )

    expect(screen.getByRole('button', { name: /save as snapshot/i })).toBeInTheDocument()
  })

  it('shows connection status indicators', () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )

    expect(screen.getByText(/source status:/i)).toBeInTheDocument()
    expect(screen.getByText(/target status:/i)).toBeInTheDocument()
  })

  it('updates source connection string on change', async () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )

    const input = screen.getByLabelText(/source connection string/i)
    fireEvent.change(input, { target: { value: 'mongodb://localhost:27017' } })

    await waitFor(() => {
      expect(input).toHaveValue('mongodb://localhost:27017')
    })
  })

  it('updates target connection string on change', async () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )

    const input = screen.getByLabelText(/target connection string/i)
    fireEvent.change(input, { target: { value: 'mongodb://localhost:27018' } })

    await waitFor(() => {
      expect(input).toHaveValue('mongodb://localhost:27018')
    })
  })

  it('updates username on change', async () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )

    const input = screen.getAllByLabelText(/username/i)[0]
    fireEvent.change(input, { target: { value: 'admin' } })

    await waitFor(() => {
      expect(input).toHaveValue('admin')
    })
  })

  it('updates password on change', async () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )

    const input = screen.getAllByLabelText(/password/i)[0]
    fireEvent.change(input, { target: { value: 'secret123' } })

    await waitFor(() => {
      expect(input).toHaveValue('secret123')
    })
  })

  it('updates auth database on change', async () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )

    const input = screen.getAllByLabelText(/auth database/i)[0]
    fireEvent.change(input, { target: { value: 'admin' } })

    await waitFor(() => {
      expect(input).toHaveValue('admin')
    })
  })

  it('updates source database on change', async () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )

    const input = screen.getByLabelText(/source database/i)
    fireEvent.change(input, { target: { value: 'testdb' } })

    await waitFor(() => {
      expect(input).toHaveValue('testdb')
    })
  })

  it('updates target database on change', async () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )

    const input = screen.getByLabelText(/target database/i)
    fireEvent.change(input, { target: { value: 'testdb2' } })

    await waitFor(() => {
      expect(input).toHaveValue('testdb2')
    })
  })

  it('toggles TLS/SSL on checkbox change', () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )

    const checkbox = screen.getByLabelText(/enable tls\/ssl/i)
    expect(checkbox).not.toBeChecked()

    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('validates connection string format', async () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )

    const input = screen.getByLabelText(/source connection string/i)
    fireEvent.change(input, { target: { value: 'invalid' } })

    expect(screen.getAllByText(/invalid connection string format/i)).toHaveLength(1)
  })

  it('shows error for empty connection string', async () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )

    const input = screen.getByLabelText(/source connection string/i)
    fireEvent.change(input, { target: { value: '' } })

    expect(screen.getAllByText(/connection string is required/i)).toHaveLength(1)
  })

  it('validates database name is not empty', async () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )

    const sourceDbInput = screen.getByLabelText(/source database/i)
    fireEvent.change(sourceDbInput, { target: { value: '' } })

    expect(screen.getAllByText(/database name is required/i)).toHaveLength(1)
  })

  it('applies error styling to invalid inputs', async () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )

    const input = screen.getByLabelText(/source connection string/i)
    fireEvent.change(input, { target: { value: 'invalid' } })

    await waitFor(() => {
      expect(input).toHaveClass('border-rose-500')
    })
  })

  it('applies success styling when connection string is valid', () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )

    const input = screen.getByLabelText(/source connection string/i)
    fireEvent.change(input, { target: { value: 'mongodb://localhost:27017' } })

    expect(input).not.toHaveClass('border-rose-500')
  })
})
