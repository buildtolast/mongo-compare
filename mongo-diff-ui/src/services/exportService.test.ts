import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ExportService } from './exportService'
import type { ComparisonResult } from '@/types'

describe('ExportService', () => {
  let service: ExportService

  beforeEach(() => {
    service = new ExportService()
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn((blob: Blob) => `blob:${blob.type}`),
      revokeObjectURL: vi.fn(),
    })
  })

  describe('exportJSON', () => {
    it('should generate valid JSON string from comparison result', () => {
      const result: ComparisonResult = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: { count: 1, samples: [{ _id: '1', name: 'Alice' }] },
        updated: { count: 1, samples: [{ identifier: '2', changes: [] }] },
        deleted: { count: 1, samples: [{ _id: '3', name: 'Charlie' }] },
      }

      const json = service.exportJSON(result)

      expect(typeof json).toBe('string')
      const parsed = JSON.parse(json)
      expect(parsed).toEqual(result)
    })

    it('should handle empty comparison result', () => {
      const result: ComparisonResult = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: { count: 0, samples: [] },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const json = service.exportJSON(result)

      expect(typeof json).toBe('string')
      const parsed = JSON.parse(json)
      expect(parsed.created.count).toBe(0)
      expect(parsed.updated.count).toBe(0)
      expect(parsed.deleted.count).toBe(0)
    })

    it('should handle complex nested structures in samples', () => {
      const result: ComparisonResult = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: {
          count: 1,
          samples: [
            {
              _id: '1',
              name: 'Alice',
              address: {
                street: '123 Main St',
                city: 'NYC',
                coordinates: { lat: 40.7128, lng: -74.0060 },
              },
              tags: ['developer', 'admin'],
            },
          ],
        },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const json = service.exportJSON(result)
      const parsed = JSON.parse(json)

      expect(parsed.created.samples[0].address.city).toBe('NYC')
      expect(parsed.created.samples[0].tags).toEqual(['developer', 'admin'])
    })

    it('should preserve all metadata fields', () => {
      const result: ComparisonResult = {
        timestamp: '2024-01-01T12:34:56.789',
        sourceInstance: 'localhost:27017',
        targetInstance: 'localhost:27018',
        sourceDatabase: 'production',
        targetDatabase: 'staging',
        created: { count: 5, samples: [] },
        updated: { count: 3, samples: [] },
        deleted: { count: 2, samples: [] },
      }

      const json = service.exportJSON(result)
      const parsed = JSON.parse(json)

      expect(parsed.timestamp).toBe(result.timestamp)
      expect(parsed.sourceInstance).toBe(result.sourceInstance)
      expect(parsed.targetInstance).toBe(result.targetInstance)
      expect(parsed.sourceDatabase).toBe(result.sourceDatabase)
      expect(parsed.targetDatabase).toBe(result.targetDatabase)
    })

    it('should handle large result sets', () => {
      const largeSamples = Array.from({ length: 1000 }, (_, i) => ({
        _id: `doc-${i}`,
        value: i * 10,
      }))

      const result: ComparisonResult = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: { count: 1000, samples: largeSamples },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const json = service.exportJSON(result)
      const parsed = JSON.parse(json)

      expect(parsed.created.count).toBe(1000)
      expect(parsed.created.samples).toHaveLength(1000)
      expect(parsed.created.samples[0]._id).toBe('doc-0')
      expect(parsed.created.samples[999]._id).toBe('doc-999')
    })
  })

  describe('exportCSV', () => {
    it('should generate valid CSV string from comparison result', () => {
      const result: ComparisonResult = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: { count: 1, samples: [{ _id: '1', name: 'Alice', age: 25 }] },
        updated: { count: 1, samples: [{ identifier: '2', changes: [] }] },
        deleted: { count: 1, samples: [{ _id: '3', name: 'Charlie', age: 30 }] },
      }

      const csv = service.exportCSV(result)

      expect(typeof csv).toBe('string')
      expect(csv).toContain('_id')
      expect(csv).toContain('name')
      expect(csv).toContain('age')
      expect(csv).toContain('Alice')
      expect(csv).toContain('Charlie')
      expect(csv).toContain('25')
      expect(csv).toContain('30')
    })

    it('should flatten nested structures for CSV', () => {
      const result: ComparisonResult = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: {
          count: 1,
          samples: [
            {
              _id: '1',
              name: 'Alice',
              address: {
                street: '123 Main St',
                city: 'NYC',
                zip: '10001',
              },
            },
          ],
        },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const csv = service.exportCSV(result)

      expect(csv).toContain('_id')
      expect(csv).toContain('name')
      expect(csv).toContain('address.street')
      expect(csv).toContain('address.city')
      expect(csv).toContain('address.zip')
      expect(csv).toContain('123 Main St')
      expect(csv).toContain('NYC')
      expect(csv).toContain('10001')
    })

    it('should handle arrays by joining with comma', () => {
      const result: ComparisonResult = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: {
          count: 1,
          samples: [{ _id: '1', name: 'Alice', tags: ['admin', 'developer'] }],
        },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const csv = service.exportCSV(result)

      expect(csv).toContain('_id')
      expect(csv).toContain('name')
      expect(csv).toContain('tags')
      expect(csv).toContain('Alice')
      expect(csv).toContain('admin,developer')
    })

    it('should handle special characters with proper escaping', () => {
      const result: ComparisonResult = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: {
          count: 1,
          samples: [{ _id: '1', name: 'Alice, Jr.', description: 'A "special" user' }],
        },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const csv = service.exportCSV(result)

      expect(csv).toContain('_id')
      expect(csv).toContain('name')
      expect(csv).toContain('description')
      expect(csv).toContain('Alice, Jr.')
      expect(csv).toContain('A ""special""')
    })

    it('should generate proper CSV headers from all unique keys', () => {
      const result: ComparisonResult = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: {
          count: 2,
          samples: [
            { _id: '1', name: 'Alice', age: 25 },
            { _id: '2', email: 'bob@example.com', age: 30 },
          ],
        },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const csv = service.exportCSV(result)

      expect(csv).toContain('_id')
      expect(csv).toContain('name')
      expect(csv).toContain('email')
      expect(csv).toContain('age')
    })

    it('should handle empty comparison result', () => {
      const result: ComparisonResult = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: { count: 0, samples: [] },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const csv = service.exportCSV(result)

      expect(csv).toBe('')
    })

    it('should handle null and undefined values', () => {
      const result: ComparisonResult = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: {
          count: 1,
          samples: [{ _id: '1', name: null, email: undefined, age: 25 }],
        },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const csv = service.exportCSV(result)

      expect(csv).toContain('_id')
      expect(csv).toContain('name')
      expect(csv).toContain('email')
      expect(csv).toContain('age')
      expect(csv).toContain('undefined')
      expect(csv).toContain('null')
      expect(csv).toContain('25')
    })

    it('should handle deeply nested structures', () => {
      const result: ComparisonResult = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: {
          count: 1,
          samples: [
            {
              _id: '1',
              user: {
                profile: {
                  personal: {
                    name: 'Alice',
                    age: 25,
                  },
                },
              },
            },
          ],
        },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const csv = service.exportCSV(result)

      expect(csv).toContain('_id')
      expect(csv).toContain('user.profile.personal.name')
      expect(csv).toContain('user.profile.personal.age')
      expect(csv).toContain('Alice')
      expect(csv).toContain('25')
    })
  })

  describe('CSV flattenObject method', () => {
    it('should flatten simple object', () => {
      const obj = { a: 1, b: 2, c: 3 }
      const flat = service['flattenObject'](obj)
      expect(flat).toEqual({ a: '1', b: '2', c: '3' })
    })

    it('should flatten nested object with dot notation', () => {
      const obj = { a: { b: { c: 1 } }, d: 2 }
      const flat = service['flattenObject'](obj)
      expect(flat).toEqual({ 'a.b.c': '1', d: '2' })
    })

    it('should handle arrays by joining with comma', () => {
      const obj = { a: [1, 2, 3], b: 'test' }
      const flat = service['flattenObject'](obj)
      expect(flat).toEqual({ a: '1,2,3', b: 'test' })
    })

    it('should handle empty objects', () => {
      const obj = {}
      const flat = service['flattenObject'](obj)
      expect(flat).toEqual({})
    })

    it('should handle null and undefined values', () => {
      const obj = { a: null, b: undefined, c: 1 }
      const flat = service['flattenObject'](obj)
      expect(flat).toEqual({ a: 'null', b: 'undefined', c: '1' })
    })

    it('should handle boolean values', () => {
      const obj = { a: true, b: false }
      const flat = service['flattenObject'](obj)
      expect(flat).toEqual({ a: 'true', b: 'false' })
    })

    it('should handle numeric values', () => {
      const obj = { a: 123, b: 45.67, c: -89 }
      const flat = service['flattenObject'](obj)
      expect(flat).toEqual({ a: '123', b: '45.67', c: '-89' })
    })
  })

  describe('CSV escapeCSVValue method', () => {
    it('should escape values with commas', () => {
      expect(service['escapeCSVValue']('hello, world')).toBe('"hello, world"')
    })

    it('should escape values with quotes', () => {
      expect(service['escapeCSVValue']('say "hello"')).toBe('"say ""hello"""')
    })

    it('should escape values with newlines', () => {
      expect(service['escapeCSVValue']('line1\nline2')).toBe('"line1\nline2"')
    })

    it('should not escape simple values', () => {
      expect(service['escapeCSVValue']('simple')).toBe('simple')
    })

    it('should handle empty string', () => {
      expect(service['escapeCSVValue']('')).toBe('""')
    })
  })

  describe('filename generation', () => {
    it('should generate timestamp-based filename for JSON', () => {
      const timestamp = '2024-01-01T12:34:56'
      const filename = service.getFilename('json', timestamp)
      expect(filename).toBe('mongo-diff-comparison-2024-01-01T12-34-56.json')
    })

    it('should generate timestamp-based filename for CSV', () => {
      const timestamp = '2024-01-01T12:34:56'
      const filename = service.getFilename('csv', timestamp)
      expect(filename).toBe('mongo-diff-comparison-2024-01-01T12-34-56.csv')
    })

    it('should handle ISO timestamp with special characters', () => {
      const timestamp = '2024-01-01T12:34:56.789'
      const filename = service.getFilename('json', timestamp)
      expect(filename).toBe('mongo-diff-comparison-2024-01-01T12-34-56.json')
    })
  })

  describe('download trigger', () => {
    it('should create download link for JSON', () => {
      const result: ComparisonResult = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: { count: 0, samples: [] },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const blob = new Blob([service.exportJSON(result)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = service.getFilename('json', result.timestamp)

      expect(link.download).toBe('mongo-diff-comparison-2024-01-01T12-34-56.json')
      expect(link.href).toContain('blob:')
      URL.revokeObjectURL(url)
    })

    it('should create download link for CSV', () => {
      const result: ComparisonResult = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: { count: 0, samples: [] },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const blob = new Blob([service.exportCSV(result)], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = service.getFilename('csv', result.timestamp)

      expect(link.download).toBe('mongo-diff-comparison-2024-01-01T12-34-56.csv')
      expect(link.href).toContain('blob:')
      URL.revokeObjectURL(url)
    })
  })
})
