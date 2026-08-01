import { render, screen, fireEvent } from '@testing-library/react'
import { DiffGroups } from './DiffGroups'
import type { DocumentDiff } from '@/types/document'

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

  const mockUpdatedItem: DocumentDiff = {
    identifier: '401',
    changes: [
      { path: 'name', old_value: 'User401', new_value: 'ExtraUser1', type: 'changed' },
      { path: 'age', old_value: '21', new_value: '25', type: 'changed' },
      { path: 'email', old_value: 'user401@test2.com', new_value: 'extra1@test.com', type: 'changed' },
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
      />
    )
    expect(screen.getByText(/No new documents added/)).toBeInTheDocument()
  })

  it('displays diff item with identifier and info', () => {
    render(
      <DiffGroups
        deleted={1}
        updated={0}
        added={0}
        deletedItems={[mockDeletedItem]}
        updatedItems={[]}
        addedItems={[]}
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
      />
    )
    expect(screen.getByText(/DELETED/)).toBeInTheDocument()
    expect(screen.getByText(/UPDATED/)).toBeInTheDocument()
    expect(screen.getByText(/ADDED/)).toBeInTheDocument()
    expect(container.querySelectorAll('.diff-item').length).toBe(4)
  })

  it('displays field changes for updated items', () => {
    render(
      <DiffGroups
        deleted={0}
        updated={1}
        added={0}
        deletedItems={[]}
        updatedItems={[mockUpdatedItem]}
        addedItems={[]}
      />
    )
    expect(screen.getByText('name: User401 → ExtraUser1')).toBeInTheDocument()
    expect(screen.getByText('age: 21 → 25')).toBeInTheDocument()
    expect(screen.getByText('email: user401@test2.com → extra1@test.com')).toBeInTheDocument()
  })
})
