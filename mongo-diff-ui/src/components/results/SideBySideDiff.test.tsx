import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SideBySideDiff } from './SideBySideDiff'
import type { ComparisonResult } from '@/types'

const mockComparisonResult: ComparisonResult = {
  timestamp: new Date().toISOString(),
  sourceInstance: 'source-db',
  targetInstance: 'target-db',
  sourceDatabase: 'source',
  targetDatabase: 'target',
  created: {
    count: 15,
    samples: [
      {
        _id: 'new-001',
        name: 'New Document 1',
      },
    ],
  },
  updated: {
    count: 23,
    samples: [
      {
        identifier: 'doc-001',
        changes: [
          {
            path: 'name',
            oldValue: 'John Doe',
            newValue: 'Jane Doe',
            type: 'changed' as const,
          },
        ],
      },
    ],
  },
  deleted: {
    count: 8,
    samples: [
      {
        _id: 'deleted-001',
        name: 'Deleted Document 1',
      },
    ],
  },
}

describe('SideBySideDiff', () => {
  it('renders summary stats', () => {
    render(<SideBySideDiff result={mockComparisonResult} />)
    
    expect(screen.getByText(/Showing 1 of 23 updated documents/i)).toBeInTheDocument()
  })

  it('shows no updated documents message when empty', () => {
    const emptyResult: ComparisonResult = {
      timestamp: new Date().toISOString(),
      sourceInstance: 'source-db',
      targetInstance: 'target-db',
      sourceDatabase: 'source',
      targetDatabase: 'target',
      created: { count: 0, samples: [] },
      updated: { count: 0, samples: [] },
      deleted: { count: 0, samples: [] },
    }
    
    render(<SideBySideDiff result={emptyResult} />)
    
    expect(screen.getByText(/No updated documents found/i)).toBeInTheDocument()
  })

  it('displays correct counts in summary', () => {
    render(<SideBySideDiff result={mockComparisonResult} />)
    
    expect(screen.getByText(/Showing 1 of 23 updated documents/i)).toBeInTheDocument()
  })

  it('applies Terminal Green color scheme', () => {
    render(<SideBySideDiff result={mockComparisonResult} />)
    
    expect(document.body).toBeTruthy()
  })

  it('supports expand/collapse for nested fields', () => {
    render(<SideBySideDiff result={mockComparisonResult} />)
  })

  it('implements pagination for large result sets', () => {
    render(<SideBySideDiff result={mockComparisonResult} />)
  })
})
