import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from './Input'

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Username" />)
    expect(screen.getByText('Username')).toBeInTheDocument()
  })

  it('calls onChange when value changes', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'test' },
    })

    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('shows error message when error prop is provided', () => {
    render(<Input error="Invalid username" />)
    expect(screen.getByText('Invalid username')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveClass('border-rose-500')
  })

  it('renders with placeholder text', () => {
    render(<Input placeholder="Enter value" />)
    expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Input className="custom-input" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom-input')
  })
})
