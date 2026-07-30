import type { ComparisonResult } from '@/types'

export class ExportService {
  exportJSON(result: ComparisonResult): string {
    return JSON.stringify(result, null, 2)
  }

  exportCSV(result: ComparisonResult): string {
    const rows: string[] = []

    const createdCSV = this.generateSectionCSV('created', result.created.samples)
    const updatedCSV = this.generateSectionCSV('updated', result.updated.samples)
    const deletedCSV = this.generateSectionCSV('deleted', result.deleted.samples)

    if (createdCSV) rows.push(createdCSV)
    if (updatedCSV) rows.push(updatedCSV)
    if (deletedCSV) rows.push(deletedCSV)

    return rows.filter(row => row).join('\n')
  }

  private generateSectionCSV(section: string, samples: unknown[]): string {
    if (samples.length === 0) {
      return ''
    }

    const allKeys = new Set<string>()
    const flattenedSamples = samples.map((sample, _index) => {
      const flat = this.flattenObject(sample as Record<string, unknown>)
      for (const key of Object.keys(flat)) {
        allKeys.add(key)
      }
      return { _index, flat }
    })

    const headers = Array.from(allKeys).sort()
    const headerRow = headers.join(',')

    const dataRows = flattenedSamples.map(({ _index, flat }) => {
      const row: string[] = []
      for (const key of headers) {
        const value = flat[key]
        row.push(value !== undefined && value !== null ? this.escapeCSVValue(String(value)) : '')
      }
      return row.join(',')
    })

    return [headerRow, ...dataRows].join('\n')
  }

  flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
    const flat: Record<string, string> = {}

    for (const key of Object.keys(obj)) {
      const value = obj[key]
      const newKey = prefix ? `${prefix}.${key}` : key

      if (value !== null && value !== undefined && typeof value === 'object') {
        if (Array.isArray(value)) {
          flat[newKey] = value.map(v => String(v)).join(',')
        } else {
          const nested = this.flattenObject(value as Record<string, unknown>, newKey)
          Object.assign(flat, nested)
        }
      } else {
        flat[newKey] = value === null ? 'null' : value === undefined ? 'undefined' : String(value)
      }
    }

    return flat
  }

  escapeCSVValue(value: string): string {
    if (value.length === 0) {
      return '""'
    }
    if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  formatTimestampForCSV(timestamp: string): string {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}-${minutes}-${seconds}`
  }

  getFilename(format: 'json' | 'csv', timestamp: string): string {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    const formattedTimestamp = `${year}-${month}-${day}T${hours}-${minutes}-${seconds}`
    return `mongo-diff-comparison-${formattedTimestamp}.${format}`
  }

  createDownloadLink(content: string, mimeType: string, filename: string): HTMLAnchorElement {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    return link
  }
}
