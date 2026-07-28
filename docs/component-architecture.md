# MongoDB Diff UI - Component Architecture

## Overview

A React-based desktop/web application for comparing live MongoDB instances with full diff output and multiple export formats.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **State Management**: Context API + useReducer (lightweight) or Zustand (if scaling)
- **Styling**: Tailwind CSS + CSS Modules for component isolation
- **MongoDB Driver**: mongodb (Node.js) for backend, official MongoDB drivers for browser
- **Diff Engine**: Existing CLI library (`@mongo-compare/core`) or reimplementation
- **Export**: json2csv, html-template-libraries (Pug/EJS) or client-side generation
- **Monitoring**: MongoDB Change Streams + WebSockets for real-time updates

## Application Structure

```
src/
├── app/                    # Route-level components
│   ├── App.tsx
│   ├── routes/
│   │   ├── Connection.tsx  # Connection configuration
│   │   ├── Collections.tsx # Collection selection
│   │   ├── Results.tsx     # Comparison results
│   │   └── Export.tsx      # Export options
│   └── contexts/
│       ├── ConnectionContext.tsx
│       ├── SnapshotContext.tsx
│       └── ComparisonContext.tsx
│
├── components/             # Reusable UI components
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Checkbox.tsx
│   │   ├── Tabs.tsx
│   │   └── Modal.tsx
│   │
│   ├── connection/
│   │   ├── ConnectionForm.tsx
│   │   ├── AuthSection.tsx
│   │   └── PoolConfig.tsx
│   │
│   ├── collection/
│   │   ├── DatabaseTree.tsx
│   │   ├── CollectionList.tsx
│   │   ├── PatternInput.tsx
│   │   └── IdentifierSelector.tsx
│   │
│   ├── results/
│   │   ├── SummaryStats.tsx
│   │   ├── DiffList.tsx
│   │   ├── SideBySideDiff.tsx
│   │   ├── ColorDiff.tsx
│   │   └── ExportOptions.tsx
│   │
│   └── monitoring/
│       ├── MonitorControls.tsx
│       ├── SnapshotManager.tsx
│       └── RealTimeDiff.tsx
│
├── hooks/                  # Custom React hooks
│   ├── useMongoConnection.ts
│   ├── useCollectionDiscovery.ts
│   ├── useComparison.ts
│   ├── useExport.ts
│   └── useMonitoring.ts
│
├── services/               # Business logic & API calls
│   ├── mongoClient.ts      # MongoDB connection management
│   ├── diffEngine.ts       # Diff computation
│   ├── snapshotService.ts  # Snapshot CRUD
│   └── exportService.ts    # Export format generation
│
├── types/                  # TypeScript definitions
│   ├── connection.ts
│   ├── collection.ts
│   ├── diff.ts
│   ├── export.ts
│   └── snapshot.ts
│
└── utils/                  # Utility functions
    ├── formatDiff.ts
    ├── validateInput.ts
    └── helpers.ts
```

## Core Components

### 1. Connection Configuration

```typescript
// ConnectionForm.tsx
interface ConnectionFormProps {
  connection: ConnectionConfig
  onChange: (config: ConnectionConfig) => void
  testConnection: () => Promise<boolean>
}

// Features:
// - Source and target instance inputs
// - Authentication fields (username, password, auth DB)
// - TLS/SSL toggle
// - Connection pool settings (size, timeouts)
// - Test connection button
// - Save as snapshot button
```

### 2. Collection Selection

```typescript
// CollectionList.tsx
interface CollectionListProps {
  database: string
  instanceLabel: 'source' | 'target'
  selectedCollections: string[]
  onToggleCollection: (collection: string) => void
  onPatternChange: (pattern: string) => void
}

// Features:
// - Database tree explorer (expandable)
// - Collection checkboxes with "select all"
// - Pattern matching input (regex)
// - Identifier field selector (auto-detect + manual)
// - Composite key configuration
```

### 3. Results Summary

```typescript
// SummaryStats.tsx
interface SummaryStatsProps {
  results: ComparisonResult
  onExport: (format: ExportFormat) => void
  onToggleMonitoring: () => void
}

// Stats Cards:
// - Created documents (green)
// - Updated documents (yellow)
// - Deleted documents (red)

// Export Buttons:
// - JSON (full structured data)
// - CSV (tabular format)
// - HTML (interactive visual report)
```

### 4. Diff Viewers

```typescript
// SideBySideDiff.tsx
interface SideBySideDiffProps {
  sourceDoc: Document
  targetDoc: Document
  diff: DocumentDiff
}

// ColorDiff.tsx
interface ColorDiffProps {
  diff: DocumentDiff
  original: Document
  modified: Document
}

// Features:
// - Two view modes: side-by-side and unified
// - Color-coded highlighting (green/red/yellow)
// - Expand/collapse nested fields
// - Field-level change indicators
```

### 5. Snapshot Management

```typescript
// SnapshotManager.tsx
interface SnapshotManagerProps {
  snapshots: Snapshot[]
  onLoad: (snapshot: Snapshot) => void
  onSave: (snapshot: Snapshot) => void
  onDelete: (id: string) => void
}

// Features:
// - List of saved snapshots
// - Load snapshot functionality
// - Save current configuration
// - Delete snapshot
// - Edit snapshot metadata
```

### 6. Monitoring Controls

```typescript
// MonitorControls.tsx
interface MonitorControlsProps {
  isMonitoring: boolean
  onToggle: () => void
  lastUpdate: Date | null
  onChangeDetected: (changes: DiffSummary) => void
}

// Features:
// - Toggle monitoring on/off
// - Real-time change detection via change streams
// - Manual refresh button
// - Change notification system
```

## State Management

### ConnectionContext

```typescript
interface ConnectionState {
  source: ConnectionConfig
  target: ConnectionConfig
  sourceConnected: boolean
  targetConnected: boolean
  databases: string[]
}

type ConnectionAction =
  | { type: 'SET_SOURCE'; payload: ConnectionConfig }
  | { type: 'SET_TARGET'; payload: ConnectionConfig }
  | { type: 'SET_CONNECTED'; payload: { instance: 'source' | 'target'; connected: boolean } }
  | { type: 'SET_DATABASES'; payload: string[] }
```

### ComparisonContext

```typescript
interface ComparisonState {
  collections: CollectionSelector
  identifierField: string
  results: ComparisonResult | null
  loading: boolean
  error: string | null
}

type ComparisonAction =
  | { type: 'SET_COLLECTIONS'; payload: CollectionSelector }
  | { type: 'SET_IDENTIFIER'; payload: string }
  | { type: 'SET_RESULTS'; payload: ComparisonResult }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
```

### SnapshotContext

```typescript
interface SnapshotState {
  snapshots: Snapshot[]
  currentSnapshot: Snapshot | null
}

type SnapshotAction =
  | { type: 'LOAD_SNAPSHOTS' }
  | { type: 'SAVE_SNAPSHOT'; payload: Snapshot }
  | { type: 'DELETE_SNAPSHOT'; payload: string }
  | { type: 'SET_CURRENT'; payload: Snapshot | null }
```

## Services

### mongoClient.ts

```typescript
export class MongoDBClient {
  private connections: Map<string, Db>
  
  async connect(connectionString: string, config: ConnectionConfig): Promise<Db>
  async disconnect(connectionString: string): Promise<void>
  async getDatabases(connectionString: string): Promise<string[]>
  async getCollections(connectionString: string, database: string): Promise<string[]>
  async getSampleDocument(connectionString: string, database: string, collection: string): Promise<Document | null>
  
  // Connection pool management
  private createConnectionPool(connectionString: string, config: ConnectionConfig): Db
  private cleanupConnection(connectionString: string): void
}
```

### diffEngine.ts

```typescript
export class DiffEngine {
  async compareCollections(
    sourceClient: MongoDBClient,
    targetClient: MongoDBClient,
    config: ComparisonConfig
  ): Promise<ComparisonResult> {
    // 1. Fetch all documents from both collections
    // 2. Build hash map for source documents by identifier
    // 3. Iterate through target documents and match
    // 4. Detect created, updated, deleted
    // 5. Generate detailed field-level diffs
    // 6. Return comparison result
  }
  
  private recursiveDiff(source: Document, target: Document, path: string = ''): ChangedField[]
  private matchDocuments(sourceDocs: Document[], targetDocs: Document[], identifier: string): MatchResult
}
```

### snapshotService.ts

```typescript
export class SnapshotService {
  private storage: Storage // localStorage or file system
  
  async save(snapshot: Snapshot): Promise<void>
  async load(): Promise<Snapshot[]>
  async delete(id: string): Promise<void>
  async export(snapshot: Snapshot): Promise<string> // JSON string
  async import(data: string): Promise<Snapshot>
}
```

### exportService.ts

```typescript
export class ExportService {
  async exportJSON(result: ComparisonResult): Promise<Blob>
  async exportCSV(result: ComparisonResult): Promise<Blob>
  async exportHTML(result: ComparisonResult): Promise<Blob> {
    // Generate HTML with embedded JSON data
    // Include interactive diff viewers
    // Add color-coded highlighting
    // Include summary stats
  }
  
  private generateHTMLTemplate(result: ComparisonResult): string
  private embedDiffData(result: ComparisonResult): string
}
```

## Hooks

### useMongoConnection

```typescript
function useMongoConnection() {
  const [connection, setConnection] = useState<ConnectionConfig | null>(null)
  const [connected, setConnected] = useState(false)
  const [databases, setDatabases] = useState<string[]>([])
  
  const connect = useCallback(async (config: ConnectionConfig) => {
    // Connect to MongoDB
    // Fetch databases
    // Update state
  }, [])
  
  const disconnect = useCallback(async () => {
    // Close connection
    // Reset state
  }, [])
  
  return { connect, disconnect, connected, databases }
}
```

### useComparison

```typescript
function useComparison() {
  const [results, setResults] = useState<ComparisonResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const runComparison = useCallback(async (config: ComparisonConfig) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await diffEngine.compareCollections(config)
      setResults(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])
  
  return { results, loading, error, runComparison }
}
```

## Data Flow

```
1. User configures connection → ConnectionContext updated
2. User selects collections → ComparisonContext updated
3. User runs comparison → DiffEngine processes
4. Results stored in ComparisonContext
5. User views diff → DiffViewer components render
6. User exports → ExportService generates file
```

## Real-time Monitoring Flow

```
1. Monitoring enabled → MongoDB change streams opened
2. Changes detected → Change event received
3. Diff computed on-the-fly → Real-time diff generated
4. UI updated → Notification shown
5. User can view changes → Diff viewer opens
```

## Performance Considerations

1. **Large Collections**:
   - Pagination for document lists
   - Virtual scrolling for diff lists
   - Batch processing for diff computation
   - Web Workers for heavy diff operations

2. **Memory Management**:
   - Stream processing instead of loading all docs
   - Garbage collection for old comparison results
   - Lazy loading of nested field details

3. **Rendering Optimization**:
   - React.memo for pure components
   - useMemo for expensive computations
   - useCallback for event handlers
   - Virtualization for long lists

## Accessibility

- Full keyboard navigation
- ARIA labels for interactive elements
- Color contrast compliance
- Screen reader support for diff content
- Focus management in modals

## Future Extensibility

1. **Additional Export Formats**:
   - XML
   - Markdown
   - PDF (via HTML-to-PDF conversion)

2. **Advanced Comparison Modes**:
   - Field-level sampling
   - Custom diff strategies
   - Performance comparison metrics

3. **Collaboration Features**:
   - Share comparison results
   - Export to cloud storage
   - Team snapshot sharing

4. **Analytics**:
   - Change tracking over time
   - Trend analysis
   - Alerting on specific changes
