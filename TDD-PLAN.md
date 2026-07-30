# TDD Plan: Split-View Dashboard UI Implementation

## User Journeys

### Journey 1: View Connection Panels
**As a user, I want to see source and target connection panels side-by-side, so that I can quickly see and configure both database connections.**

**Acceptance Criteria:**
- Two panels displayed side-by-side on desktop
- Each panel shows connection string and status
- Status indicators show connected/disconnected state
- Hover effects on panels
- Responsive layout for smaller screens

### Journey 2: View Summary Cards
**As a user, I want to see summary cards showing comparison statistics, so that I can quickly understand the comparison results.**

**Acceptance Criteria:**
- Four horizontal summary cards displayed
- Cards show: Before count, After count, Deleted count, Updated count
- Progress bar showing retention percentage
- Color-coded by type (source, target, deleted, updated)

### Journey 3: View Diff Items
**As a user, I want to see diff items grouped by change type (Deleted/Updated/Added), so that I can quickly identify what changed.**

**Acceptance Criteria:**
- Items grouped by change type (Deleted, Updated, Added)
- Each group shows count and expand/collapse functionality
- Color-coded icons for each change type
- Click to expand/collapse details
- Inline diff preview for changed fields

### Journey 4: Filter and Search
**As a user, I want to filter diff items by change type and search for specific documents, so that I can quickly find what I'm looking for.**

**Acceptance Criteria:**
- Filter buttons for All/Deleted/Updated/Added
- Search input to filter by document identifier
- Real-time filtering without page reload
- Empty state when no matches found

### Journey 5: Export Results
**As a user, I want to export comparison results to CSV, JSON, or HTML, so that I can share or analyze the results externally.**

**Acceptance Criteria:**
- Export buttons for CSV, JSON, and HTML
- Downloads files in appropriate format
- Includes all diff data
- Works for both full results and filtered results

## Test File Structure

```
mongo-diff-ui/src/components/
├── dashboard/
│   ├── DashboardLayout.tsx
│   ├── DashboardLayout.test.tsx
│   ├── SourcePanel.tsx
│   ├── SourcePanel.test.tsx
│   ├── TargetPanel.tsx
│   ├── TargetPanel.test.tsx
│   ├── SummaryCards.tsx
│   ├── SummaryCards.test.tsx
│   ├── DiffGroups.tsx
│   ├── DiffGroups.test.tsx
│   ├── DiffItem.tsx
│   ├── DiffItem.test.tsx
│   ├── ColorLegend.tsx
│   └── ColorLegend.test.tsx
├── results/
│   ├── ComparisonSummary.tsx
│   ├── ComparisonSummary.test.tsx
│   └── (existing files)
└── (existing components remain unchanged)
```

## Test-Driven Development Order

### Phase 1: Core Components (SummaryCards, DiffGroups)
1. Write SummaryCards tests
2. Implement SummaryCards
3. Write DiffGroups tests
4. Implement DiffGroups

### Phase 2: Connection Panels
5. Write SourcePanel tests
6. Implement SourcePanel
7. Write TargetPanel tests
8. Implement TargetPanel

### Phase 3: Integration
9. Write DashboardLayout tests
10. Implement DashboardLayout
11. Update App.tsx to use new dashboard

### Phase 4: Results Display
12. Write ComparisonSummary tests
13. Implement ComparisonSummary
14. Update DiffItem for inline preview

### Phase 5: Testing & Review
15. Run typechecking on all files
16. Run unit tests for new components
17. Run full test suite
18. Use /code-review
19. Commit changes

## Pre-Agreed Seams

### Seam 1: App.tsx Component Replacement
**Seam Location**: `App.tsx` entire component
**What Changes**:
- Remove step wizard logic
- Replace with DashboardLayout
- Keep ConnectionContext unchanged
**What Stays**:
- Connection context and state management
- API calls for comparison
- Result display components

### Seam 2: Connection Context
**Seam Location**: `ConnectionContext.tsx`
**What Changes**:
- Add new state for selected collections
- Add new state for identifier fields
**What Stays**:
- Connection configuration state
- Connection status tracking

### Seam 3: API Integration
**Seam Location**: Service layer
**What Changes**:
- Pass identifier field to comparison API
**What Stays**:
- API endpoints unchanged
- Backend comparison logic unchanged

## Test Coverage Requirements

- **SummaryCards**: 80% coverage
  - Render with different data scenarios
  - Test responsive layout
  - Test color coding
  - Test progress bar calculation

- **DiffGroups**: 80% coverage
  - Render with different change types
  - Test expand/collapse
  - Test filtering
  - Test empty states

- **SourcePanel/TargetPanel**: 80% coverage
  - Render with different connection states
  - Test collection list display
  - Test hover effects
  - Test responsive layout

- **DashboardLayout**: 80% coverage
  - Render with different data scenarios
  - Test layout responsiveness
  - Test component composition

- **ComparisonSummary**: 80% coverage
  - Render with different result sets
  - Test export functionality
  - Test filtering and searching

## Running Tests During Development

### Typechecking
```bash
cd mongo-diff-ui
npm run typecheck  # Run after each component implementation
```

### Single Test File
```bash
# Run tests for specific component
npm test -- SummaryCards.test.tsx
npm test -- DiffGroups.test.tsx
```

### Watch Mode
```bash
# Run tests in watch mode during development
npm test -- --watch
```

### Full Test Suite
```bash
# Run all tests at the end
npm test
```

## Success Criteria

1. ✅ All user journeys work as expected
2. ✅ 80%+ test coverage for new components
3. ✅ No TypeScript errors
4. ✅ All tests passing
5. ✅ Responsive design works on all screen sizes
6. ✅ Export functionality works correctly
7. ✅ Filtering and searching work as expected
8. ✅ Code reviewed and approved
9. ✅ Changes committed to master branch

## Implementation Notes

- Use existing component patterns from the codebase
- Maintain consistent color scheme from prototype
- Follow existing TypeScript patterns
- Keep existing tests passing
- Use Vitest for testing (already configured)
- Use React Testing Library for component tests
- Keep changes minimal and focused
- Test edge cases and error scenarios