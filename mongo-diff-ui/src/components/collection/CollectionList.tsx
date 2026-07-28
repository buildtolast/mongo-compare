import { useState, useMemo, useEffect } from 'react'
import { Checkbox } from '@/components/common/Checkbox'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'

export interface CollectionListProps {
  collections: string[]
  selectedCollections: string[]
  onSelect: (collection: string, selected: boolean) => void
  pattern: string
  onPatternChange: (pattern: string) => void
  identifierField: string
  onIdentifierChange: (field: string) => void
  compositeKeys: string
  onCompositeKeysChange: (keys: string) => void
  isLoading?: boolean
  className?: string
  divProps?: React.HTMLAttributes<HTMLDivElement>
}

const COMMON_IDENTIFIER_FIELDS = ['_id', 'id', 'ID']

export function CollectionList({
  collections,
  selectedCollections,
  onSelect,
  pattern,
  onPatternChange,
  identifierField,
  onIdentifierChange,
  compositeKeys,
  onCompositeKeysChange,
  isLoading = false,
  className = '',
  divProps,
}: CollectionListProps) {
  const [_expanded, setExpanded] = useState(true)

  const filteredCollections = useMemo(() => {
    if (!pattern) return collections
    try {
      const regex = new RegExp(pattern)
      return collections.filter((collection) => regex.test(collection))
    } catch {
      return collections
    }
  }, [collections, pattern])

  const allSelected = filteredCollections.length > 0 && filteredCollections.every((c) => selectedCollections.includes(c))
  const _someSelected = filteredCollections.some((c) => selectedCollections.includes(c)) && !allSelected

  const handleSelectAll = () => {
    if (allSelected) {
      filteredCollections.forEach((collection) => onSelect(collection, false))
    } else {
      filteredCollections.forEach((collection) => onSelect(collection, true))
    }
  }

  const handleSelectNone = () => {
    filteredCollections.forEach((collection) => onSelect(collection, false))
  }

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onIdentifierChange(e.target.value)
  }

  const handleCompositeKeysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCompositeKeysChange(e.target.value)
  }

  useEffect(() => {
    if (isLoading) {
      setExpanded(true)
    }
  }, [isLoading])

  return (
    <div
      className={`collection-list space-y-4 ${isLoading ? 'opacity-50' : ''} ${className}`}
      data-testid="collection-list"
      {...divProps}
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
          <span>Loading collections...</span>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSelectAll}
                disabled={filteredCollections.length === 0}
              >
                Select All
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSelectNone}
                disabled={filteredCollections.length === 0}
              >
                Select None
              </Button>
              <span className="text-sm text-slate-400 ml-auto">
                {selectedCollections.length} of {filteredCollections.length} selected
              </span>
            </div>

            <Input
              label="Pattern Matching"
              placeholder="Filter collections (regex)..."
              value={pattern}
              onChange={(e) => onPatternChange(e.target.value)}
              data-testid="pattern-input"
            />

            <div className="space-y-2">
              {filteredCollections.length === 0 ? (
                <div className="text-sm text-slate-500 text-center py-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  {pattern ? 'No collections match the pattern' : 'No collections available'}
                </div>
              ) : (
                filteredCollections.map((collection) => (
                  <Checkbox
                    key={collection}
                    id={collection}
                    label={collection}
                    checked={selectedCollections.includes(collection)}
                    onChange={(checked) => onSelect(collection, checked)}
                    className="collection-checkbox"
                  />
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-300">
                  Identifier Field
                </label>
                <select
                  value={identifierField}
                  onChange={handleIdentifierChange}
                  className="block w-full rounded-lg border border-slate-600 bg-slate-800 py-2 px-3 text-slate-100 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  data-testid="identifier-select"
                >
                  {COMMON_IDENTIFIER_FIELDS.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-300">
                  Composite Keys
                </label>
                <Input
                  placeholder="Enter comma-separated fields..."
                  value={compositeKeys}
                  onChange={handleCompositeKeysChange}
                  data-testid="composite-keys-input"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
