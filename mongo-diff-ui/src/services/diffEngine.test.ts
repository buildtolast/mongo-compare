import { describe, it, expect, beforeEach } from 'vitest'
import { DiffEngine, DiffStrategy } from './diffEngine'
import type { DocumentDiff, ChangedField } from '@/types'

describe('DiffEngine', () => {
  let engine: DiffEngine

  beforeEach(() => {
    engine = new DiffEngine()
  })

  describe('identifier-based matching', () => {
    it('should identify created documents', () => {
      const sourceDocs: Record<string, unknown>[] = []
      const targetDocs: Record<string, unknown>[] = [{ _id: '1', name: 'Alice' }]
      const identifierField = '_id'

      const result = engine.compare(sourceDocs, targetDocs, identifierField, DiffStrategy.All, [])

      expect(result.created.count).toBe(1)
      expect(result.updated.count).toBe(0)
      expect(result.deleted.count).toBe(0)
    })

    it('should identify deleted documents', () => {
      const sourceDocs: Record<string, unknown>[] = [{ _id: '1', name: 'Alice' }]
      const targetDocs: Record<string, unknown>[] = []
      const identifierField = '_id'

      const result = engine.compare(sourceDocs, targetDocs, identifierField, DiffStrategy.All, [])

      expect(result.created.count).toBe(0)
      expect(result.updated.count).toBe(0)
      expect(result.deleted.count).toBe(1)
    })

    it('should identify updated documents', () => {
      const sourceDocs = [{ _id: '1', name: 'Alice', age: 25 }]
      const targetDocs = [{ _id: '1', name: 'Alice', age: 30 }]
      const identifierField = '_id'

      const result = engine.compare(sourceDocs, targetDocs, identifierField, DiffStrategy.All, [])

      expect(result.created.count).toBe(0)
      expect(result.updated.count).toBe(1)
      expect(result.deleted.count).toBe(0)
    })

    it('should handle mixed scenario with created, updated, and deleted', () => {
      const sourceDocs = [
        { _id: '1', name: 'Alice' },
        { _id: '2', name: 'Bob' },
        { _id: '3', name: 'Charlie' },
      ]
      const targetDocs = [
        { _id: '1', name: 'Alice' },
        { _id: '2', name: 'Bob Updated' },
        { _id: '4', name: 'David' },
      ]
      const identifierField = '_id'

      const result = engine.compare(sourceDocs, targetDocs, identifierField, DiffStrategy.All, [])

      expect(result.created.count).toBe(1)
      expect(result.updated.count).toBe(1)
      expect(result.deleted.count).toBe(1)
    })
  })

  describe('field-level diffs', () => {
    it('should detect field changes with old and new values', () => {
      const sourceDocs = [{ _id: '1', name: 'Alice', age: 25 }]
      const targetDocs = [{ _id: '1', name: 'Alice', age: 30 }]
      const identifierField = '_id'

      const result = engine.compare(sourceDocs, targetDocs, identifierField, DiffStrategy.All, [])

      expect(result.updated.samples[0].changes).toHaveLength(1)
      const change = result.updated.samples[0].changes[0]
      expect(change.path).toBe('age')
      expect(change.oldValue).toBe(25)
      expect(change.newValue).toBe(30)
      expect(change.type).toBe('changed')
    })

    it('should detect added fields', () => {
      const sourceDocs = [{ _id: '1', name: 'Alice' }]
      const targetDocs = [{ _id: '1', name: 'Alice', age: 30 }]
      const identifierField = '_id'

      const result = engine.compare(sourceDocs, targetDocs, identifierField, DiffStrategy.All, [])

      const changes = result.updated.samples[0].changes
      expect(changes).toHaveLength(1)
      expect(changes[0].path).toBe('age')
      expect(changes[0].type).toBe('added')
    })

    it('should detect removed fields', () => {
      const sourceDocs = [{ _id: '1', name: 'Alice', age: 30 }]
      const targetDocs = [{ _id: '1', name: 'Alice' }]
      const identifierField = '_id'

      const result = engine.compare(sourceDocs, targetDocs, identifierField, DiffStrategy.All, [])

      const changes = result.updated.samples[0].changes
      expect(changes).toHaveLength(1)
      expect(changes[0].path).toBe('age')
      expect(changes[0].type).toBe('removed')
    })
  })

  describe('nested field diffing with dot-notation', () => {
    it('should diff nested objects with dot-notation paths', () => {
      const sourceDocs = [{
        _id: '1',
        address: { street: 'Main St', city: 'NYC' },
      }]
      const targetDocs = [{
        _id: '1',
        address: { street: 'Main St', city: 'LA' },
      }]
      const identifierField = '_id'

      const result = engine.compare(sourceDocs, targetDocs, identifierField, DiffStrategy.All, [])

      const changes = result.updated.samples[0].changes
      expect(changes).toHaveLength(1)
      expect(changes[0].path).toBe('address.city')
      expect(changes[0].oldValue).toBe('NYC')
      expect(changes[0].newValue).toBe('LA')
    })

    it('should handle nested objects with multiple changes', () => {
      const sourceDocs = [{
        _id: '1',
        address: { street: 'Main St', city: 'NYC', zip: '10001' },
      }]
      const targetDocs = [{
        _id: '1',
        address: { street: 'Broadway', city: 'NYC', zip: '10001' },
      }]
      const identifierField = '_id'

      const result = engine.compare(sourceDocs, targetDocs, identifierField, DiffStrategy.All, [])

      const changes = result.updated.samples[0].changes
      expect(changes).toHaveLength(1)
      expect(changes[0].path).toBe('address.street')
    })
  })

  describe('diff strategies', () => {
    describe('All strategy', () => {
      it('should compare all fields', () => {
        const sourceDocs = [{ _id: '1', a: 1, b: 2, c: 3 }]
        const targetDocs = [{ _id: '1', a: 1, b: 20, c: 3 }]
        const identifierField = '_id'

        const result = engine.compare(sourceDocs, targetDocs, identifierField, DiffStrategy.All, [])

        expect(result.updated.count).toBe(1)
        expect(result.updated.samples[0].changes).toHaveLength(1)
        expect(result.updated.samples[0].changes[0].path).toBe('b')
      })
    })

    describe('Whitelist strategy', () => {
      it('should only compare whitelisted fields', () => {
        const sourceDocs = [{ _id: '1', a: 1, b: 2, c: 3 }]
        const targetDocs = [{ _id: '1', a: 1, b: 20, c: 30 }]
        const identifierField = '_id'
        const fields = ['a', 'b']

        const result = engine.compare(sourceDocs, targetDocs, identifierField, DiffStrategy.Whitelist, fields)

        expect(result.updated.count).toBe(1)
        expect(result.updated.samples[0].changes).toHaveLength(1)
        expect(result.updated.samples[0].changes[0].path).toBe('b')
      })

      it('should skip identifier field even if in whitelist', () => {
        const sourceDocs = [{ _id: '1', name: 'Alice' }]
        const targetDocs = [{ _id: '2', name: 'Alice' }]
        const identifierField = '_id'
        const fields = ['_id']

        const result = engine.compare(sourceDocs, targetDocs, identifierField, DiffStrategy.Whitelist, fields)

        expect(result.updated.count).toBe(0)
      })
    })

    describe('Blacklist strategy', () => {
      it('should exclude blacklisted fields from comparison', () => {
        const sourceDocs = [{ _id: '1', a: 1, b: 2, c: 3 }]
        const targetDocs = [{ _id: '1', a: 1, b: 20, c: 30 }]
        const identifierField = '_id'
        const fields = ['c']

        const result = engine.compare(sourceDocs, targetDocs, identifierField, DiffStrategy.Blacklist, fields)

        expect(result.updated.count).toBe(1)
        expect(result.updated.samples[0].changes).toHaveLength(1)
        expect(result.updated.samples[0].changes[0].path).toBe('b')
      })
    })

    describe('DeepEquality strategy', () => {
      it('should treat nested objects as single units', () => {
        const sourceDocs = [{
          _id: '1',
          address: { street: 'Main St', city: 'NYC' },
          name: 'Alice',
        }]
        const targetDocs = [{
          _id: '1',
          address: { street: 'Broadway', city: 'LA' },
          name: 'Alice',
        }]
        const identifierField = '_id'

        const result = engine.compare(sourceDocs, targetDocs, identifierField, DiffStrategy.DeepEquality, [])

        expect(result.updated.count).toBe(0)
        expect(result.updated.samples).toHaveLength(0)
      })

      it('should still detect primitive field changes', () => {
        const sourceDocs = [{ _id: '1', name: 'Alice', count: 5 }]
        const targetDocs = [{ _id: '1', name: 'Alice', count: 10 }]
        const identifierField = '_id'

        const result = engine.compare(sourceDocs, targetDocs, identifierField, DiffStrategy.DeepEquality, [])

        expect(result.updated.count).toBe(1)
        expect(result.updated.samples[0].changes).toHaveLength(1)
        expect(result.updated.samples[0].changes[0].path).toBe('count')
      })
    })

    describe('composite key matching', () => {
      it('should match documents using multiple identifier fields', () => {
        const sourceDocs = [
          { firstName: 'John', lastName: 'Doe', age: 25 },
          { firstName: 'Jane', lastName: 'Smith', age: 30 },
        ]
        const targetDocs = [
          { firstName: 'John', lastName: 'Doe', age: 26 },
          { firstName: 'Jane', lastName: 'Smith', age: 30 },
        ]
        const identifierFields = ['firstName', 'lastName']

        const result = engine.compare(sourceDocs, targetDocs, identifierFields, DiffStrategy.All, [])

        expect(result.updated.count).toBe(1)
        expect(result.updated.samples[0].changes[0].path).toBe('age')
      })
    })
  })

  describe('null handling', () => {
    it('should handle undefined values correctly for added fields', () => {
      const sourceDocs = [{ _id: '1' }]
      const targetDocs = [{ _id: '1', name: 'Alice' }]
      const identifierField = '_id'

      const result = engine.compare(sourceDocs, targetDocs, identifierField, DiffStrategy.All, [])

      const changes = result.updated.samples[0].changes
      expect(changes).toHaveLength(1)
      expect(changes[0].path).toBe('name')
      expect(changes[0].oldValue).toBeNull()
      expect(changes[0].newValue).toBe('Alice')
      expect(changes[0].type).toBe('added')
    })

    it('should handle undefined values correctly for removed fields', () => {
      const sourceDocs = [{ _id: '1', name: 'Alice' }]
      const targetDocs = [{ _id: '1' }]
      const identifierField = '_id'

      const result = engine.compare(sourceDocs, targetDocs, identifierField, DiffStrategy.All, [])

      const changes = result.updated.samples[0].changes
      expect(changes).toHaveLength(1)
      expect(changes[0].path).toBe('name')
      expect(changes[0].newValue).toBeNull()
      expect(changes[0].type).toBe('removed')
    })
  })

  describe('sample limits', () => {
    it('should respect sample limit for created documents', () => {
      const sourceDocs: Record<string, unknown>[] = []
      const targetDocs: Record<string, unknown>[] = [
        { _id: '1', name: 'Alice' },
        { _id: '2', name: 'Bob' },
        { _id: '3', name: 'Charlie' },
      ]
      const identifierField = '_id'
      const sampleLimit = 2

      const result = engine.compare(sourceDocs, targetDocs, identifierField, DiffStrategy.All, [], sampleLimit)

      expect(result.created.count).toBe(3)
      expect(result.created.samples).toHaveLength(2)
    })

    it('should respect sample limit for updated documents', () => {
      const sourceDocs: Record<string, unknown>[] = [
        { _id: '1', name: 'Alice', age: 25 },
        { _id: '2', name: 'Bob', age: 30 },
        { _id: '3', name: 'Charlie', age: 35 },
      ]
      const targetDocs: Record<string, unknown>[] = [
        { _id: '1', name: 'Alice', age: 26 },
        { _id: '2', name: 'Bob', age: 31 },
        { _id: '3', name: 'Charlie', age: 36 },
      ]
      const identifierField = '_id'
      const sampleLimit = 2

      const result = engine.compare(sourceDocs, targetDocs, identifierField, DiffStrategy.All, [], sampleLimit)

      expect(result.updated.count).toBe(3)
      expect(result.updated.samples).toHaveLength(2)
    })

    it('should respect sample limit for deleted documents', () => {
      const sourceDocs: Record<string, unknown>[] = [
        { _id: '1', name: 'Alice' },
        { _id: '2', name: 'Bob' },
        { _id: '3', name: 'Charlie' },
      ]
      const targetDocs: Record<string, unknown>[] = []
      const identifierField = '_id'
      const sampleLimit = 2

      const result = engine.compare(sourceDocs, targetDocs, identifierField, DiffStrategy.All, [], sampleLimit)

      expect(result.deleted.count).toBe(3)
      expect(result.deleted.samples).toHaveLength(2)
    })
  })

  describe('edge cases', () => {
    it('should handle empty documents', () => {
      const sourceDocs: Record<string, unknown>[] = []
      const targetDocs: Record<string, unknown>[] = []
      const identifierField = '_id'

      const result = engine.compare(sourceDocs, targetDocs, identifierField, DiffStrategy.All, [])

      expect(result.created.count).toBe(0)
      expect(result.updated.count).toBe(0)
      expect(result.deleted.count).toBe(0)
    })

    it('should handle documents without identifier field', () => {
      const sourceDocs: Record<string, unknown>[] = [{ name: 'Alice' }]
      const targetDocs: Record<string, unknown>[] = [{ name: 'Bob' }]
      const identifierField = '_id'

      const result = engine.compare(sourceDocs, targetDocs, identifierField, DiffStrategy.All, [])

      expect(result.created.count).toBe(0)
      expect(result.updated.count).toBe(0)
      expect(result.deleted.count).toBe(0)
    })

    it('should handle identical documents', () => {
      const sourceDocs: Record<string, unknown>[] = [{ _id: '1', name: 'Alice', age: 25 }]
      const targetDocs: Record<string, unknown>[] = [{ _id: '1', name: 'Alice', age: 25 }]
      const identifierField = '_id'

      const result = engine.compare(sourceDocs, targetDocs, identifierField, DiffStrategy.All, [])

      expect(result.created.count).toBe(0)
      expect(result.updated.count).toBe(0)
      expect(result.deleted.count).toBe(0)
    })

    it('should handle array values correctly', () => {
      const sourceDocs: Record<string, unknown>[] = [{ _id: '1', tags: ['a', 'b'] }]
      const targetDocs: Record<string, unknown>[] = [{ _id: '1', tags: ['a', 'b', 'c'] }]
      const identifierField = '_id'

      const result = engine.compare(sourceDocs, targetDocs, identifierField, DiffStrategy.All, [])

      expect(result.updated.count).toBe(1)
      const changes = result.updated.samples[0].changes
      expect(changes).toHaveLength(1)
      expect(changes[0].path).toBe('tags')
    })
  })
})
