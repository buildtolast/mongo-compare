import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DatabaseTree } from './DatabaseTree'

describe('DatabaseTree', () => {
  const mockOnDatabaseSelect = vi.fn()
  const mockOnCollectionSelect = vi.fn()
  const mockOnExpand = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with databases', () => {
    const databases = ['production', 'staging', 'development']
    render(
      <DatabaseTree
        databases={databases}
        selectedDatabase="production"
        onDatabaseSelect={mockOnDatabaseSelect}
        collectionsByDatabase={{
          production: ['users', 'orders'],
          staging: ['users'],
          development: ['users', 'orders', 'products'],
        }}
        selectedCollections={['users']}
        onCollectionSelect={mockOnCollectionSelect}
        onExpand={mockOnExpand}
      />
    )

    expect(screen.getByText('production')).toBeInTheDocument()
    expect(screen.getByText('staging')).toBeInTheDocument()
    expect(screen.getByText('development')).toBeInTheDocument()
  })

  it('calls onDatabaseSelect when database is clicked', () => {
    render(
      <DatabaseTree
        databases={['production', 'staging']}
        selectedDatabase="production"
        onDatabaseSelect={mockOnDatabaseSelect}
        collectionsByDatabase={{
          production: ['users'],
          staging: ['users'],
        }}
        selectedCollections={[]}
        onCollectionSelect={mockOnCollectionSelect}
        onExpand={mockOnExpand}
      />
    )

    const stagingButton = screen.getByText('staging')
    fireEvent.click(stagingButton)

    expect(mockOnDatabaseSelect).toHaveBeenCalledWith('staging')
  })

  it('shows collections for selected database', () => {
    render(
      <DatabaseTree
        databases={['production', 'staging']}
        selectedDatabase="production"
        onDatabaseSelect={mockOnDatabaseSelect}
        collectionsByDatabase={{
          production: ['users', 'orders'],
          staging: ['users'],
        }}
        selectedCollections={['users']}
        onCollectionSelect={mockOnCollectionSelect}
        onExpand={mockOnExpand}
      />
    )

    const expandButton = screen.getByRole('button', { name: /production ▲/ })
    fireEvent.click(expandButton)

    expect(screen.getByText('users')).toBeInTheDocument()
    expect(screen.getByText('orders')).toBeInTheDocument()
  })

  it('calls onCollectionSelect when collection checkbox is clicked', () => {
    render(
      <DatabaseTree
        databases={['production']}
        selectedDatabase="production"
        onDatabaseSelect={mockOnDatabaseSelect}
        collectionsByDatabase={{
          production: ['users', 'orders'],
        }}
        selectedCollections={['users']}
        onCollectionSelect={mockOnCollectionSelect}
        onExpand={mockOnExpand}
      />
    )

    const expandButton = screen.getByRole('button', { name: /production ▲/ })
    fireEvent.click(expandButton)

    const ordersCheckbox = screen.getByRole('checkbox', { name: 'orders' })
    fireEvent.click(ordersCheckbox)

    expect(mockOnCollectionSelect).toHaveBeenCalledWith('production', 'orders', true)
  })

  it('shows collections as checked when selected', () => {
    render(
      <DatabaseTree
        databases={['production']}
        selectedDatabase="production"
        onDatabaseSelect={mockOnDatabaseSelect}
        collectionsByDatabase={{
          production: ['users', 'orders'],
        }}
        selectedCollections={['users', 'orders']}
        onCollectionSelect={mockOnCollectionSelect}
        onExpand={mockOnExpand}
      />
    )

    const expandButton = screen.getByRole('button', { name: /production ▲/ })
    fireEvent.click(expandButton)

    const allCheckboxes = screen.getAllByRole('checkbox')
    allCheckboxes.forEach((checkbox) => {
      expect(checkbox).toBeChecked()
    })
  })

  it('renders with loading state', () => {
    const { container } = render(
      <DatabaseTree
        databases={[]}
        selectedDatabase=""
        onDatabaseSelect={mockOnDatabaseSelect}
        collectionsByDatabase={{}}
        selectedCollections={[]}
        onCollectionSelect={mockOnCollectionSelect}
        onExpand={mockOnExpand}
        isLoading={true}
      />
    )

    expect(screen.getByText('Loading databases...')).toBeInTheDocument()
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('applies loading styles when isLoading is true', () => {
    const { container } = render(
      <DatabaseTree
        databases={[]}
        selectedDatabase=""
        onDatabaseSelect={mockOnDatabaseSelect}
        collectionsByDatabase={{}}
        selectedCollections={[]}
        onCollectionSelect={mockOnCollectionSelect}
        onExpand={mockOnExpand}
        isLoading={true}
      />
    )

    const treeContainer = container.querySelector('.database-tree')
    expect(treeContainer).toBeInTheDocument()
    expect(treeContainer).toHaveClass('opacity-50')
  })

  it('does not show databases when isLoading is true', () => {
    render(
      <DatabaseTree
        databases={['production', 'staging']}
        selectedDatabase=""
        onDatabaseSelect={mockOnDatabaseSelect}
        collectionsByDatabase={{
          production: ['users'],
          staging: ['users'],
        }}
        selectedCollections={[]}
        onCollectionSelect={mockOnCollectionSelect}
        onExpand={mockOnExpand}
        isLoading={true}
      />
    )

    expect(screen.queryByText('production')).not.toBeInTheDocument()
    expect(screen.queryByText('staging')).not.toBeInTheDocument()
  })

  it('displays expand/collapse toggle for databases with collections', () => {
    render(
      <DatabaseTree
        databases={['production']}
        selectedDatabase="production"
        onDatabaseSelect={mockOnDatabaseSelect}
        collectionsByDatabase={{
          production: ['users', 'orders'],
        }}
        selectedCollections={[]}
        onCollectionSelect={mockOnCollectionSelect}
        onExpand={mockOnExpand}
      />
    )

    expect(screen.getByText('production')).toBeInTheDocument()
  })

  it('calls onExpand when expand button is clicked', () => {
    render(
      <DatabaseTree
        databases={['production']}
        selectedDatabase="production"
        onDatabaseSelect={mockOnDatabaseSelect}
        collectionsByDatabase={{
          production: ['users', 'orders'],
        }}
        selectedCollections={[]}
        onCollectionSelect={mockOnCollectionSelect}
        onExpand={mockOnExpand}
      />
    )

    const expandButton = screen.getByRole('button', { name: /production ▲/ })
    fireEvent.click(expandButton)

    expect(mockOnExpand).toHaveBeenCalledWith('production')
  })

  it('highlights selected database', () => {
    render(
      <DatabaseTree
        databases={['production', 'staging']}
        selectedDatabase="staging"
        onDatabaseSelect={mockOnDatabaseSelect}
        collectionsByDatabase={{
          production: ['users'],
          staging: ['users'],
        }}
        selectedCollections={[]}
        onCollectionSelect={mockOnCollectionSelect}
        onExpand={mockOnExpand}
      />
    )

    const stagingButton = screen.getByRole('button', { name: /staging ▲/ })
    const productionButton = screen.getByRole('button', { name: /production ▲/ })

    expect(stagingButton).toHaveClass('bg-emerald-900/30')
    expect(productionButton).not.toHaveClass('bg-emerald-900/30')
  })

  it('shows empty state when no databases', () => {
    render(
      <DatabaseTree
        databases={[]}
        selectedDatabase=""
        onDatabaseSelect={mockOnDatabaseSelect}
        collectionsByDatabase={{}}
        selectedCollections={[]}
        onCollectionSelect={mockOnCollectionSelect}
        onExpand={mockOnExpand}
      />
    )

    expect(screen.getByText('No databases available')).toBeInTheDocument()
  })

  it('shows empty state when no collections for selected database', () => {
    render(
      <DatabaseTree
        databases={['production']}
        selectedDatabase="production"
        onDatabaseSelect={mockOnDatabaseSelect}
        collectionsByDatabase={{
          production: [],
        }}
        selectedCollections={[]}
        onCollectionSelect={mockOnCollectionSelect}
        onExpand={mockOnExpand}
      />
    )

    expect(screen.getByText('No collections available')).toBeInTheDocument()
  })

  it('accepts custom className', () => {
    const { container } = render(
      <DatabaseTree
        databases={['production']}
        selectedDatabase="production"
        onDatabaseSelect={mockOnDatabaseSelect}
        collectionsByDatabase={{
          production: ['users'],
        }}
        selectedCollections={[]}
        onCollectionSelect={mockOnCollectionSelect}
        onExpand={mockOnExpand}
        className="custom-tree"
      />
    )

    expect(container.querySelector('.database-tree')).toHaveClass('custom-tree')
  })

it('passes through divProps', () => {
    const { container } = render(
      <DatabaseTree
        databases={['production']}
        selectedDatabase="production"
        onDatabaseSelect={mockOnDatabaseSelect}
        collectionsByDatabase={{
          production: ['users'],
        }}
        selectedCollections={[]}
        onCollectionSelect={mockOnCollectionSelect}
        onExpand={mockOnExpand}
        divProps={{ id: 'test-tree' }}
      />
    )

    const treeElement = container.querySelector('.database-tree')
    expect(treeElement).toBeInTheDocument()
    expect(treeElement).toHaveAttribute('id', 'test-tree')
  })
})
