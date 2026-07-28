import { describe, it, expect, beforeEach } from 'vitest'
import { DiffEngine, DiffStrategy } from './diffEngine'

describe('DiffEngine Integration', () => {
  let engine: DiffEngine

  beforeEach(() => {
    engine = new DiffEngine()
  })

  describe('real-world scenario: user profile sync', () => {
    it('should detect changes in user profiles between source and target', () => {
      const sourceDocs = [
        {
          _id: 'user_001',
          name: 'John Doe',
          email: 'john@example.com',
          profile: {
            age: 30,
            location: 'New York',
            interests: ['coding', 'music'],
          },
          settings: {
            notifications: true,
            theme: 'dark',
          },
        },
        {
          _id: 'user_002',
          name: 'Jane Smith',
          email: 'jane@example.com',
          profile: {
            age: 28,
            location: 'San Francisco',
            interests: ['reading', 'travel'],
          },
          settings: {
            notifications: false,
            theme: 'light',
          },
        },
        {
          _id: 'user_003',
          name: 'Bob Wilson',
          email: 'bob@example.com',
          profile: {
            age: 35,
            location: 'Chicago',
            interests: ['sports', 'food'],
          },
          settings: {
            notifications: true,
            theme: 'dark',
          },
        },
      ]

      const targetDocs = [
        {
          _id: 'user_001',
          name: 'John Doe',
          email: 'john.doe@example.com',
          profile: {
            age: 31,
            location: 'New York',
            interests: ['coding', 'music', 'gaming'],
          },
          settings: {
            notifications: true,
            theme: 'dark',
          },
        },
        {
          _id: 'user_002',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          profile: {
            age: 28,
            location: 'San Francisco',
            interests: ['reading', 'travel', 'photography'],
          },
          settings: {
            notifications: true,
            theme: 'dark',
          },
        },
        {
          _id: 'user_004',
          name: 'Alice Brown',
          email: 'alice@example.com',
          profile: {
            age: 25,
            location: 'Boston',
            interests: ['art', 'museum'],
          },
          settings: {
            notifications: true,
            theme: 'light',
          },
        },
      ]

      const result = engine.compare(sourceDocs, targetDocs, '_id', DiffStrategy.All, [])

      expect(result.created.count).toBe(1)
      expect(result.created.samples).toHaveLength(1)
      expect(result.created.samples[0]!._id).toBe('user_004')

      expect(result.updated.count).toBe(2)
      expect(result.updated.samples).toHaveLength(2)

      const user1Changes = result.updated.samples.find(
        (doc) => doc.identifier === 'user_001'
      )
      expect(user1Changes).toBeDefined()
      expect(user1Changes!.changes).toHaveLength(3)
      expect(user1Changes!.changes.map((c) => c.path)).toContain('email')
      expect(user1Changes!.changes.map((c) => c.path)).toContain('profile.age')
      expect(user1Changes!.changes.map((c) => c.path)).toContain('profile.interests')

      const user2Changes = result.updated.samples.find(
         (doc) => doc.identifier === 'user_002'
       )
       expect(user2Changes).toBeDefined()
       expect(user2Changes!.changes).toHaveLength(4)
       expect(user2Changes!.changes.map((c) => c.path)).toContain('email')
       expect(user2Changes!.changes.map((c) => c.path)).toContain('profile.interests')
       expect(user2Changes!.changes.map((c) => c.path)).toContain('settings.notifications')
       expect(user2Changes!.changes.map((c) => c.path)).toContain('settings.theme')

      expect(result.deleted.count).toBe(1)
      expect(result.deleted.samples).toHaveLength(1)
      expect(result.deleted.samples[0]!._id).toBe('user_003')
    })

    it('should work with whitelist strategy for user profile sync', () => {
      const sourceDocs = [
        {
          _id: 'user_001',
          name: 'John Doe',
          email: 'john@example.com',
          profile: { age: 30, location: 'NYC' },
          settings: { notifications: true },
        },
      ]

      const targetDocs = [
        {
          _id: 'user_001',
          name: 'John Doe',
          email: 'john.updated@example.com',
          profile: { age: 31, location: 'NYC' },
          settings: { notifications: true },
        },
      ]

      const result = engine.compare(
        sourceDocs,
        targetDocs,
        '_id',
        DiffStrategy.Whitelist,
        ['email', 'profile.age']
      )

      expect(result.updated.count).toBe(1)
      expect(result.updated.samples[0].changes).toHaveLength(2)
      expect(result.updated.samples[0].changes.map((c) => c.path)).toContain('email')
      expect(result.updated.samples[0].changes.map((c) => c.path)).toContain('profile.age')
    })

    it('should work with blacklist strategy for user profile sync', () => {
      const sourceDocs = [
        {
          _id: 'user_001',
          name: 'John Doe',
          email: 'john@example.com',
          profile: { age: 30, location: 'NYC' },
          settings: { notifications: true },
        },
      ]

      const targetDocs = [
        {
          _id: 'user_001',
          name: 'John Updated',
          email: 'john.updated@example.com',
          profile: { age: 31, location: 'NYC' },
          settings: { notifications: false },
        },
      ]

      const result = engine.compare(
        sourceDocs,
        targetDocs,
        '_id',
        DiffStrategy.Blacklist,
        ['name', 'settings']
      )

      expect(result.updated.count).toBe(1)
      expect(result.updated.samples[0].changes).toHaveLength(2)
      expect(result.updated.samples[0].changes.map((c) => c.path)).toContain('email')
      expect(result.updated.samples[0].changes.map((c) => c.path)).toContain('profile.age')
    })

    it('should work with DeepEquality strategy for user profile sync', () => {
      const sourceDocs = [
        {
          _id: 'user_001',
          name: 'John Doe',
          profile: { age: 30, location: 'NYC' },
          settings: { notifications: true },
        },
      ]

      const targetDocs = [
        {
          _id: 'user_001',
          name: 'John Updated',
          profile: { age: 31, location: 'NYC' },
          settings: { notifications: true },
        },
      ]

      const result = engine.compare(
        sourceDocs,
        targetDocs,
        '_id',
        DiffStrategy.DeepEquality,
        []
      )

      expect(result.updated.count).toBe(1)
      expect(result.updated.samples[0].changes).toHaveLength(1)
      expect(result.updated.samples[0].changes[0].path).toBe('name')
    })
  })

  describe('composite key matching', () => {
    it('should match documents using multiple fields as composite key', () => {
      const sourceDocs = [
        {
          orderId: 'ORD-001',
          lineItem: 1,
          product: 'Widget A',
          quantity: 5,
        },
        {
          orderId: 'ORD-001',
          lineItem: 2,
          product: 'Widget B',
          quantity: 3,
        },
        {
          orderId: 'ORD-002',
          lineItem: 1,
          product: 'Widget C',
          quantity: 10,
        },
      ]

      const targetDocs = [
        {
          orderId: 'ORD-001',
          lineItem: 1,
          product: 'Widget A',
          quantity: 10,
        },
        {
          orderId: 'ORD-001',
          lineItem: 2,
          product: 'Widget B',
          quantity: 3,
        },
        {
          orderId: 'ORD-003',
          lineItem: 1,
          product: 'Widget D',
          quantity: 7,
        },
      ]

      const result = engine.compare(
        sourceDocs,
        targetDocs,
        ['orderId', 'lineItem'],
        DiffStrategy.All,
        []
      )

      expect(result.created.count).toBe(1)
      expect(result.created.samples[0]!.orderId).toBe('ORD-003')

      expect(result.updated.count).toBe(1)
      expect(result.updated.samples[0].identifier).toBe('ORD-001|1')
      expect(result.updated.samples[0].changes).toHaveLength(1)
      expect(result.updated.samples[0].changes[0].path).toBe('quantity')

      expect(result.deleted.count).toBe(1)
      expect(result.deleted.samples[0]!.orderId).toBe('ORD-002')
    })
  })

  describe('sample limit', () => {
    it('should limit samples while preserving accurate counts', () => {
      const sourceDocs: Record<string, unknown>[] = []
      const targetDocs: Record<string, unknown>[] = Array.from({ length: 100 }, (_, i) => ({
        _id: `doc_${i}`,
        data: `value_${i}`,
      }))

      const result = engine.compare(sourceDocs, targetDocs, '_id', DiffStrategy.All, [], 10)

      expect(result.created.count).toBe(100)
      expect(result.created.samples).toHaveLength(10)
    })
  })
})
