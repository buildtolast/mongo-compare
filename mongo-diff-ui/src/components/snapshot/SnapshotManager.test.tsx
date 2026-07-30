import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SnapshotManager } from './SnapshotManager'
import { ConnectionProvider } from '@/contexts/ConnectionContext'

describe('SnapshotManager', () => {
  const TestComponent = () => {
    return <SnapshotManager />
  }

  it('renders save button', () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )

    expect(screen.getByRole('button', { name: /save current configuration/i })).toBeInTheDocument()
  })

  it('renders no snapshots message when empty', () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )

    expect(screen.getByText(/no snapshots saved yet/i)).toBeInTheDocument()
  })

  it('shows error when name is empty on save', async () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )

    const saveButton = screen.getByRole('button', { name: /save current configuration/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/name/i)
      const confirmButton = screen.getByRole('button', { name: /save snapshot/i })

      fireEvent.change(nameInput, { target: { value: '' } })
      fireEvent.click(confirmButton)

      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    })
  })

  it('shows modal form when save button is clicked', async () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )

    const saveButton = screen.getByRole('button', { name: /save current configuration/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Enter snapshot description/i)).toBeInTheDocument()
    })
  })

  it('renders snapshot list with proper structure', async () => {
    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    )

    expect(screen.getByText(/Saved Snapshots/i)).toBeInTheDocument()
    expect(screen.getByText(/No snapshots saved yet/i)).toBeInTheDocument()
  })
})
