import { useState, useEffect } from 'react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { SnapshotService } from '@/services/snapshotService'
import type { Snapshot } from '@/types/snapshot'
import type { ConnectionState } from '@/contexts/ConnectionContext'

interface SnapshotManagerProps {
  onSaveSuccess?: () => void
  snapshotService?: SnapshotService
}

export function SnapshotManager({ onSaveSuccess, snapshotService: propService }: SnapshotManagerProps) {
  const snapshotServiceInstance = propService || new SnapshotService()
  
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [snapshotToDelete, setSnapshotToDelete] = useState<string | null>(null)
  
  const [saveName, setSaveName] = useState('')
  const [saveDescription, setSaveDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [saveError, setSaveError] = useState<string | undefined>()
  const state: ConnectionState = {
    source: { connectionString: '', database: '', username: '', password: '', authDatabase: '', tls: false, poolSize: 10, connectTimeoutMS: 10000, socketTimeoutMS: 30000, serverSelectionTimeoutMS: 30000 },
    target: { connectionString: '', database: '', username: '', password: '', authDatabase: '', tls: false, poolSize: 10, connectTimeoutMS: 10000, socketTimeoutMS: 30000, serverSelectionTimeoutMS: 30000 },
    sourceConnected: false,
    targetConnected: false,
    databases: []
  }

  useEffect(() => {
    loadSnapshots()
  }, [])

  const loadSnapshots = async () => {
    const loaded = await snapshotServiceInstance.load()
    setSnapshots(loaded)
  }

  const handleSaveSnapshot = async () => {
    if (!saveName.trim()) {
      setSaveError('Name is required')
      return
    }

    setSaveError(undefined)
    setIsLoading(true)

    try {
      const snapshot: Snapshot = {
        id: crypto.randomUUID(),
        name: saveName,
        description: saveDescription || undefined,
        createdAt: new Date().toISOString(),
        config: {
          source: state.source,
          target: state.target,
          collections: {
            database: state.source.database || 'testdb',
            collections: [],
            identifierField: '_id',
          },
        },
      }

      await snapshotServiceInstance.save(snapshot)
      setSaveName('')
      setSaveDescription('')
      setIsModalOpen(false)
      loadSnapshots()
      onSaveSuccess?.()
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadSnapshot = async (snapshot: Snapshot) => {
    setIsLoading(true)

    try {
      const _source = snapshot.config.source
      const _target = snapshot.config.target
      const _sourceConnected = false
      const _targetConnected = false

      const _dispatch = (_action: { type?: string }) => {
        // This would be called via context dispatch
      }

      // We need to dispatch actions to update the connection context
      // This will be handled by passing the snapshot data back to parent
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setSnapshotToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!snapshotToDelete) return

    setIsLoading(true)

    try {
      await snapshotServiceInstance.delete(snapshotToDelete)
      setSnapshotToDelete(null)
      setIsDeleteModalOpen(false)
      loadSnapshots()
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--accent)]">Saved Snapshots</h2>
          <Button onClick={() => setIsModalOpen(true)} size="sm">
            Save Current Configuration
          </Button>
        </div>

        {snapshots.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-8 text-center">
            <p className="text-[var(--text-muted)]">No snapshots saved yet</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Save your current configuration to quickly restore it later
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {snapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 hover:border-[var(--accent)] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-[var(--accent)]">{snapshot.name}</h3>
                    {snapshot.description && (
                      <p className="mt-1 text-sm text-[var(--text-muted)] line-clamp-2">
                        {snapshot.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleLoadSnapshot(snapshot)}
                    >
                      Load
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => snapshot.id && handleDeleteClick(snapshot.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="mt-3 flex items-center text-xs text-[var(--text-muted)]">
                  <svg
                    className="mr-1.5 h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {formatDate(snapshot.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Snapshot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-[var(--accent)] mb-4">
              Save Current Configuration
            </h3>
            
            <div className="space-y-4">
              <Input
                label="Name"
                placeholder="Enter snapshot name"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                error={saveError}
              />
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[var(--text-2)]">
                  Description
                </label>
                <textarea
                  className="block w-full rounded-lg border border-[var(--border)] bg-[var(--panel)] py-2 px-3 text-[var(--text)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-[var(--accent)] sm:text-sm"
                  rows={3}
                  placeholder="Enter snapshot description (optional)"
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                isLoading={isLoading}
                onClick={handleSaveSnapshot}
              >
                Save Snapshot
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Load Snapshot Confirmation */}
      {isLoadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-[var(--accent)] mb-4">
              Load Snapshot
            </h3>
            <p className="text-[var(--text-2)] mb-6">
              This will replace your current configuration with the saved snapshot. Are you sure?
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setIsLoadModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="success" onClick={() => {}}>
                Load
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-[var(--danger)] mb-4">
              Delete Snapshot
            </h3>
            <p className="text-[var(--text-2)] mb-6">
              Are you sure you want to delete this snapshot? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                isLoading={isLoading}
                onClick={handleConfirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
