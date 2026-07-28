import { describe, it, expect, beforeEach } from 'vitest'
import { HtmlReportService } from './htmlReportService'

describe('HtmlReportService', () => {
  let service: HtmlReportService

  beforeEach(() => {
    service = new HtmlReportService()
  })

  describe('generateHTMLReport', () => {
    it('should generate valid HTML with embedded JSON data', () => {
      const result = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: { count: 1, samples: [{ _id: '1', name: 'Alice' }] },
        updated: { count: 1, samples: [{ identifier: '2', changes: [] }] },
        deleted: { count: 1, samples: [{ _id: '3', name: 'Charlie' }] },
      }

      const html = service.generateHTMLReport(result)

      expect(typeof html).toBe('string')
      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<html')
      expect(html).toContain('<head>')
      expect(html).toContain('</head>')
      expect(html).toContain('<body>')
      expect(html).toContain('</body>')
      expect(html).toContain('</html>')
      expect(html).toContain('JSON.parse(atob(')
    })

    it('should include summary statistics in HTML', () => {
      const result = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: { count: 5, samples: [] },
        updated: { count: 3, samples: [] },
        deleted: { count: 2, samples: [] },
      }

      const html = service.generateHTMLReport(result)

      expect(html).toContain('5')
      expect(html).toContain('3')
      expect(html).toContain('2')
      expect(html).toContain('Total Differences')
    })

    it('should include color-coded highlighting classes', () => {
      const result = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: { count: 0, samples: [] },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const html = service.generateHTMLReport(result)

      expect(html).toContain('type-added')
      expect(html).toContain('type-removed')
      expect(html).toContain('type-changed')
      expect(html).toContain('.neutral')
    })

    it('should include expand/collapse functionality for nested fields', () => {
      const result = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: { count: 0, samples: [] },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const html = service.generateHTMLReport(result)

      expect(html).toContain('expand-all')
      expect(html).toContain('collapse-all')
      expect(html).toContain('toggle-expanded')
      expect(html).toContain('nested-fields')
    })

    it('should include filterable/sortable diff list', () => {
      const result = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: { count: 0, samples: [] },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const html = service.generateHTMLReport(result)

      expect(html).toContain('filter-diffs')
      expect(html).toContain('sort-btn')
      expect(html).toContain('diff-list')
    })

    it('should include side-by-side diff viewers', () => {
      const result = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: { count: 0, samples: [] },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const html = service.generateHTMLReport(result)

      expect(html).toContain('side-by-side')
      expect(html).toContain('viewer-panel')
    })

    it('should include download button functionality', () => {
      const result = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: { count: 0, samples: [] },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const html = service.generateHTMLReport(result)

      expect(html).toContain('download-report')
      expect(html).toContain('Download HTML Report')
    })

    it('should include responsive design classes', () => {
      const result = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: { count: 0, samples: [] },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const html = service.generateHTMLReport(result)

      expect(html).toContain('@media')
      expect(html).toContain('max-width')
    })

it('should embed complete comparison result data', () => {
      const result = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: { count: 0, samples: [] },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const html = service.generateHTMLReport(result)

      expect(html).toContain('source-db')
      expect(html).toContain('target-db')
      expect(html).toContain('source')
      expect(html).toContain('target')
    })

    it('should handle empty comparison result', () => {
      const result = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: { count: 0, samples: [] },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const html = service.generateHTMLReport(result)

      expect(html).toContain('0')
      expect(html).toContain('Differences Found')
    })

    it('should handle complex nested structures in samples', () => {
      const result = {
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
            },
          ],
        },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const html = service.generateHTMLReport(result)

      expect(html).toContain('address')
      expect(html).toContain('street')
      expect(html).toContain('NYC')
      expect(html).toContain('40.7128')
      expect(html).toContain('Created')
    })

    it('should generate self-contained HTML with all CSS and JS inline', () => {
      const result = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: { count: 0, samples: [] },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const html = service.generateHTMLReport(result)

      expect(html).toContain('<style>')
      expect(html).includes('</style>')
      expect(html).toContain('<script>')
      expect(html).includes('</script>')
      expect(html).not.toContain('href="http')
      expect(html).not.toContain('src="http')
    })

    it('should include timestamp in report header', () => {
      const result = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: { count: 0, samples: [] },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const html = service.generateHTMLReport(result)

      expect(html).toContain('1/1/2024')
    })

    it('should include source and target database names', () => {
      const result = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'production',
        targetDatabase: 'staging',
        created: { count: 0, samples: [] },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const html = service.generateHTMLReport(result)

      expect(html).toContain('production')
      expect(html).toContain('staging')
    })

    it('should include instance connection strings', () => {
      const result = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'localhost:27017',
        targetInstance: 'localhost:27018',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: { count: 0, samples: [] },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const html = service.generateHTMLReport(result)

      expect(html).toContain('localhost:27017')
      expect(html).toContain('localhost:27018')
    })

    it('should generate unique identifier for each report', () => {
      const result = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: { count: 0, samples: [] },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const html1 = service.generateHTMLReport(result)
      const html2 = service.generateHTMLReport(result)

      expect(html1).toBe(html2)
    })
  })

  describe('getReportSize', () => {
    it('should return size in bytes', () => {
      const result = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: { count: 0, samples: [] },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const size = service.getReportSize(result)

      expect(typeof size).toBe('number')
      expect(size).toBeGreaterThan(0)
    })

    it('should return larger size for larger results', () => {
      const smallResult = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: { count: 0, samples: [] },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const largeResult = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: {
          count: 100,
          samples: Array.from({ length: 100 }, (_, i) => ({ _id: i, value: i * 10 })),
        },
updated: {
           count: 100,
           samples: Array.from({ length: 100 }, (_, i) => ({
             identifier: String(i),
             changes: [
               { path: 'field1', oldValue: i as unknown, newValue: i * 2, type: 'changed' as const },
               { path: 'field2', oldValue: null, newValue: i * 3, type: 'added' as const },
             ],
           })),
         },
        deleted: {
          count: 100,
          samples: Array.from({ length: 100 }, (_, i) => ({ _id: i, value: i * 5 })),
        },
      }

      const smallSize = service.getReportSize(smallResult)
       const largeSize = service.getReportSize(largeResult)

       expect(largeSize).toBeGreaterThan(smallSize)
     })
   })

   describe('getReportStatistics', () => {
     it('should return correct statistics for comparison result', () => {
       const result = {
         timestamp: '2024-01-01T12:34:56',
         sourceInstance: 'source-db',
         targetInstance: 'target-db',
         sourceDatabase: 'source',
         targetDatabase: 'target',
         created: { count: 5, samples: [{}, {}, {}, {}, {}] },
         updated: { 
           count: 3, 
           samples: [
             { identifier: '1', changes: [] },
             { identifier: '2', changes: [] },
             { identifier: '3', changes: [] },
           ] 
         },
         deleted: { count: 2, samples: [{}, {}] },
       }

       const stats = service.getReportStatistics(result)

       expect(stats.createdCount).toBe(5)
       expect(stats.updatedCount).toBe(3)
       expect(stats.deletedCount).toBe(2)
       expect(stats.totalCount).toBe(10)
     })

    it('should handle empty result', () => {
      const result = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: { count: 0, samples: [] },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const stats = service.getReportStatistics(result)

      expect(stats.createdCount).toBe(0)
      expect(stats.updatedCount).toBe(0)
      expect(stats.deletedCount).toBe(0)
      expect(stats.totalCount).toBe(0)
    })

    it('should calculate total changes correctly', () => {
      const result = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: { count: 10, samples: [] },
        updated: { count: 20, samples: [] },
        deleted: { count: 5, samples: [] },
      }

      const stats = service.getReportStatistics(result)

      expect(stats.totalCount).toBe(35)
    })
  })

  describe('exportReport', () => {
    it('should create download link for HTML report', () => {
      const result = {
        timestamp: '2024-01-01T12:34:56',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: { count: 0, samples: [] },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const resultObj = service.exportReport(result)

      expect(resultObj).toBeDefined()
      expect(resultObj.download).toBe('mongo-diff-report-2024-01-01T12-34-56.html')
      expect(resultObj.href).toContain('blob:')
    })

    it('should include filename with timestamp', () => {
      const result = {
        timestamp: '2024-01-15T10:20:30',
        sourceInstance: 'source-db',
        targetInstance: 'target-db',
        sourceDatabase: 'source',
        targetDatabase: 'target',
        created: { count: 0, samples: [] },
        updated: { count: 0, samples: [] },
        deleted: { count: 0, samples: [] },
      }

      const link = service.exportReport(result)

      expect(link.download).toBe('mongo-diff-report-2024-01-15T10-20-30.html')
    })
  })
})
