import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SummaryStats } from './SummaryStats'
import type { ComparisonResult } from '@/types'

const mockComparisonResult: ComparisonResult = {
  timestamp: new Date().toISOString(),
  sourceInstance: 'source-db',
  targetInstance: 'target-db',
  sourceDatabase: 'source',
  targetDatabase: 'target',
  created: { count: 15, samples: [] },
  updated: { count: 23, samples: [] },
  deleted: { count: 8, samples: [] },
}

describe('SummaryStats', () => {
  it('renders three stat cards', () => {
    render(<SummaryStats result={mockComparisonResult} />)
    
    expect(screen.getByText('Created')).toBeInTheDocument()
    expect(screen.getByText('Updated')).toBeInTheDocument()
    expect(screen.getByText('Deleted')).toBeInTheDocument()
  })

  it('displays correct counts for each category', () => {
    render(<SummaryStats result={mockComparisonResult} />)
    
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('23')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('applies green color to created card', () => {
    render(<SummaryStats result={mockComparisonResult} />)
    
    const createdCard = screen.getByTestId('stat-card-created')
    expect(createdCard).toHaveClass('bg-emerald-900/30', 'border-emerald-500/30')
  })

  it('applies yellow color to updated card', () => {
    render(<SummaryStats result={mockComparisonResult} />)
    
    const updatedCard = screen.getByTestId('stat-card-updated')
    expect(updatedCard).toHaveClass('bg-amber-900/30', 'border-amber-500/30')
  })

  it('applies red color to deleted card', () => {
    render(<SummaryStats result={mockComparisonResult} />)
    
    const deletedCard = screen.getByTestId('stat-card-deleted')
    expect(deletedCard).toHaveClass('bg-rose-900/30', 'border-rose-500/30')
  })

  it('displays large readable numbers', () => {
    render(<SummaryStats result={mockComparisonResult} />)
    
    const countElements = screen.getAllByText(/^(15|23|8)$/)
    countElements.forEach((el) => {
      expect(el).toHaveClass('text-4xl', 'font-bold')
    })
  })

  it('renders export buttons', () => {
    render(<SummaryStats result={mockComparisonResult} />)
    
    expect(screen.getByText('Export JSON')).toBeInTheDocument()
    expect(screen.getByText('Export CSV')).toBeInTheDocument()
    expect(screen.getByText('Export HTML')).toBeInTheDocument()
  })

  it('calls onExport callback when export button clicked', () => {
    const handleExport = vi.fn()
    render(<SummaryStats result={mockComparisonResult} onExport={handleExport} />)
    
    fireEvent.click(screen.getByText('Export JSON'))
    expect(handleExport).toHaveBeenCalledWith('json')
  })

  it('renders monitoring toggle', () => {
    render(<SummaryStats result={mockComparisonResult} />)
    
    expect(screen.getByText('Monitoring')).toBeInTheDocument()
  })

  it('renders refresh button', () => {
    render(<SummaryStats result={mockComparisonResult} />)
    
    expect(screen.getByText('Refresh')).toBeInTheDocument()
  })

  it('calls onRefresh callback when refresh button clicked', () => {
    const handleRefresh = vi.fn()
    render(<SummaryStats result={mockComparisonResult} onRefresh={handleRefresh} />)
    
    fireEvent.click(screen.getByText('Refresh'))
    expect(handleRefresh).toHaveBeenCalledTimes(1)
  })

  it('shows loading state when isLoading is true', () => {
    render(<SummaryStats result={mockComparisonResult} isLoading={true} />)
    
    expect(screen.getByText('Refresh')).toBeDisabled()
  })

  it('displays error message when error is provided', () => {
    render(<SummaryStats result={mockComparisonResult} error="Connection failed" />)
    
    expect(screen.getByText('Connection failed')).toBeInTheDocument()
  })

  it('shows timestamp when result is available', () => {
    render(<SummaryStats result={mockComparisonResult} />)
    
    expect(screen.getByText(/Comparison performed at/)).toBeInTheDocument()
  })

  it('handles empty result correctly', () => {
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
    
    render(<SummaryStats result={emptyResult} />)
    
    expect(screen.getByTestId('created-count')).toHaveTextContent('0')
    expect(screen.getByTestId('updated-count')).toHaveTextContent('0')
    expect(screen.getByTestId('deleted-count')).toHaveTextContent('0')
  })
})
