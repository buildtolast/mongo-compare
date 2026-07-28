import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CollectionDiscovery } from './CollectionDiscovery'

describe('CollectionDiscovery', () => {
  const mockConnect = vi.fn()
  const mockDisconnect = vi.fn()
  const mockOnCollectionsChange = vi.fn()
  const mockOnPatternChange = vi.fn()
  const mockOnIdentifierChange = vi.fn()
  const mockOnCompositeKeysChange = vi.fn()
  const mockOnSnapshotLoad = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with source and target sections', () => {
    render(
      <CollectionDiscovery
        sourceConnection={{
          connectionString: 'mongodb://localhost:27017',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        targetConnection={{
          connectionString: 'mongodb://localhost:27018',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        sourceConnected={false}
        targetConnected={false}
        onConnect={mockConnect}
        onDisconnect={mockDisconnect}
        sourceCollections={[]}
        targetCollections={[]}
        selectedCollections={{
          source: {
            database: 'test',
            collections: [],
            identifierField: '_id',
          },
          target: {
            database: 'test',
            collections: [],
            identifierField: '_id',
          },
        }}
        onCollectionsChange={mockOnCollectionsChange}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
        onLoadSnapshot={mockOnSnapshotLoad}
        isLoading={false}
      />
    )

    expect(screen.getByText('Source')).toBeInTheDocument()
    expect(screen.getByText('Target')).toBeInTheDocument()
  })

  it('renders connect button when not connected', () => {
    render(
      <CollectionDiscovery
        sourceConnection={{
          connectionString: 'mongodb://localhost:27017',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        targetConnection={{
          connectionString: 'mongodb://localhost:27018',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        sourceConnected={false}
        targetConnected={false}
        onConnect={mockConnect}
        onDisconnect={mockDisconnect}
        sourceCollections={[]}
        targetCollections={[]}
        selectedCollections={{
          source: {
            database: 'test',
            collections: [],
            identifierField: '_id',
          },
          target: {
            database: 'test',
            collections: [],
            identifierField: '_id',
          },
        }}
        onCollectionsChange={mockOnCollectionsChange}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
        onLoadSnapshot={mockOnSnapshotLoad}
        isLoading={false}
      />
    )

    const connectButtons = screen.getAllByRole('button', { name: /Connect/ })
    expect(connectButtons).toHaveLength(1)
  })

  it('renders disconnect button when connected', () => {
    render(
      <CollectionDiscovery
        sourceConnection={{
          connectionString: 'mongodb://localhost:27017',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        targetConnection={{
          connectionString: 'mongodb://localhost:27018',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        sourceConnected={true}
        targetConnected={true}
        onConnect={mockConnect}
        onDisconnect={mockDisconnect}
        sourceCollections={['users', 'orders']}
        targetCollections={['users', 'orders']}
        selectedCollections={{
          source: {
            database: 'test',
            collections: [],
            identifierField: '_id',
          },
          target: {
            database: 'test',
            collections: [],
            identifierField: '_id',
          },
        }}
        onCollectionsChange={mockOnCollectionsChange}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
        onLoadSnapshot={mockOnSnapshotLoad}
        isLoading={false}
      />
    )

    const disconnectButtons = screen.getAllByRole('button', { name: /Disconnect/ })
    expect(disconnectButtons).toHaveLength(1)
  })

  it('calls onConnect when connect button is clicked', () => {
    render(
      <CollectionDiscovery
        sourceConnection={{
          connectionString: 'mongodb://localhost:27017',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        targetConnection={{
          connectionString: 'mongodb://localhost:27018',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        sourceConnected={false}
        targetConnected={false}
        onConnect={mockConnect}
        onDisconnect={mockDisconnect}
        sourceCollections={[]}
        targetCollections={[]}
        selectedCollections={{
          source: {
            database: 'test',
            collections: [],
            identifierField: '_id',
          },
          target: {
            database: 'test',
            collections: [],
            identifierField: '_id',
          },
        }}
        onCollectionsChange={mockOnCollectionsChange}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
        onLoadSnapshot={mockOnSnapshotLoad}
        isLoading={false}
      />
    )

    const connectButtons = screen.getAllByText(/Connect/)
    fireEvent.click(connectButtons[0])

    expect(mockConnect).toHaveBeenCalledWith('source')
  })

  it('calls onDisconnect when disconnect button is clicked', () => {
    render(
      <CollectionDiscovery
        sourceConnection={{
          connectionString: 'mongodb://localhost:27017',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        targetConnection={{
          connectionString: 'mongodb://localhost:27018',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        sourceConnected={true}
        targetConnected={true}
        onConnect={mockConnect}
        onDisconnect={mockDisconnect}
        sourceCollections={['users']}
        targetCollections={['users']}
        selectedCollections={{
          source: {
            database: 'test',
            collections: [],
            identifierField: '_id',
          },
          target: {
            database: 'test',
            collections: [],
            identifierField: '_id',
          },
        }}
        onCollectionsChange={mockOnCollectionsChange}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
        onLoadSnapshot={mockOnSnapshotLoad}
        isLoading={false}
      />
    )

    const disconnectButtons = screen.getAllByText(/Disconnect/)
    fireEvent.click(disconnectButtons[0])

    expect(mockDisconnect).toHaveBeenCalledWith('source')
  })

  it('shows collection list when connected', () => {
    render(
      <CollectionDiscovery
        sourceConnection={{
          connectionString: 'mongodb://localhost:27017',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        targetConnection={{
          connectionString: 'mongodb://localhost:27018',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        sourceConnected={true}
        targetConnected={true}
        onConnect={mockConnect}
        onDisconnect={mockDisconnect}
        sourceCollections={['users', 'orders']}
        targetCollections={['users', 'orders']}
        selectedCollections={{
          source: {
            database: 'testdb',
            collections: [],
            identifierField: '_id',
          },
          target: {
            database: 'testdb',
            collections: [],
            identifierField: '_id',
          },
        }}
        onCollectionsChange={mockOnCollectionsChange}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
        onLoadSnapshot={mockOnSnapshotLoad}
        isLoading={false}
      />
    )

    expect(screen.getByText('users')).toBeInTheDocument()
    expect(screen.getByText('orders')).toBeInTheDocument()
  })

  it('shows loading state when isLoading is true', () => {
    const { container } = render(
      <CollectionDiscovery
        sourceConnection={{
          connectionString: 'mongodb://localhost:27017',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        targetConnection={{
          connectionString: 'mongodb://localhost:27018',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        sourceConnected={true}
        targetConnected={true}
        onConnect={mockConnect}
        onDisconnect={mockDisconnect}
        sourceCollections={['users', 'orders']}
        targetCollections={['users', 'orders']}
        selectedCollections={{
          source: {
            database: 'testdb',
            collections: [],
            identifierField: '_id',
          },
          target: {
            database: 'testdb',
            collections: [],
            identifierField: '_id',
          },
        }}
        onCollectionsChange={mockOnCollectionsChange}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
        onLoadSnapshot={mockOnSnapshotLoad}
        isLoading={true}
      />
    )

    expect(screen.getByText('Loading collections...')).toBeInTheDocument()
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('displays pattern matching input', () => {
    render(
      <CollectionDiscovery
        sourceConnection={{
          connectionString: 'mongodb://localhost:27017',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        targetConnection={{
          connectionString: 'mongodb://localhost:27018',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        sourceConnected={true}
        targetConnected={true}
        onConnect={mockConnect}
        onDisconnect={mockDisconnect}
        sourceCollections={['users', 'orders']}
        targetCollections={['users', 'orders']}
        selectedCollections={{
          source: {
            database: 'testdb',
            collections: [],
            identifierField: '_id',
          },
          target: {
            database: 'testdb',
            collections: [],
            identifierField: '_id',
          },
        }}
        onCollectionsChange={mockOnCollectionsChange}
        pattern="^user"
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
        onLoadSnapshot={mockOnSnapshotLoad}
        isLoading={false}
      />
    )

    const patternInput = screen.getByPlaceholderText('Filter collections (regex)...')
    expect(patternInput).toBeInTheDocument()
    expect(patternInput).toHaveValue('^user')
  })

  it('calls onPatternChange when pattern input changes', () => {
    render(
      <CollectionDiscovery
        sourceConnection={{
          connectionString: 'mongodb://localhost:27017',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        targetConnection={{
          connectionString: 'mongodb://localhost:27018',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        sourceConnected={true}
        targetConnected={true}
        onConnect={mockConnect}
        onDisconnect={mockDisconnect}
        sourceCollections={['users', 'orders']}
        targetCollections={['users', 'orders']}
        selectedCollections={{
          source: {
            database: 'test',
            collections: [],
            identifierField: '_id',
          },
          target: {
            database: 'test',
            collections: [],
            identifierField: '_id',
          },
        }}
        onCollectionsChange={mockOnCollectionsChange}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
        onLoadSnapshot={mockOnSnapshotLoad}
        isLoading={false}
      />
    )

    const patternInput = screen.getByPlaceholderText('Filter collections (regex)...')
    fireEvent.change(patternInput, { target: { value: '^user' } })

    expect(mockOnPatternChange).toHaveBeenCalledWith('source', '^user')
  })

  it('displays identifier field selector', () => {
    render(
      <CollectionDiscovery
        sourceConnection={{
          connectionString: 'mongodb://localhost:27017',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        targetConnection={{
          connectionString: 'mongodb://localhost:27018',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        sourceConnected={true}
        targetConnected={true}
        onConnect={mockConnect}
        onDisconnect={mockDisconnect}
        sourceCollections={['users', 'orders']}
        targetCollections={['users', 'orders']}
        selectedCollections={{
          source: {
            database: 'test',
            collections: [],
            identifierField: '_id',
          },
          target: {
            database: 'test',
            collections: [],
            identifierField: '_id',
          },
        }}
        onCollectionsChange={mockOnCollectionsChange}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
        onLoadSnapshot={mockOnSnapshotLoad}
        isLoading={false}
      />
    )

    const identifierSelect = screen.getByRole('combobox')
    expect(identifierSelect).toBeInTheDocument()
    expect(identifierSelect).toHaveValue('_id')
  })

  it('calls onIdentifierChange when identifier field changes', () => {
    render(
      <CollectionDiscovery
        sourceConnection={{
          connectionString: 'mongodb://localhost:27017',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        targetConnection={{
          connectionString: 'mongodb://localhost:27018',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        sourceConnected={true}
        targetConnected={true}
        onConnect={mockConnect}
        onDisconnect={mockDisconnect}
        sourceCollections={['users', 'orders']}
        targetCollections={['users', 'orders']}
        selectedCollections={{
          source: {
            database: 'test',
            collections: [],
            identifierField: '_id',
          },
          target: {
            database: 'test',
            collections: [],
            identifierField: '_id',
          },
        }}
        onCollectionsChange={mockOnCollectionsChange}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
        onLoadSnapshot={mockOnSnapshotLoad}
        isLoading={false}
      />
    )

    const identifierSelect = screen.getByRole('combobox')
    fireEvent.change(identifierSelect, { target: { value: 'id' } })

    expect(mockOnIdentifierChange).toHaveBeenCalledWith('source', 'id')
  })

  it('displays composite keys input field', () => {
    render(
      <CollectionDiscovery
        sourceConnection={{
          connectionString: 'mongodb://localhost:27017',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        targetConnection={{
          connectionString: 'mongodb://localhost:27018',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        sourceConnected={true}
        targetConnected={true}
        onConnect={mockConnect}
        onDisconnect={mockDisconnect}
        sourceCollections={['users', 'orders']}
        targetCollections={['users', 'orders']}
        selectedCollections={{
          source: {
            database: 'test',
            collections: [],
            identifierField: '_id',
          },
          target: {
            database: 'test',
            collections: [],
            identifierField: '_id',
          },
        }}
        onCollectionsChange={mockOnCollectionsChange}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys="field1,field2"
        onCompositeKeysChange={mockOnCompositeKeysChange}
        onLoadSnapshot={mockOnSnapshotLoad}
        isLoading={false}
      />
    )

    const compositeKeysInput = screen.getByPlaceholderText('Enter comma-separated fields...')
    expect(compositeKeysInput).toBeInTheDocument()
    expect(compositeKeysInput).toHaveValue('field1,field2')
  })

  it('calls onCompositeKeysChange when composite keys input changes', () => {
    render(
      <CollectionDiscovery
        sourceConnection={{
          connectionString: 'mongodb://localhost:27017',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        targetConnection={{
          connectionString: 'mongodb://localhost:27018',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        sourceConnected={true}
        targetConnected={true}
        onConnect={mockConnect}
        onDisconnect={mockDisconnect}
        sourceCollections={['users', 'orders']}
        targetCollections={['users', 'orders']}
        selectedCollections={{
          source: {
            database: 'test',
            collections: [],
            identifierField: '_id',
          },
          target: {
            database: 'test',
            collections: [],
            identifierField: '_id',
          },
        }}
        onCollectionsChange={mockOnCollectionsChange}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
        onLoadSnapshot={mockOnSnapshotLoad}
        isLoading={false}
      />
    )

    const compositeKeysInput = screen.getByPlaceholderText('Enter comma-separated fields...')
    fireEvent.change(compositeKeysInput, { target: { value: 'field1,field2' } })

    expect(mockOnCompositeKeysChange).toHaveBeenCalledWith('source', 'field1,field2')
  })

  it('displays Load Snapshot button', () => {
    render(
      <CollectionDiscovery
        sourceConnection={{
          connectionString: 'mongodb://localhost:27017',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        targetConnection={{
          connectionString: 'mongodb://localhost:27018',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        sourceConnected={false}
        targetConnected={false}
        onConnect={mockConnect}
        onDisconnect={mockDisconnect}
        sourceCollections={[]}
        targetCollections={[]}
        selectedCollections={{
          source: {
            database: 'test',
            collections: [],
            identifierField: '_id',
          },
          target: {
            database: 'test',
            collections: [],
            identifierField: '_id',
          },
        }}
        onCollectionsChange={mockOnCollectionsChange}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
        onLoadSnapshot={mockOnSnapshotLoad}
        isLoading={false}
      />
    )

    expect(screen.getByText('Load Snapshot')).toBeInTheDocument()
  })

  it('calls onLoadSnapshot when Load Snapshot button is clicked', () => {
    render(
      <CollectionDiscovery
        sourceConnection={{
          connectionString: 'mongodb://localhost:27017',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        targetConnection={{
          connectionString: 'mongodb://localhost:27018',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        sourceConnected={false}
        targetConnected={false}
        onConnect={mockConnect}
        onDisconnect={mockDisconnect}
        sourceCollections={[]}
        targetCollections={[]}
        selectedCollections={{
          source: {
            database: 'test',
            collections: [],
            identifierField: '_id',
          },
          target: {
            database: 'test',
            collections: [],
            identifierField: '_id',
          },
        }}
        onCollectionsChange={mockOnCollectionsChange}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
        onLoadSnapshot={mockOnSnapshotLoad}
        isLoading={false}
      />
    )

    fireEvent.click(screen.getByText('Load Snapshot'))

    expect(mockOnSnapshotLoad).toHaveBeenCalled()
  })

  it('applies custom className', () => {
    const { container } = render(
      <CollectionDiscovery
        sourceConnection={{
          connectionString: 'mongodb://localhost:27017',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        targetConnection={{
          connectionString: 'mongodb://localhost:27018',
          username: '',
          password: '',
          authDatabase: 'admin',
          database: 'testdb',
          tls: false,
          poolSize: 10,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          serverSelectionTimeoutMS: 30000,
        }}
        sourceConnected={false}
        targetConnected={false}
        onConnect={mockConnect}
        onDisconnect={mockDisconnect}
        sourceCollections={[]}
        targetCollections={[]}
        selectedCollections={{
          source: {
            database: 'test',
            collections: [],
            identifierField: '_id',
          },
          target: {
            database: 'test',
            collections: [],
            identifierField: '_id',
          },
        }}
        onCollectionsChange={mockOnCollectionsChange}
        pattern=""
        onPatternChange={mockOnPatternChange}
        identifierField="_id"
        onIdentifierChange={mockOnIdentifierChange}
        compositeKeys=""
        onCompositeKeysChange={mockOnCompositeKeysChange}
        onLoadSnapshot={mockOnSnapshotLoad}
        isLoading={false}
        className="custom-discovery"
      />
    )

    expect(container.querySelector('.collection-discovery')).toHaveClass('custom-discovery')
  })
})
