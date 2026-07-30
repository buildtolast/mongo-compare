import { describe, it, expect, vi, afterAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ComparisonResult, DocumentDiff } from '@/types'
import { VirtualizedDiffList } from './VirtualizedDiffList.js'

describe('VirtualizedDiffList Performance', () => {
  const mockResult: ComparisonResult = {
    timestamp: '2024-01-01T00:00:00.000Z',
    sourceInstance: 'source',
    targetInstance: 'target',
    sourceDatabase: 'srcdb',
    targetDatabase: 'tgtdb',
    created: { count: 1, samples: [] },
    updated: { count: 1, samples: [] },
    deleted: { count: 0, samples: [] },
  }

  const createLargeDocumentDiff = (id: string, changeCount: number): DocumentDiff => {
    const changes = []
    for (let i = 0; i < changeCount; i++) {
      changes.push({
        path: `field${i}`,
        oldValue: `old${i}`,
        newValue: `new${i}`,
        type: 'changed' as const,
      })
    }
    return {
      identifier: id,
      changes,
    }
  }

  afterAll(() => {
    vi.clearAllMocks()
  })

  it('should render list with 100 documents', async () => {
    const documents = Array.from({ length: 100 }, (_, i) =>
      createLargeDocumentDiff(String(i), 5)
    )

    const result = {
      ...mockResult,
      updated: { count: 100, samples: documents },
    }

    render(<VirtualizedDiffList result={result} />)

    expect(screen.getByText(/Document Differences/i)).toBeInTheDocument()
  })

  it('should render list with 500 documents', async () => {
    const documents = Array.from({ length: 500 }, (_, i) =>
      createLargeDocumentDiff(String(i), 10)
    )

    const result = {
      ...mockResult,
      updated: { count: 500, samples: documents },
    }

    render(<VirtualizedDiffList result={result} />)

    expect(screen.getByText(/Document Differences/i)).toBeInTheDocument()
  })

  it('should handle large nested documents', async () => {
    const doc: DocumentDiff = {
      identifier: '123',
      changes: Array.from({ length: 50 }, (_, i) => ({
        path: `nested.level1.level2.field${i}`,
        oldValue: `old${i}`,
        newValue: `new${i}`,
        type: 'changed' as const,
      })),
    }

    const result = {
      ...mockResult,
      updated: { count: 1, samples: [doc] },
    }

    render(<VirtualizedDiffList result={result} />)

    expect(screen.getByText(/Document Differences/i)).toBeInTheDocument()
  })

  it('should render virtualized list with correct height', async () => {
    const documents = Array.from({ length: 50 }, (_, i) =>
      createLargeDocumentDiff(String(i), 3)
    )

    const result = {
      ...mockResult,
      updated: { count: 50, samples: documents },
    }

    render(<VirtualizedDiffList result={result} />)

    expect(screen.getByText(/Document Differences/i)).toBeInTheDocument()
  })

  it('should render list with mixed change types', async () => {
    const doc: DocumentDiff = {
      identifier: '123',
      changes: [
        {
          path: 'field1',
          oldValue: undefined,
          newValue: 'new1',
          type: 'added' as const,
        },
        {
          path: 'field2',
          oldValue: 'old2',
          newValue: undefined,
          type: 'removed' as const,
        },
        {
          path: 'field3',
          oldValue: 'old3',
          newValue: 'new3',
          type: 'changed' as const,
        },
      ],
    }

    const result = {
      ...mockResult,
      updated: { count: 1, samples: [doc] },
    }

    render(<VirtualizedDiffList result={result} />)

    expect(screen.getByText(/added/i)).toBeInTheDocument()
    expect(screen.getByText(/removed/i)).toBeInTheDocument()
    expect(screen.getByText(/changed/i)).toBeInTheDocument()
  })

  it('should handle very long field paths', async () => {
    const doc: DocumentDiff = {
      identifier: '123',
      changes: [
        {
          path: 'very.deeply.nested.field.path.with.many.levels',
          oldValue: 'old',
          newValue: 'new',
          type: 'changed' as const,
        },
      ],
    }

    const result = {
      ...mockResult,
      updated: { count: 1, samples: [doc] },
    }

    render(<VirtualizedDiffList result={result} />)

    expect(screen.getByText(/very.deeply.nested.field.path/i)).toBeInTheDocument()
  })
})
