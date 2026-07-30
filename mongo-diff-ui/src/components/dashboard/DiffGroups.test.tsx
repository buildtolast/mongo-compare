import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { DiffGroups } from './DiffGroups'
import type { ChangedField } from '@/types/diff'

describe('DiffGroups', () => {
  const mockDeletedItem = {
    identifier: '435',
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
  }

  const mockUpdatedItem = {
    identifier: '401',
    changed_fields: [
      { field_name: 'name', old_value: 'User401', new_value: 'ExtraUser1' },
      { field_name: 'age', old_value: '21', new_value: '25' },
      { field_name: 'email', old_value: 'user401@test2.com', new_value: 'extra1@test.com' },
    ],
  }

  const mockAddedItem = {
    identifier: '501',
    _id: 501,
    name: 'User501',
    age: 25,
    email: 'user501@test.com',
  }

  it('renders DiffGroups with deleted items', () => {
    const { container } = render(
      <DiffGroups
        deleted={1}
        updated={0}
        added={0}
        deletedItems={[mockDeletedItem]}
        updatedItems={[]}
        addedItems={[]}
        onToggle={() => {}}
        onExpand={() => {}}
      />
    )
    expect(screen.getByText(/DELETED/)).toBeInTheDocument()
    expect(container.querySelector('.diff-item.deleted')).toBeInTheDocument()
  })

  it('renders DiffGroups with updated items', () => {
    const { container } = render(
      <DiffGroups
        deleted={0}
        updated={3}
        added={0}
        deletedItems={[]}
        updatedItems={[mockUpdatedItem]}
        addedItems={[]}
        onToggle={() => {}}
        onExpand={() => {}}
      />
    )
    expect(screen.getByText(/UPDATED/)).toBeInTheDocument()
    expect(container.querySelector('.diff-item.updated')).toBeInTheDocument()
  })

  it('renders DiffGroups with added items', () => {
    const { container } = render(
      <DiffGroups
        deleted={0}
        updated={0}
        added={1}
        deletedItems={[]}
        updatedItems={[]}
        addedItems={[mockAddedItem]}
        onToggle={() => {}}
        onExpand={() => {}}
      />
    )
    expect(screen.getByText(/ADDED/)).toBeInTheDocument()
    expect(container.querySelector('.diff-item.added')).toBeInTheDocument()
  })

  it('displays expand all button', () => {
    render(
      <DiffGroups
        deleted={0}
        updated={0}
        added={0}
        deletedItems={[]}
        updatedItems={[]}
        addedItems={[]}
        onToggle={() => {}}
        onExpand={() => {}}
      />
    )
    expect(screen.getByText('Expand All ▼')).toBeInTheDocument()
  })

  it('toggles expand all when clicked', () => {
    render(
      <DiffGroups
        deleted={0}
        updated={0}
        added={0}
        deletedItems={[]}
        updatedItems={[]}
        addedItems={[]}
        onToggle={() => {}}
        onExpand={() => {}}
      />
    )
    const expandBtn = screen.getByText('Expand All ▼')
    fireEvent.click(expandBtn)
    expect(expandBtn).toHaveTextContent('Collapse All ▲')
    fireEvent.click(expandBtn)
    expect(expandBtn).toHaveTextContent('Expand All ▼')
  })

  it('renders empty state for no changes', () => {
    render(
      <DiffGroups
        deleted={0}
        updated={0}
        added={0}
        deletedItems={[]}
        updatedItems={[]}
        addedItems={[]}
        onToggle={() => {}}
        onExpand={() => {}}
      />
    )
    expect(screen.getByText(/No new documents added/)).toBeInTheDocument()
  })

  it('displays diff item with identifier and info', () => {
    const { container } = render(
      <DiffGroups
        deleted={1}
        updated={0}
        added={0}
        deletedItems={[mockDeletedItem]}
        updatedItems={[]}
        addedItems={[]}
        onToggle={() => {}}
        onExpand={() => {}}
      />
    )
    expect(screen.getByText('435')).toBeInTheDocument()
    expect(screen.getByText('name: User435')).toBeInTheDocument()
    expect(screen.getByText('age: 55')).toBeInTheDocument()
  })

  it('handles multiple items correctly', () => {
    const { container } = render(
      <DiffGroups
        deleted={2}
        updated={2}
        added={1}
        deletedItems={[mockDeletedItem, mockDeletedItem]}
        updatedItems={[mockUpdatedItem, mockUpdatedItem]}
        addedItems={[mockAddedItem]}
        onToggle={() => {}}
        onExpand={() => {}}
      />
    )
    expect(screen.getByText(/DELETED/)).toBeInTheDocument()
    expect(screen.getByText(/UPDATED/)).toBeInTheDocument()
    expect(screen.getByText(/ADDED/)).toBeInTheDocument()
    expect(container.querySelectorAll('.diff-item').length).toBe(4)
  })

  it('calls onToggle when clicking toggle button', () => {
    const onToggle = vi.fn()
    const { container } = render(
      <DiffGroups
        deleted={1}
        updated={0}
        added={0}
        deletedItems={[mockDeletedItem]}
        updatedItems={[]}
        addedItems={[]}
        onToggle={onToggle}
        onExpand={() => {}}
      />
    )
    const toggleBtn = container.querySelector('.diff-item')
    fireEvent.click(toggleBtn!)
    expect(onToggle).toHaveBeenCalled()
  })

  it('calls onExpand when clicking expand button', () => {
    const onExpand = vi.fn()
    const { container } = render(
      <DiffGroups
        deleted={0}
        updated={1}
        added={0}
        deletedItems={[]}
        updatedItems={[mockUpdatedItem]}
        addedItems={[]}
        onToggle={() => {}}
        onExpand={onExpand}
      />
    )
    const expandBtn = container.querySelector('.expand-btn')
    fireEvent.click(expandBtn!)
    expect(onExpand).toHaveBeenCalled()
  })

  it('displays field changes for updated items', () => {
    const { container } = render(
      <DiffGroups
        deleted={0}
        updated={1}
        added={0}
        deletedItems={[]}
        updatedItems={[mockUpdatedItem]}
        addedItems={[]}
        onToggle={() => {}}
        onExpand={() => {}}
      />
    )
    expect(screen.getByText('name: User401 → ExtraUser1')).toBeInTheDocument()
    expect(screen.getByText('age: 21 → 25')).toBeInTheDocument()
    expect(screen.getByText('email: user401@test2.com → extra1@test.com')).toBeInTheDocument()
  })
})