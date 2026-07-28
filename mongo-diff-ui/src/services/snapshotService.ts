import type { Snapshot } from '@/types/snapshot'

export class SnapshotService {
  private readonly STORAGE_KEY = 'mongo-diff-snapshots'

  async save(snapshot: Snapshot): Promise<void> {
    const snapshots = await this.load()
    const snapshotToSave = {
      ...snapshot,
      id: snapshot.id || crypto.randomUUID(),
    }
    const existingIndex = snapshots.findIndex((s) => s.id === snapshotToSave.id)
    
    if (existingIndex >= 0) {
      snapshots[existingIndex] = snapshotToSave
    } else {
      snapshots.push(snapshotToSave)
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(snapshots))
  }

  async load(): Promise<Snapshot[]> {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) {
      return []
    }

    try {
      const snapshots: Snapshot[] = JSON.parse(stored)
      return snapshots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } catch {
      return []
    }
  }

  async delete(id: string): Promise<void> {
    const snapshots = await this.load()
    const filtered = snapshots.filter((s) => s.id !== id)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
  }

  async clear(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY)
  }
}
