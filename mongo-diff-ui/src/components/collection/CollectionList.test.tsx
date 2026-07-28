import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CollectionList } from './CollectionList'

describe('CollectionList', () => {
  const mockOnSelect = vi.fn()
  const mockOnPatternChange = vi.fn()
  const mockOnIdentifierChange = vi.fn()
  const mockOnCompositeKeysChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with collections list', () => {
    const collections = ['users', 'orders', 'products']
    render(
      <CollectionList
        collections={collections}
        selectedCollections={['users']}
        onSelect={mockOnSelect}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
      />
    )

    expect(screen.getByText('users')).toBeInTheDocument()
    expect(screen.getByText('orders')).toBeInTheDocument()
    expect(screen.getByText('products')).toBeInTheDocument()
  })

  it('renders with loading state', () => {
    const { container } = render(
      <CollectionList
        collections={[]}
        selectedCollections={[]}
        onSelect={mockOnSelect}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
        isLoading={true}
      />
    )

    expect(screen.getByText('Loading collections...')).toBeInTheDocument()
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('calls onSelect when collection checkbox is clicked', () => {
    render(
      <CollectionList
        collections={['users', 'orders']}
        selectedCollections={['users']}
        onSelect={mockOnSelect}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
      />
    )

    const ordersCheckbox = screen.getByRole('checkbox', { name: 'orders' })
    fireEvent.click(ordersCheckbox)

    expect(mockOnSelect).toHaveBeenCalledWith('orders', true)
  })

  it('shows all collections as checked when select all is enabled', () => {
    const collections = ['users', 'orders', 'products']
    render(
      <CollectionList
        collections={collections}
        selectedCollections={collections}
        onSelect={mockOnSelect}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
      />
    )

    const allCheckboxes = screen.getAllByRole('checkbox')
    const collectionCheckboxes = allCheckboxes.filter(
      (checkbox) => !['select-all', 'select-none'].includes(checkbox.id || '')
    )

    collectionCheckboxes.forEach((checkbox) => {
      expect(checkbox).toBeChecked()
    })
  })

  it('displays pattern input field', () => {
    render(
      <CollectionList
        collections={['users', 'orders']}
        selectedCollections={[]}
        onSelect={mockOnSelect}
        pattern="^user"
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
      />
    )

    const patternInput = screen.getByPlaceholderText('Filter collections (regex)...')
    expect(patternInput).toBeInTheDocument()
    expect(patternInput).toHaveValue('^user')
  })

  it('calls onPatternChange when pattern input changes', () => {
    render(
      <CollectionList
        collections={['users', 'orders']}
        selectedCollections={[]}
        onSelect={mockOnSelect}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
      />
    )

    const patternInput = screen.getByPlaceholderText('Filter collections (regex)...')
    fireEvent.change(patternInput, { target: { value: '^user' } })

    expect(mockOnPatternChange).toHaveBeenCalledWith('^user')
  })

  it('displays identifier field selector', () => {
    render(
      <CollectionList
        collections={['users', 'orders']}
        selectedCollections={[]}
        onSelect={mockOnSelect}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
      />
    )

    const identifierSelect = screen.getByRole('combobox')
    expect(identifierSelect).toBeInTheDocument()
    expect(identifierSelect).toHaveValue('_id')
  })

  it('calls onIdentifierChange when identifier field changes', () => {
    render(
      <CollectionList
        collections={['users', 'orders']}
        selectedCollections={[]}
        onSelect={mockOnSelect}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
      />
    )

    const identifierSelect = screen.getByRole('combobox')
    fireEvent.change(identifierSelect, { target: { value: 'id' } })

    expect(mockOnIdentifierChange).toHaveBeenCalledWith('id')
  })

  it('includes common identifier field options', () => {
    render(
      <CollectionList
        collections={['users', 'orders']}
        selectedCollections={[]}
        onSelect={mockOnSelect}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
      />
    )

    const identifierSelect = screen.getByRole('combobox')
    fireEvent.click(identifierSelect)

    expect(screen.getByText('_id')).toBeInTheDocument()
    expect(screen.getByText('id')).toBeInTheDocument()
    expect(screen.getByText('ID')).toBeInTheDocument()
  })

  it('displays composite keys input field', () => {
    render(
      <CollectionList
        collections={['users', 'orders']}
        selectedCollections={[]}
        onSelect={mockOnSelect}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys="field1,field2"
        onCompositeKeysChange={mockOnCompositeKeysChange}
      />
    )

    const compositeKeysInput = screen.getByPlaceholderText('Enter comma-separated fields...')
    expect(compositeKeysInput).toBeInTheDocument()
    expect(compositeKeysInput).toHaveValue('field1,field2')
  })

  it('calls onCompositeKeysChange when composite keys input changes', () => {
    render(
      <CollectionList
        collections={['users', 'orders']}
        selectedCollections={[]}
        onSelect={mockOnSelect}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
      />
    )

    const compositeKeysInput = screen.getByPlaceholderText('Enter comma-separated fields...')
    fireEvent.change(compositeKeysInput, { target: { value: 'field1,field2' } })

    expect(mockOnCompositeKeysChange).toHaveBeenCalledWith('field1,field2')
  })

  it('shows "Select All" and "Select None" buttons', () => {
    render(
      <CollectionList
        collections={['users', 'orders']}
        selectedCollections={[]}
        onSelect={mockOnSelect}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
      />
    )

    expect(screen.getByText('Select All')).toBeInTheDocument()
    expect(screen.getByText('Select None')).toBeInTheDocument()
  })

  it('calls onSelect for all collections when Select All is clicked', () => {
    render(
      <CollectionList
        collections={['users', 'orders', 'products']}
        selectedCollections={[]}
        onSelect={mockOnSelect}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
      />
    )

    fireEvent.click(screen.getByText('Select All'))

    expect(mockOnSelect).toHaveBeenCalledWith('users', true)
    expect(mockOnSelect).toHaveBeenCalledWith('orders', true)
    expect(mockOnSelect).toHaveBeenCalledWith('products', true)
  })

  it('calls onSelect for all collections when Select None is clicked', () => {
    render(
      <CollectionList
        collections={['users', 'orders', 'products']}
        selectedCollections={['users', 'orders']}
        onSelect={mockOnSelect}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
      />
    )

    fireEvent.click(screen.getByText('Select None'))

    expect(mockOnSelect).toHaveBeenCalledWith('users', false)
    expect(mockOnSelect).toHaveBeenCalledWith('orders', false)
    expect(mockOnSelect).toHaveBeenCalledWith('products', false)
  })

  it('filters collections based on pattern', () => {
    render(
      <CollectionList
        collections={['users', 'orders', 'user_logs', 'products']}
        selectedCollections={[]}
        onSelect={mockOnSelect}
        pattern="^user"
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
      />
    )

    expect(screen.getByText('users')).toBeInTheDocument()
    expect(screen.getByText('user_logs')).toBeInTheDocument()
    expect(screen.queryByText('orders')).not.toBeInTheDocument()
    expect(screen.queryByText('products')).not.toBeInTheDocument()
  })

  it('applies loading styles when isLoading is true', () => {
    const { container } = render(
      <CollectionList
        collections={[]}
        selectedCollections={[]}
        onSelect={mockOnSelect}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
        isLoading={true}
      />
    )

    const listContainer = container.querySelector('.collection-list')
    expect(listContainer).toBeInTheDocument()
    expect(listContainer).toHaveClass('opacity-50')
  })

  it('does not show collection items when isLoading is true', () => {
    render(
      <CollectionList
        collections={['users', 'orders']}
        selectedCollections={[]}
        onSelect={mockOnSelect}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
        isLoading={true}
      />
    )

    expect(screen.queryByText('users')).not.toBeInTheDocument()
    expect(screen.queryByText('orders')).not.toBeInTheDocument()
  })
})
