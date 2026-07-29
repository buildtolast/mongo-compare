import { describe, it, expect, vi, afterAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ComparisonResult, DocumentDiff } from '@/types'
import { VirtualizedDiffList } from './VirtualizedDiffList.js'

describe('VirtualizedDiffList', () => {
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

  const mockDocumentDiff: DocumentDiff = {
    identifier: '123',
    changes: [
      {
        path: 'name',
        oldValue: 'old',
        newValue: 'new',
        type: 'changed',
      },
    ],
  }

  afterAll(() => {
    vi.clearAllMocks()
  })

  it('should render no results message when no result provided', () => {
    render(<VirtualizedDiffList />)

    expect(screen.getByText(/No comparison results available/i)).toBeInTheDocument()
  })

  it('should render document differences when result provided', () => {
    const result = {
      ...mockResult,
      updated: { count: 1, samples: [mockDocumentDiff] },
    }

    render(<VirtualizedDiffList result={result} />)

    expect(screen.getByText(/Document Differences/i)).toBeInTheDocument()
  })

  it('should render no updated documents message when empty', () => {
    const result = {
      ...mockResult,
      updated: { count: 0, samples: [] },
    }

    render(<VirtualizedDiffList result={result} />)

    expect(screen.getByText(/No updated documents found/i)).toBeInTheDocument()
  })

  it('should render error message when error provided', () => {
    const result = {
      ...mockResult,
      updated: { count: 1, samples: [mockDocumentDiff] },
    }

    render(<VirtualizedDiffList result={result} error="Test error" />)

    expect(screen.getByText(/Test error/i)).toBeInTheDocument()
  })

  it('should render document identifier', () => {
    const result = {
      ...mockResult,
      updated: { count: 1, samples: [mockDocumentDiff] },
    }

    render(<VirtualizedDiffList result={result} />)

    expect(screen.getByText(/ID: 123/i)).toBeInTheDocument()
  })

  it('should render field path', () => {
    const result = {
      ...mockResult,
      updated: { count: 1, samples: [mockDocumentDiff] },
    }

    render(<VirtualizedDiffList result={result} />)

    expect(screen.getByText(/name/i)).toBeInTheDocument()
  })

  it('should render change type badge', () => {
    const result = {
      ...mockResult,
      updated: { count: 1, samples: [mockDocumentDiff] },
    }

    render(<VirtualizedDiffList result={result} />)

    expect(screen.getByText(/changed/i)).toBeInTheDocument()
  })

  it('should render old and new values', () => {
    const result = {
      ...mockResult,
      updated: { count: 1, samples: [mockDocumentDiff] },
    }

    render(<VirtualizedDiffList result={result} />)

    expect(screen.getByText(/Old Value/i)).toBeInTheDocument()
    expect(screen.getByText(/New Value/i)).toBeInTheDocument()
  })

  it('should render null value correctly', () => {
    const doc: DocumentDiff = {
      identifier: '123',
      changes: [
        {
          path: 'field',
          oldValue: undefined,
          newValue: null,
          type: 'changed',
        },
      ],
    }

    const result = {
      ...mockResult,
      updated: { count: 1, samples: [doc] },
    }

    render(<VirtualizedDiffList result={result} />)

    expect(screen.getByText(/null/i)).toBeInTheDocument()
  })

  it('should render object value as JSON', () => {
    const doc: DocumentDiff = {
      identifier: '123',
      changes: [
        {
          path: 'nested',
          oldValue: undefined,
          newValue: { key: 'value' },
          type: 'changed',
        },
      ],
    }

    const result = {
      ...mockResult,
      updated: { count: 1, samples: [doc] },
    }

    render(<VirtualizedDiffList result={result} />)

    expect(screen.getByText(/key/i)).toBeInTheDocument()
    expect(screen.getByText(/value/i, { selector: 'pre' })).toBeInTheDocument()
  })

  it('should render document count info', () => {
    const result = {
      ...mockResult,
      updated: { count: 5, samples: [mockDocumentDiff] },
    }

    render(<VirtualizedDiffList result={result} />)

    expect(screen.getByText(/Showing 1 of 5 updated documents/i)).toBeInTheDocument()
  })

  it('should render view mode tabs', () => {
    const result = {
      ...mockResult,
      updated: { count: 1, samples: [mockDocumentDiff] },
    }

    render(<VirtualizedDiffList result={result} />)

    expect(screen.getByText(/Side-by-Side/i)).toBeInTheDocument()
    expect(screen.getByText(/Unified/i)).toBeInTheDocument()
  })

  it('should render source and target columns', () => {
    const result = {
      ...mockResult,
      updated: { count: 1, samples: [mockDocumentDiff] },
      created: { count: 1, samples: [{ id: 1, name: 'test' }] },
    }

    render(<VirtualizedDiffList result={result} />)

    expect(screen.getByText(/Source/i)).toBeInTheDocument()
    expect(screen.getByText(/Target/i)).toBeInTheDocument()
  })

  it('should handle nested field expansion', () => {
    const doc: DocumentDiff = {
      identifier: '123',
      changes: [
        {
          path: 'nested.field',
          oldValue: 'old',
          newValue: 'new',
          type: 'changed',
        },
      ],
    }

    const result = {
      ...mockResult,
      updated: { count: 1, samples: [doc] },
    }

    render(<VirtualizedDiffList result={result} />)

    expect(screen.getByText(/nested.field/i)).toBeInTheDocument()
  })

  it('should display document count info', () => {
    const result = {
      ...mockResult,
      updated: { count: 5, samples: [mockDocumentDiff] },
    }

    render(<VirtualizedDiffList result={result} />)

    expect(screen.getByText(/Showing 1 of 5 updated documents/i)).toBeInTheDocument()
  })
})
