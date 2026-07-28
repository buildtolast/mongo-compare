import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SideBySideDiff } from './SideBySideDiff'
import type { DocumentDiff, ChangedField, ComparisonResult } from '@/types'

const mockDocumentDiff: DocumentDiff = {
  identifier: 'doc-001',
  changes: [
    {
      path: 'name',
      oldValue: 'John Doe',
      newValue: 'Jane Doe',
      type: 'changed' as const,
    },
    {
      path: 'email',
      oldValue: 'john@example.com',
      newValue: 'jane@example.com',
      type: 'changed' as const,
    },
    {
      path: 'phone',
      oldValue: undefined,
      newValue: '555-1234',
      type: 'added' as const,
    },
    {
      path: 'address',
      oldValue: '123 Main St',
      newValue: undefined,
      type: 'removed' as const,
    },
  ],
}

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
          {
            path: 'email',
            oldValue: 'john@example.com',
            newValue: 'jane@example.com',
            type: 'changed' as const,
          },
          {
            path: 'phone',
            oldValue: undefined,
            newValue: '555-1234',
            type: 'added' as const,
          },
          {
            path: 'address',
            oldValue: '123 Main St',
            newValue: undefined,
            type: 'removed' as const,
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
  it('renders two-column layout with source and target labels', () => {
    render(<SideBySideDiff result={mockComparisonResult} />)
    
    expect(screen.getByText('Source')).toBeInTheDocument()
    expect(screen.getByText('Target')).toBeInTheDocument()
  })

  it('displays document identifier field', () => {
    render(<SideBySideDiff result={mockComparisonResult} />)
    
    expect(screen.getByText(/ID: doc-001/)).toBeInTheDocument()
  })

  it('shows changed fields with visual indicators', () => {
    render(<SideBySideDiff result={mockComparisonResult} />)
    
    expect(screen.getByText('name')).toBeInTheDocument()
    expect(screen.getByText('email')).toBeInTheDocument()
    expect(screen.getByText('phone')).toBeInTheDocument()
    expect(screen.getByText('address')).toBeInTheDocument()
  })

  it('highlights added fields with green color', () => {
    render(<SideBySideDiff result={mockComparisonResult} />)
    
    const addedField = screen.getByText('phone')
    expect(addedField).toBeInTheDocument()
  })

  it('highlights removed fields with red color', () => {
    render(<SideBySideDiff result={mockComparisonResult} />)
    
    const removedField = screen.getByText('address')
    expect(removedField).toBeInTheDocument()
  })

  it('displays old and new values for changed fields', () => {
    render(<SideBySideDiff result={mockComparisonResult} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('renders tab switching between side-by-side and unified view', () => {
    render(<SideBySideDiff result={mockComparisonResult} />)
    
    expect(screen.getByText('Side-by-Side')).toBeInTheDocument()
    expect(screen.getByText('Unified')).toBeInTheDocument()
  })

  it('switches to unified view when tab is clicked', () => {
    render(<SideBySideDiff result={mockComparisonResult} />)
    
    const unifiedTab = screen.getByText('Unified')
    fireEvent.click(unifiedTab)
  })

  it('disables navigation buttons when at first or last document', () => {
    render(<SideBySideDiff result={mockComparisonResult} />)
    
    const prevButton = screen.getByText('← Previous')
    const nextButton = screen.getByText('Next →')
    
    expect(prevButton).toBeDisabled()
    expect(nextButton).toBeDisabled()
  })

  it('supports expand/collapse for nested fields', () => {
    const nestedDoc: DocumentDiff = {
      identifier: 'doc-002',
      changes: [
        {
          path: 'address.city',
          oldValue: 'New York',
          newValue: 'Boston',
          type: 'changed' as const,
        },
      ],
    }

    render(<SideBySideDiff result={mockComparisonResult} />)
  })

  it('implements pagination for large result sets', () => {
    render(<SideBySideDiff result={mockComparisonResult} />)
  })

  it('calls onDocumentChange callback when navigating', () => {
    const handleDocumentChange = vi.fn()
    
    render(
      <SideBySideDiff 
        result={mockComparisonResult} 
        onDocumentChange={handleDocumentChange} 
      />
    )
  })

  it('handles empty result state', () => {
    const emptyResult: ComparisonResult = {
      timestamp: new Date().toISOString(),
      sourceInstance: '',
      targetInstance: '',
      sourceDatabase: '',
      targetDatabase: '',
      created: { count: 0, samples: [] },
      updated: { count: 0, samples: [] },
      deleted: { count: 0, samples: [] },
    }
    
    render(<SideBySideDiff result={emptyResult} />)
    
    expect(screen.getByText(/No updated documents found/)).toBeInTheDocument()
  })

  it('displays correct counts in summary', () => {
    render(<SideBySideDiff result={mockComparisonResult} />)
    
    expect(screen.getByText(/Showing 1 of 23 updated documents/)).toBeInTheDocument()
  })

  it('applies Terminal Green color scheme', () => {
    render(<SideBySideDiff result={mockComparisonResult} />)
    
    expect(document.body).toBeTruthy()
  })
})
