import { useState } from 'react'
import { Checkbox } from '@/components/common/Checkbox'

export interface DatabaseTreeProps {
  databases: string[]
  selectedDatabase: string
  onDatabaseSelect: (database: string) => void
  collectionsByDatabase: Record<string, string[]>
  selectedCollections: string[]
  onCollectionSelect: (database: string, collection: string, selected: boolean) => void
  onExpand?: (database: string) => void
  isLoading?: boolean
  className?: string
  divProps?: React.HTMLAttributes<HTMLDivElement>
}

export function DatabaseTree({
  databases,
  selectedDatabase,
  onDatabaseSelect,
  collectionsByDatabase,
  selectedCollections,
  onCollectionSelect,
  onExpand,
  isLoading = false,
  className = '',
  divProps,
}: DatabaseTreeProps) {
  const [expandedDatabases, setExpandedDatabases] = useState<Set<string>>(new Set())

  const toggleExpand = (database: string) => {
    const newExpanded = new Set(expandedDatabases)
    if (newExpanded.has(database)) {
      newExpanded.delete(database)
    } else {
      newExpanded.add(database)
    }
    setExpandedDatabases(newExpanded)
    onExpand?.(database)
  }

  const handleDatabaseClick = (database: string) => {
    onDatabaseSelect(database)
    if (collectionsByDatabase[database]?.length > 0) {
      toggleExpand(database)
    }
  }

  const handleCollectionChange = (collection: string, checked: boolean) => {
    onCollectionSelect(selectedDatabase, collection, checked)
  }

  const handleSelectAll = () => {
    const collections = collectionsByDatabase[selectedDatabase] || []
    collections.forEach((collection) => handleCollectionChange(collection, true))
  }

  const handleSelectNone = () => {
    const collections = collectionsByDatabase[selectedDatabase] || []
    collections.forEach((collection) => handleCollectionChange(collection, false))
  }

  const _currentCollections = collectionsByDatabase[selectedDatabase] || []

  return (
    <div
      className={`database-tree space-y-3 ${isLoading ? 'opacity-50' : ''} ${className}`}
      {...(divProps || {})}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-emerald-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Loading databases...</span>
        </div>
      ) : databases.length === 0 ? (
        <div className="text-sm text-slate-500 text-center py-4 bg-slate-800/50 rounded-lg border border-slate-700">
          No databases available
        </div>
      ) : (
        <>
          <div className="space-y-1">
            {databases.map((database) => (
              <div key={database} className="space-y-1">
                <button
                  onClick={() => handleDatabaseClick(database)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    selectedDatabase === database
                      ? 'bg-emerald-900/30 border border-emerald-600'
                      : 'hover:bg-slate-800'
                  }`}
                >
                  <span className="text-sm font-medium text-slate-200">{database}</span>
                  {collectionsByDatabase[database]?.length > 0 && (
                    <span className="text-xs text-slate-400">
                      {expandedDatabases.has(database) ? '▼' : '▲'}
                    </span>
                  )}
                </button>

                {collectionsByDatabase[database]?.length === 0 && (
                  <div className="pl-4 text-xs text-slate-500 italic">
                    No collections available
                  </div>
                )}

                {expandedDatabases.has(database) &&
                  collectionsByDatabase[database]?.length > 0 && (
                    <div className="pl-4 space-y-1 border-l border-slate-700 ml-3">
                      <div className="flex space-x-2 mb-2">
                        <button
                          onClick={handleSelectAll}
                          className="text-xs text-emerald-500 hover:text-emerald-400"
                        >
                          Select All
                        </button>
                        <button
                          onClick={handleSelectNone}
                          className="text-xs text-emerald-500 hover:text-emerald-400"
                        >
                          Select None
                        </button>
                      </div>

                      {collectionsByDatabase[database].map((collection) => (
                        <Checkbox
                          key={collection}
                          id={`${database}-${collection}`}
                          label={collection}
                          checked={selectedCollections.includes(collection)}
                          onChange={(checked) => handleCollectionChange(collection, checked)}
                          className="collection-checkbox"
                        />
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
