import { useState, useCallback } from 'react'
import { CollectionList } from './CollectionList'
import { Button } from '@/components/common/Button'
import { ConnectionConfig } from '@/types'
import type { CollectionSelector } from '@/types'

export interface CollectionDiscoveryProps {
  sourceConnection: ConnectionConfig
  targetConnection: ConnectionConfig
  sourceConnected: boolean
  targetConnected: boolean
  onConnect: (connectionType: 'source' | 'target') => Promise<void>
  onDisconnect: (connectionType: 'source' | 'target') => void
  sourceCollections: string[]
  targetCollections: string[]
  selectedCollections: {
    source: CollectionSelector
    target: CollectionSelector
  }
  onCollectionsChange: (
    connectionType: 'source' | 'target',
    collections: string[]
  ) => void
  pattern: string
  onPatternChange: (connectionType: 'source' | 'target', pattern: string) => void
  identifierField: string
  onIdentifierChange: (connectionType: 'source' | 'target', field: string) => void
  compositeKeys: string
  onCompositeKeysChange: (connectionType: 'source' | 'target', keys: string) => void
  onLoadSnapshot: () => void
  isLoading?: boolean
  className?: string
  divProps?: React.HTMLAttributes<HTMLDivElement>
}

export function CollectionDiscovery({
  sourceConnection,
  targetConnection,
  sourceConnected,
  targetConnected,
  onConnect,
  onDisconnect,
  sourceCollections,
  targetCollections,
  selectedCollections,
  onCollectionsChange,
pattern,
        onPatternChange,
        onIdentifierChange,
  compositeKeys,
  onCompositeKeysChange,
  onLoadSnapshot,
  isLoading = false,
  className = '',
  divProps,
}: CollectionDiscoveryProps) {
  const [activeTab, setActiveTab] = useState<'source' | 'target'>('source')

  const handleCollectionSelect = useCallback(
    (connectionType: 'source' | 'target', collection: string, selected: boolean) => {
      const currentCollections =
        connectionType === 'source'
          ? selectedCollections.source.collections
          : selectedCollections.target.collections
      const newCollections = selected
        ? [...currentCollections, collection]
        : currentCollections.filter((c) => c !== collection)
      onCollectionsChange(connectionType, newCollections)
    },
    [selectedCollections, onCollectionsChange]
  )

  const _handleDatabaseSelect = useCallback(
    (_connectionType: 'source' | 'target', _database: string) => {
      const currentCollections =
        _connectionType === 'source'
          ? selectedCollections.source.collections
          : selectedCollections.target.collections
      const newCollections = currentCollections.filter((c) =>
        sourceConnected ? sourceCollections.includes(c) : targetCollections.includes(c)
      )
      onCollectionsChange(_connectionType, newCollections)
    },
    [
      selectedCollections,
      onCollectionsChange,
      sourceConnected,
      sourceCollections,
      targetCollections,
    ]
  )

  const handlePatternChange = useCallback(
    (connectionType: 'source' | 'target', newPattern: string) => {
      onPatternChange(connectionType, newPattern)
    },
    [onPatternChange]
  )

  const handleIdentifierChange = useCallback(
    (connectionType: 'source' | 'target', field: string) => {
      onIdentifierChange(connectionType, field)
    },
    [onIdentifierChange]
  )

  const handleCompositeKeysChange = useCallback(
    (connectionType: 'source' | 'target', keys: string) => {
      onCompositeKeysChange(connectionType, keys)
    },
    [onCompositeKeysChange]
  )

  const handleConnect = async (connectionType: 'source' | 'target') => {
    await onConnect(connectionType)
  }

  const handleDisconnect = (connectionType: 'source' | 'target') => {
    onDisconnect(connectionType)
  }

  const handleTabChange = (tab: 'source' | 'target') => {
    setActiveTab(tab)
  }

  const currentCollections =
    activeTab === 'source' ? sourceCollections : targetCollections
  const currentSelected =
    activeTab === 'source'
      ? selectedCollections.source.collections
      : selectedCollections.target.collections
  const currentConnected = activeTab === 'source' ? sourceConnected : targetConnected
  const currentConnection =
    activeTab === 'source' ? sourceConnection : targetConnection
  const currentPattern =
    activeTab === 'source' ? pattern : selectedCollections.target.pattern || ''
  const currentIdentifier =
    activeTab === 'source'
      ? selectedCollections.source.identifierField
      : selectedCollections.target.identifierField
  const currentCompositeKeys =
    activeTab === 'source'
      ? compositeKeys
      : compositeKeys

  const _handleCollectionsChange = (
    connectionType: 'source' | 'target',
    collections: string[]
  ) => {
    onCollectionsChange(connectionType, collections)
  }

  return (
    <div
      className={`collection-discovery space-y-6 ${className}`}
      data-testid="collection-discovery"
      {...divProps}
    >
      <div className="space-y-4">
        <div className="flex space-x-2">
          <button
            onClick={() => handleTabChange('source')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'source'
                ? 'bg-[var(--accent)] text-[var(--accent-text)]'
                : 'bg-[var(--panel)] text-[var(--text-muted)] hover:bg-[var(--panel-2)]'
            }`}
          >
            Source
          </button>
          <button
            onClick={() => handleTabChange('target')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'target'
                ? 'bg-[var(--accent)] text-[var(--accent-text)]'
                : 'bg-[var(--panel)] text-[var(--text-muted)] hover:bg-[var(--panel-2)]'
            }`}
          >
            Target
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-[var(--text-muted)]">
            {currentConnected ? (
              <span className="text-[var(--accent)] flex items-center">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] mr-2"></span>
                Connected: {currentConnection.connectionString}
              </span>
            ) : (
              <span className="text-[var(--danger)] flex items-center">
                <span className="w-2 h-2 rounded-full bg-[var(--danger)] mr-2"></span>
                Not connected
              </span>
            )}
          </div>

          {currentConnected ? (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDisconnect(activeTab)}
            >
              Disconnect
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleConnect(activeTab)}
              isLoading={isLoading}
            >
              Connect
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <CollectionList
          collections={currentCollections}
          selectedCollections={currentSelected}
          onSelect={(collection, selected) =>
            handleCollectionSelect(activeTab, collection, selected)
          }
          pattern={currentPattern}
          onPatternChange={(p) => handlePatternChange(activeTab, p)}
          identifierField={currentIdentifier}
          onIdentifierChange={(f) => handleIdentifierChange(activeTab, f)}
          compositeKeys={currentCompositeKeys}
          onCompositeKeysChange={(k) => handleCompositeKeysChange(activeTab, k)}
          isLoading={isLoading}
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
        <Button variant="secondary" size="sm" onClick={onLoadSnapshot}>
          Load Snapshot
        </Button>

        <div className="text-xs text-[var(--text-muted)]">
          {currentSelected.length} of {currentCollections.length} collections selected
        </div>
      </div>
    </div>
  )
}
