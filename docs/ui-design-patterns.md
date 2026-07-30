# MongoDB Compare UI Design Patterns

## Current Issues
- Cluttered connection form with too many fields
- No visual distinction between source/target
- Step wizard is linear but doesn't show relationships
- Results view could be more intuitive
- Missing visual feedback for diff types

---

## Design Pattern 1: Split-View Dashboard

### Wireframe
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  MongoDB Compare                      [Export] [Settings] [?]              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐                        │
│  │ SOURCE              │    │ TARGET              │                        │
│  │                     │    │                     │                        │
│  │ mongodb://mongo:    │    │ mongodb://mongo:    │                        │
│  │ 27017/sourcedb      │    │ 27017/targetdb      │                        │
│  │                     │    │                     │                        │
│  │ [✓ Connected]       │    │ [✓ Connected]       │                        │
│  │                     │    │                     │                        │
│  │ Collections:        │    │ Collections:        │                        │
│  │ ─ users (500)       │    │ ─ users (403)       │                        │
│  │ ─ products (1.2k)   │    │ ─ products (1.1k)   │                        │
│  │                     │    │                     │                        │
│  │ [Compare Selected]  │    │                     │                        │
│  └─────────────────────┘    └─────────────────────┘                        │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  COMPARISON RESULTS                                                        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Summary Cards                                                        │   │
│  │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │   │
│  │ │ 500 Docs     │ │ 403 Docs     │ │ 97 Deleted   │ │ 3 Updated    │ │   │
│  │ │ Before       │ │ After        │ │ (19.4%)      │ │ (0.6%)       │ │   │
│  │ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Filters                                                              │   │
│  │ [Show All] [Created] [Updated] [Deleted]    [Search: __________]   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Diff Items (Virtual Scroll)                                         │   │
│  │                                                                     │   │
│  │ 🔴 DELETED: User435                                                  │   │
│  │   _id: 435    name: User435    age: 55                              │   │
│  │                                                                     │   │
│  │ 🟢 ADDED: User501                                                    │   │
│  │   _id: 501    name: User501    age: 25                              │   │
│  │                                                                     │   │
│  │ 🟡 UPDATED: User401                                                  │   │
│  │   ┌─────────────────────────────────────────────────────────┐      │   │
│  │   │ name: User401 → ExtraUser1    [View Diff]               │      │   │
│  │   │ age: 21 → 25                    [View Diff]               │      │   │
│  │   └─────────────────────────────────────────────────────────┘      │   │
│  │                                                                     │   │
│  │ 🟡 UPDATED: User402                                                  │   │
│  │   ┌─────────────────────────────────────────────────────────┐      │   │
│  │   │ name: User402 → ExtraUser2    [View Diff]               │      │   │
│  │   │ age: 22 → 30                    [View Diff]               │      │   │
│  │   └─────────────────────────────────────────────────────────┘      │   │
│  │                                                                     │   │
│  │ [Load More]  [Export CSV] [Export JSON] [Export HTML Report]       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Features
- **Side-by-side connection panels** with visual state indicators
- **Summary cards** with color-coded counts
- **Inline diff preview** for changed fields
- **Clear color coding**: Red (deleted), Green (added), Yellow (updated)
- **Virtual scrolling** for large result sets
- **Quick filters** and search
- **One-click export** options

---

## Design Pattern 2: Minimalist Connection Form

### Wireframe
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  MongoDB Compare                                                            │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Connect to MongoDB                                                   │   │
│  │                                                                     │   │
│  │ Connection String                                                    │   │
│  │ ┌───────────────────────────────────────────────────────────────┐   │   │
│  │ │ mongodb://mongo:27017/sourcedb                                 │   │   │
│  │ └───────────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  │ Quick Connects                                                      │   │
│  │ [Source: sourcedb] [Target: targetdb]                              │   │
│  │                                                                     │   │
│  │ Advanced Settings                                                   │   │
│  │ ┌──────────────────────┬──────────────────────┐                    │   │
│  │ │ Auth Database: admin │ TLS: [ ]            │                    │   │
│  │ │ Pool Size: 10        │ Timeout: 30000ms     │                    │   │
│  │ └──────────────────────┴──────────────────────┘                    │   │
│  │                                                                     │   │
│  │ [Test Connection] [Save Configuration]                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐                        │
│  │ SOURCE              │    │ TARGET              │                        │
│  │ ✓ Connected         │    │ ✓ Connected         │                        │
│  │ Databases:          │    │ Databases:          │                        │
│  │ • sourcedb          │    │ • targetdb          │                        │
│  │ • testdb            │    │ • testdb            │                        │
│  │                     │    │                     │                        │
│  │ [Select Collections]│    │ [Select Collections]│                        │
│  └─────────────────────┘    └─────────────────────┘                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Features
- **Collapsible advanced settings**
- **Quick connect buttons** for common configs
- **Inline test connection** with success/fail feedback
- **Minimal visual clutter**
- **Clear separation** between source/target panels

---

## Design Pattern 3: Data-First Comparison View

### Wireframe
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Comparison Results: users collection                                        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 500 docs → 403 docs | 97 deleted | 3 updated | Filter: [All ▼]      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ DELETED (97)                                    [Expand All ▼]       │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ 🔴 435 | name: User435 | age: 55 | email: user435@test1.com         │   │
│  │ 🔴 463 | name: User463 | age: 33 | email: user463@test4.com         │   │
│  │ 🔴 445 | name: User445 | age: 65 | email: user445@test1.com         │   │
│  │ 🔴 453 | name: User453 | age: 23 | email: user453@test4.com         │   │
│  │ 🔴 451 | name: User451 | age: 21 | email: user451@test2.com         │   │
│  │ ... (92 more)                                                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ UPDATED (3)                                       [Expand All ▼]      │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ 🟡 401 | name: User401 → ExtraUser1 | age: 21 → 25 | email: ...     │   │
│  │ 🟡 402 | name: User402 → ExtraUser2 | age: 22 → 30 | email: ...     │   │
│  │ 🟡 403 | name: User403 → ExtraUser3 | age: 23 → 35 | email: ...     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ADDED (0)                                        [Expand All ▼]       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ View Options: [Table View] [JSON View] [Side-by-Side] [Color-Coded] │   │
│  │ Export: [CSV] [JSON] [HTML Report]                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Features
- **Grouped by change type** (Deleted/Updated/Added)
- **Compact item display** with key-value pairs
- **Inline diff indicators** (old → new)
- **Expandable sections** for detailed views
- **Multiple view modes** (Table, JSON, Side-by-Side)
- **Export options** at bottom

---

## Design Pattern 4: Interactive Comparison Card

### Wireframe
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Document Comparison: User401                                                │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Identifier: 401                                                      │   │
│  │                                                                          │   │
│  │ ┌─────────────────────────────┐ ┌─────────────────────────────┐       │   │
│  │ │ BEFORE                      │ │ AFTER                       │       │   │
│  │ │                             │ │                             │       │   │
│  │ │ name: User401               │ │ name: ExtraUser1            │       │   │
│  │ │ age: 21                     │ │ age: 25                     │       │   │
│  │ │ email: user401@test2.com    │ │ email: extra1@test.com      │       │   │
│  │ │                             │ │                             │       │   │
│  │ └─────────────────────────────┘ └─────────────────────────────┘       │   │
│  │                                                                          │   │
│  │ Changed Fields (3):                                                      │   │
│  │ 🟡 name (line 1)                                                          │   │
│  │   - Old: User401                                                         │   │
│  │   + New: ExtraUser1                                                      │   │
│  │ 🟡 age (line 2)                                                          │   │
│  │   - Old: 21                                                              │   │
│  │   + New: 25                                                              │   │
│  │ 🟡 email (line 3)                                                        │   │
│  │   - Old: user401@test2.com                                              │   │
│  │   + New: extra1@test.com                                                │   │
│  │                                                                          │   │
│  │ [View Raw JSON] [Copy Diff] [Compare Another]                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Features
- **Side-by-side document view**
- **Inline field comparison** with +/- indicators
- **Detailed field-level diff** with line numbers
- **Quick actions** (Copy, View Raw JSON)
- **Document identifier** prominently displayed
- **Contextual navigation** (compare previous/next)

---

## Design Pattern 5: Minimalist Results Summary

### Wireframe
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Comparison Summary: users collection                                         │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │   │
│  │  │              │  │              │  │              │  │              │ │   │
│  │  │   500        │  │   403        │  │    3         │  │   97         │ │   │
│  │  │              │  │              │  │              │  │              │ │   │
│  │  │ Before       │  │ After        │  │ Updated      │  │ Deleted      │ │   │
│  │  │              │  │              │  │              │  │              │ │   │
│  │  │ ───────────  │  │ ───────────  │  │ ───────────  │  │ ───────────  │ │   │
│  │  │   Docs       │  │   Docs       │  │   Docs       │  │   Docs       │ │   │
│  │  │              │  │              │  │              │  │              │ │   │
│  │  │              │  │              │  │              │  │              │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │   │
│  │                                                                           │   │
│  │ Progress: ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 81% retained │   │
│  │                                                                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Diff Items                                                           │   │
│  │ ────────────────────────────────────────────────────────────────────│   │
│  │ 🟡 User401 (3 changes)                                              │   │
│  │ 🟡 User402 (3 changes)                                              │   │
│  │ 🟡 User403 (3 changes)                                              │   │
│  │ 🔴 User435 (deleted)                                                │   │
│  │ 🔴 User463 (deleted)                                                │   │
│  │ 🔴 User445 (deleted)                                                │   │
│  │ 🔴 User453 (deleted)                                                │   │
│  │ 🔴 User451 (deleted)                                                │   │
│  │ ... (87 more)                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [View All Details] [Download Full Report] [Export to CSV]                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Features
- **Horizontal summary cards** with large numbers
- **Progress bar** showing retention percentage
- **Compact item list** with change indicators
- **One-click actions** (View All, Download, Export)
- **Visual hierarchy** (summary → detailed list)
- **Color-coded change types**

---

## Recommended Improvements

### Priority 1: Split-View Dashboard
- Replace linear wizard with side-by-side connection panels
- Add visual state indicators (connected/disconnected)
- Show collection counts directly in connection panel

### Priority 2: Color-Coded Summary Cards
- Replace current summary with horizontal summary cards
- Add retention progress bar
- Make change types visually prominent

### Priority 3: Inline Diff Preview
- Add inline diff indicators (old → new)
- Show changed fields in compact format
- Include expand/collapse for detailed view

### Priority 4: Better Filtering
- Group items by change type (Deleted/Updated/Added)
- Add quick filter buttons
- Implement search across all fields

### Priority 5: View Mode Switching
- Add Table View, JSON View, Side-by-Side View options
- Keep current Color-Coded view as default
- Allow users to switch between views

---

## Color Scheme Recommendations

### Primary Colors
- **Source**: Emerald/Green (#10b981)
- **Target**: Cyan/Blue (#06b6d4)
- **Added**: Green (#22c55e)
- **Deleted**: Red (#ef4444)
- **Updated**: Yellow (#eab308)
- **Neutral**: Slate (#64748b)

### UI Colors
- Background: Dark slate (#0f172a)
- Cards: Slightly lighter slate (#1e293b)
- Borders: Medium slate (#334155)
- Text: Light gray (#f1f5f9)
- Text-muted: Muted slate (#94a3b8)

---

## Typography
- **Headings**: Inter, size 1.25rem, weight 600
- **Body**: Inter, size 0.875rem, weight 400
- **Monospace**: JetBrains Mono, size 0.75rem, used for JSON/data
- **Small**: Inter, size 0.75rem, weight 500

---

## Spacing
- **Card padding**: 1.5rem (24px)
- **Element gap**: 1rem (16px)
- **Section gap**: 2rem (32px)
- **Compact gap**: 0.75rem (12px)

---

## Icon Recommendations
- **Connected**: Check circle (✓)
- **Disconnected**: X circle (✗)
- **Source**: Database icon (left aligned)
- **Target**: Database icon (right aligned)
- **Deleted**: Minus circle (red)
- **Added**: Plus circle (green)
- **Updated**: Exclamation triangle (yellow)
- **Export**: Download arrow
- **Settings**: Gear
- **Help**: Question mark

---

## Responsive Design
- **Desktop**: Side-by-side panels, full horizontal summary
- **Tablet**: Stacked panels, horizontal summary cards
- **Mobile**: Single column, collapsible sections

---

## Accessibility Features
- Keyboard navigation support
- Focus indicators
- Screen reader labels
- High contrast mode support
- Reduced motion option
- Font size adjustment