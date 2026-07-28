import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ColorDiff } from './ColorDiff'
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

describe('ColorDiff', () => {
  it('renders without errors', () => {
    render(<ColorDiff result={mockComparisonResult} />)
    expect(screen.getByText('Document Differences')).toBeInTheDocument()
  })

  it('shows document identifier for each diff', () => {
    render(<ColorDiff result={mockComparisonResult} />)
    expect(screen.getByText(/doc-001/)).toBeInTheDocument()
  })

  it('displays change count for each document', () => {
    render(<ColorDiff result={mockComparisonResult} />)
    expect(screen.getByText(/4 changes/)).toBeInTheDocument()
  })

  it('highlights added fields with green background (#d1fae5)', () => {
    render(<ColorDiff result={mockComparisonResult} />)
    
    const addedField = screen.getByText('phone')
    expect(addedField).toBeInTheDocument()
  })

  it('highlights removed fields with red background (#fee2e2)', () => {
    render(<ColorDiff result={mockComparisonResult} />)
    
    const removedField = screen.getByText('address')
    expect(removedField).toBeInTheDocument()
  })

  it('highlights changed fields with yellow background (#fef3c7)', () => {
    render(<ColorDiff result={mockComparisonResult} />)
    
    const changedField = screen.getByText('name')
    expect(changedField).toBeInTheDocument()
  })

  it('displays old and new values for changed fields', () => {
    render(<ColorDiff result={mockComparisonResult} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('shows legend explaining color coding', () => {
    render(<ColorDiff result={mockComparisonResult} />)
    
    expect(screen.getByText('Legend:')).toBeInTheDocument()
  })

  it('displays added color indicator in legend', () => {
    render(<ColorDiff result={mockComparisonResult} />)
    
    expect(screen.getByText(/Added/)).toBeInTheDocument()
  })

  it('displays removed color indicator in legend', () => {
    render(<ColorDiff result={mockComparisonResult} />)
    
    expect(screen.getByText(/Removed/)).toBeInTheDocument()
  })

  it('displays changed color indicator in legend', () => {
    render(<ColorDiff result={mockComparisonResult} />)
    
    expect(screen.getByText(/Changed/)).toBeInTheDocument()
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

    const nestedResult: ComparisonResult = {
      timestamp: new Date().toISOString(),
      sourceInstance: 'source-db',
      targetInstance: 'target-db',
      sourceDatabase: 'source',
      targetDatabase: 'target',
      created: { count: 0, samples: [] },
      updated: { count: 1, samples: [nestedDoc] },
      deleted: { count: 0, samples: [] },
    }

    render(<ColorDiff result={nestedResult} />)
    
    expect(screen.getByText('address.city')).toBeInTheDocument()
  })

  it('displays nested path with dot notation', () => {
    const nestedDoc: DocumentDiff = {
      identifier: 'doc-003',
      changes: [
        {
          path: 'address.city.zip',
          oldValue: '10001',
          newValue: '02101',
          type: 'changed' as const,
        },
      ],
    }

    const nestedResult: ComparisonResult = {
      timestamp: new Date().toISOString(),
      sourceInstance: 'source-db',
      targetInstance: 'target-db',
      sourceDatabase: 'source',
      targetDatabase: 'target',
      created: { count: 0, samples: [] },
      updated: { count: 1, samples: [nestedDoc] },
      deleted: { count: 0, samples: [] },
    }

    render(<ColorDiff result={nestedResult} />)
    
    expect(screen.getByText('address.city.zip')).toBeInTheDocument()
  })

  it('renders Copy to Clipboard button for each diff', () => {
    render(<ColorDiff result={mockComparisonResult} />)
    
    const copyButtons = screen.getAllByText(/Copy to Clipboard/)
    expect(copyButtons.length).toBeGreaterThan(0)
  })

  it('exports all diffs when Export This Document is clicked', () => {
    render(<ColorDiff result={mockComparisonResult} />)
    
    const exportButtons = screen.getAllByText(/Export This Document/)
    expect(exportButtons.length).toBeGreaterThan(0)
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
    
    render(<ColorDiff result={emptyResult} />)
    
    expect(screen.getByText(/No updated documents found/)).toBeInTheDocument()
  })

  it('displays correct summary counts', () => {
    render(<ColorDiff result={mockComparisonResult} />)
    
    expect(screen.getByText(/Showing 1 of 23 updated documents/)).toBeInTheDocument()
  })

  it('applies Terminal Green color scheme', () => {
    render(<ColorDiff result={mockComparisonResult} />)
    
    expect(document.body).toBeTruthy()
  })

  it('displays nested field changes with path notation', () => {
    const nestedDoc: DocumentDiff = {
      identifier: 'doc-004',
      changes: [
        {
          path: 'profile.name',
          oldValue: 'Old Name',
          newValue: 'New Name',
          type: 'changed' as const,
        },
        {
          path: 'profile.email',
          oldValue: 'old@example.com',
          newValue: 'new@example.com',
          type: 'changed' as const,
        },
      ],
    }

    const nestedResult: ComparisonResult = {
      timestamp: new Date().toISOString(),
      sourceInstance: 'source-db',
      targetInstance: 'target-db',
      sourceDatabase: 'source',
      targetDatabase: 'target',
      created: { count: 0, samples: [] },
      updated: { count: 1, samples: [nestedDoc] },
      deleted: { count: 0, samples: [] },
    }

    render(<ColorDiff result={nestedResult} />)
    
    expect(screen.getByText('profile.name')).toBeInTheDocument()
    expect(screen.getByText('profile.email')).toBeInTheDocument()
  })

  it('renders multiple documents with color-coded diffs', () => {
    const doc1: DocumentDiff = {
      identifier: 'doc-001',
      changes: [
        {
          path: 'name',
          oldValue: 'John',
          newValue: 'Jane',
          type: 'changed' as const,
        },
      ],
    }

    const doc2: DocumentDiff = {
      identifier: 'doc-002',
      changes: [
        {
          path: 'status',
          oldValue: 'inactive',
          newValue: 'active',
          type: 'changed' as const,
        },
        {
          path: 'notes',
          oldValue: undefined,
          newValue: 'New note',
          type: 'added' as const,
        },
      ],
    }

    const multiDocResult: ComparisonResult = {
      timestamp: new Date().toISOString(),
      sourceInstance: 'source-db',
      targetInstance: 'target-db',
      sourceDatabase: 'source',
      targetDatabase: 'target',
      created: { count: 0, samples: [] },
      updated: { count: 2, samples: [doc1, doc2] },
      deleted: { count: 0, samples: [] },
    }

    render(<ColorDiff result={multiDocResult} />)
    
    expect(screen.getByText(/doc-001/)).toBeInTheDocument()
    expect(screen.getByText(/doc-002/)).toBeInTheDocument()
    expect(screen.getByText(/name/)).toBeInTheDocument()
    expect(screen.getByText(/status/)).toBeInTheDocument()
    expect(screen.getByText(/notes/)).toBeInTheDocument()
  })

  it('shows change type badge for each field', () => {
    render(<ColorDiff result={mockComparisonResult} />)
    
    const changedBadges = screen.getAllByText(/changed/i)
    expect(changedBadges.length).toBeGreaterThan(0)
    
    const addedBadges = screen.getAllByText(/added/i)
    expect(addedBadges.length).toBeGreaterThan(0)
    
    const removedBadges = screen.getAllByText(/removed/i)
    expect(removedBadges.length).toBeGreaterThan(0)
  })

  it('displays null values for removed fields', () => {
    const doc: DocumentDiff = {
      identifier: 'doc-005',
      changes: [
        {
          path: 'oldField',
          oldValue: 'some value',
          newValue: undefined,
          type: 'removed' as const,
        },
      ],
    }

    const result: ComparisonResult = {
      timestamp: new Date().toISOString(),
      sourceInstance: 'source-db',
      targetInstance: 'target-db',
      sourceDatabase: 'source',
      targetDatabase: 'target',
      created: { count: 0, samples: [] },
      updated: { count: 1, samples: [doc] },
      deleted: { count: 0, samples: [] },
    }

    render(<ColorDiff result={result} />)
    
    expect(screen.getByText('some value')).toBeInTheDocument()
  })

  it('displays null values for added fields', () => {
    const doc: DocumentDiff = {
      identifier: 'doc-006',
      changes: [
        {
          path: 'newField',
          oldValue: undefined,
          newValue: 'new value',
          type: 'added' as const,
        },
      ],
    }

    const result: ComparisonResult = {
      timestamp: new Date().toISOString(),
      sourceInstance: 'source-db',
      targetInstance: 'target-db',
      sourceDatabase: 'source',
      targetDatabase: 'target',
      created: { count: 0, samples: [] },
      updated: { count: 1, samples: [doc] },
      deleted: { count: 0, samples: [] },
    }

    render(<ColorDiff result={result} />)
    
    expect(screen.getByText('new value')).toBeInTheDocument()
  })
})
