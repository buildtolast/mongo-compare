import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('renders with label', () => {
    render(<Checkbox label="Accept terms" checked={false} onChange={() => {}} />)
    expect(screen.getByText('Accept terms')).toBeInTheDocument()
  })

  it('calls onChange when clicked', () => {
    const handleChange = vi.fn()
    render(<Checkbox label="Toggle" checked={false} onChange={handleChange} />)

    fireEvent.click(screen.getByRole('checkbox'))

    expect(handleChange).toHaveBeenCalledWith(true)
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('shows checked state when checked is true', () => {
    render(
      <Checkbox label="Checked" checked={true} onChange={() => {}} />
    )
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('shows unchecked state when checked is false', () => {
    render(
      <Checkbox label="Unchecked" checked={false} onChange={() => {}} />
    )
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('applies custom className', () => {
    render(<Checkbox label="Custom" checked={false} onChange={() => {}} className="custom-checkbox" />)
    expect(screen.getByRole('checkbox')).toHaveClass('custom-checkbox')
  })
})
