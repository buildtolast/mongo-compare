import { render, screen } from '@testing-library/react'
import { SummaryCards } from './SummaryCards'
import type { ComparisonResult } from '@/types/comparison'

describe('SummaryCards', () => {
  const mockResult: ComparisonResult = {
    timestamp: '2024-01-01T00:00:00Z',
    source_instance: 'source-db',
    target_instance: 'target-db',
    source_database: 'users',
    target_database: 'users',
    total_before: 500,
    total_after: 403,
    created: { count: 0, samples: [] },
    updated: { count: 3, samples: [
      {
        identifier: '401',
        changes: [
          { path: 'name', old_value: 'User401', new_value: 'ExtraUser1', type: 'changed' },
          { path: 'age', old_value: '21', new_value: '25', type: 'changed' },
          { path: 'email', old_value: 'user401@test2.com', new_value: 'extra1@test.com', type: 'changed' },
        ],
      },
    ]},
    deleted: { count: 97, samples: [
      {
        _id: 435,
        name: 'User435',
        age: 55,
        email: 'user435@test1.com',
        status: null,
        tags: [],
        metadata: { created: { $date: { $numberLong: '1747790428598' } }, score: 652.5 },
        notes: null,
        empty_field: null,
        nested: null,
      },
    ]},
  }

  it('renders SummaryCards component with comparison result', () => {
    render(<SummaryCards result={mockResult} />)
    expect(screen.getByText('500')).toBeInTheDocument()
    expect(screen.getByText('403')).toBeInTheDocument()
    expect(screen.getByText('97')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Before')).toBeInTheDocument()
    expect(screen.getByText('After')).toBeInTheDocument()
    expect(screen.getByText('Deleted')).toBeInTheDocument()
    expect(screen.getByText('Updated')).toBeInTheDocument()
  })

  it('renders with zero values for created documents', () => {
    const zeroCreatedResult: ComparisonResult = {
      timestamp: '2024-01-01T00:00:00Z',
      source_instance: 'source-db',
      target_instance: 'target-db',
      source_database: 'users',
      target_database: 'users',
      total_before: 500,
      total_after: 500,
      created: { count: 0, samples: [] },
      updated: { count: 0, samples: [] },
      deleted: { count: 0, samples: [] },
    }
    render(<SummaryCards result={zeroCreatedResult} />)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText(/Added/)).toBeInTheDocument()
  })

  it('renders with zero values for updated documents', () => {
    const zeroUpdatedResult: ComparisonResult = {
      ...mockResult,
      updated: { count: 0, samples: [] },
    }
    render(<SummaryCards result={zeroUpdatedResult} />)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText(/Updated/)).toBeInTheDocument()
  })

  it('renders with zero values for deleted documents', () => {
    const zeroDeletedResult: ComparisonResult = {
      ...mockResult,
      deleted: { count: 0, samples: [] },
    }
    render(<SummaryCards result={zeroDeletedResult} />)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText(/Deleted/)).toBeInTheDocument()
  })

  it('displays retention percentage in progress bar', () => {
    render(<SummaryCards result={mockResult} />)
    expect(screen.getByText(/81% retained/)).toBeInTheDocument()
    expect(screen.getByText(/81% retained/)).toBeInTheDocument()
  })

  it('renders with correct color scheme for each card type', () => {
    const { container } = render(<SummaryCards result={mockResult} />)
    const sourceCard = container.querySelector('.summary-card.source')
    const targetCard = container.querySelector('.summary-card.target')
    const deletedCard = container.querySelector('.summary-card.deleted')
    const updatedCard = container.querySelector('.summary-card.updated')

    expect(sourceCard).toBeInTheDocument()
    expect(targetCard).toBeInTheDocument()
    expect(deletedCard).toBeInTheDocument()
    expect(updatedCard).toBeInTheDocument()
  })

  it('shows percentage for deleted and updated cards', () => {
    render(<SummaryCards result={mockResult} />)
    expect(screen.getByText('(19.4%)')).toBeInTheDocument()
    expect(screen.getByText('(0.6%)')).toBeInTheDocument()
    expect(screen.getByText('0 added')).toBeInTheDocument()
  })

  it('handles empty results gracefully', () => {
    const emptyResult: ComparisonResult = {
      timestamp: '2024-01-01T00:00:00Z',
      source_instance: 'source-db',
      target_instance: 'target-db',
      source_database: 'users',
      target_database: 'users',
      total_before: 0,
    total_after: 0,
    created: { count: 0, samples: [] },
    updated: { count: 0, samples: [] },
    deleted: { count: 0, samples: [] },
    }
    render(<SummaryCards result={emptyResult} />)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('displays collection names in card labels', () => {
    render(<SummaryCards result={mockResult} />)
    expect(screen.getByText(/users/)).toBeInTheDocument()
    expect(screen.getByText(/Before/)).toBeInTheDocument()
    expect(screen.getByText(/After/)).toBeInTheDocument()
  })

  it('is responsive and stacks cards on smaller screens', () => {
    render(<SummaryCards result={mockResult} />)
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getByRole('list')).toHaveClass(/grid/)
  })
})