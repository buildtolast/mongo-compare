# MongoDB Compare - Wireframe Examples

## Wireframe 1: Split-View Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  MongoDB Compare                      [Export] [Settings] [?]                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌───────────────────────────────┐    ┌───────────────────────────────┐        │
│  │  SOURCE                       │    │  TARGET                       │        │
│  │                               │    │                               │        │
│  │  mongodb://mongo:27017/       │    │  mongodb://mongo:27017/       │        │
│  │  sourcedb                      │    │  targetdb                     │        │
│  │                               │    │                               │        │
│  │  ┌─────────────────────────┐  │    │  ┌─────────────────────────┐  │        │
│  │  │  ✓ Connected            │  │    │  │  ✓ Connected            │  │        │
│  │  └─────────────────────────┘  │    │  └─────────────────────────┘  │        │
│  │                               │    │                               │        │
│  │  Collections:                 │    │  Collections:                 │        │
│  │  ─ users (500)                │    │  ─ users (403)                │        │
│  │  ─ products (1.2k)            │    │  ─ products (1.1k)            │        │
│  │                               │    │                               │        │
│  │  [Compare Selected]           │    │                               │        │
│  └───────────────────────────────┘    └───────────────────────────────┘        │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  COMPARISON RESULTS                                                              │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  Summary Cards                                                           │    │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │    │
│  │  │ 500 Docs     │ │ 403 Docs     │ │ 97 Deleted   │ │ 3 Updated    │    │    │
│  │  │ Before       │ │ After        │ │ (19.4%)      │ │ (0.6%)       │    │    │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  Filters                                                                │    │
│  │  [Show All] [Created] [Updated] [Deleted]    [Search: __________]       │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  Diff Items (Virtual Scroll)                                            │    │
│  │                                                                          │    │
│  │  🔴 DELETED: User435                                                    │    │
│  │    _id: 435    name: User435    age: 55                                  │    │
│  │                                                                          │    │
│  │  🟢 ADDED: User501                                                    │    │
│  │    _id: 501    name: User501    age: 25                                  │    │
│  │                                                                          │    │
│  │  🟡 UPDATED: User401                                                  │    │
│  │    ┌─────────────────────────────────────────────────────────┐          │    │
│  │    │ name: User401 → ExtraUser1    [View Diff]               │          │    │
│  │    │ age: 21 → 25                    [View Diff]               │          │    │
│  │    └─────────────────────────────────────────────────────────┘          │    │
│  │                                                                          │    │
│  │  🟡 UPDATED: User402                                                  │    │
│  │    ┌─────────────────────────────────────────────────────────┐          │    │
│  │    │ name: User402 → ExtraUser2    [View Diff]               │          │    │
│  │    │ age: 22 → 30                    [View Diff]               │          │    │
│  │    └─────────────────────────────────────────────────────────┘          │    │
│  │                                                                          │    │
│  │  [Load More]  [Export CSV] [Export JSON] [Export HTML Report]          │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 2: Minimalist Connection Form

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  MongoDB Compare                                                            │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  Connect to MongoDB                                                   │    │
│  │                                                                          │    │
│  │  Connection String                                                    │    │
│  │  ┌───────────────────────────────────────────────────────────────┐     │    │
│  │  │ mongodb://mongo:27017/sourcedb                                 │     │    │
│  │  └───────────────────────────────────────────────────────────────┘     │    │
│  │                                                                          │    │
│  │  Quick Connects                                                      │    │
│  │  [Source: sourcedb] [Target: targetdb]                              │    │
│  │                                                                          │    │
│  │  Advanced Settings                                                   │    │
│  │  ┌──────────────────────┬──────────────────────┐                    │    │
│  │  │ Auth Database: admin │ TLS: [ ]            │                    │    │
│  │  │ Pool Size: 10        │ Timeout: 30000ms     │                    │    │
│  │  └──────────────────────┴──────────────────────┘                    │    │
│  │                                                                          │    │
│  │  [Test Connection] [Save Configuration]                            │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  ┌───────────────────────────────┐    ┌───────────────────────────────┐        │
│  │  SOURCE                       │    │  TARGET                       │        │
│  │  ✓ Connected                 │    │  ✓ Connected                 │        │
│  │  Databases:                   │    │  Databases:                   │        │
│  │  • sourcedb                   │    │  • targetdb                   │        │
│  │  • testdb                     │    │  • testdb                     │        │
│  │                               │    │                               │        │
│  │  [Select Collections]        │    │  [Select Collections]        │        │
│  └───────────────────────────────┘    └───────────────────────────────┘        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 3: Data-First Comparison View

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Comparison Results: users collection                                        │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  500 docs → 403 docs | 97 deleted | 3 updated | Filter: [All ▼]        │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  DELETED (97)                                    [Expand All ▼]        │    │
│  ├─────────────────────────────────────────────────────────────────────────┤    │
│  │  🔴 435 | name: User435 | age: 55 | email: user435@test1.com         │    │
│  │  🔴 463 | name: User463 | age: 33 | email: user463@test4.com         │    │
│  │  🔴 445 | name: User445 | age: 65 | email: user445@test1.com         │    │
│  │  🔴 453 | name: User453 | age: 23 | email: user453@test4.com         │    │
│  │  🔴 451 | name: User451 | age: 21 | email: user451@test2.com         │    │
│  │  ... (92 more)                                                          │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  UPDATED (3)                                       [Expand All ▼]       │    │
│  ├─────────────────────────────────────────────────────────────────────────┤    │
│  │  🟡 401 | name: User401 → ExtraUser1 | age: 21 → 25 | email: ...       │    │
│  │  🟡 402 | name: User402 → ExtraUser2 | age: 22 → 30 | email: ...       │    │
│  │  🟡 403 | name: User403 → ExtraUser3 | age: 23 → 35 | email: ...       │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  ADDED (0)                                        [Expand All ▼]        │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  View Options: [Table View] [JSON View] [Side-by-Side] [Color-Coded]  │    │
│  │  Export: [CSV] [JSON] [HTML Report]                                    │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 4: Interactive Comparison Card

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Document Comparison: User401                                                │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  Identifier: 401                                                      │    │
│  │                                                                          │    │
│  │  ┌─────────────────────────────┐ ┌─────────────────────────────┐        │    │
│  │  │  BEFORE                      │  │  AFTER                       │        │    │
│  │  │                             │  │                             │        │    │
│  │  │  name: User401               │  │  name: ExtraUser1            │        │    │
│  │  │  age: 21                     │  │  age: 25                     │        │    │
│  │  │  email: user401@test2.com    │  │  email: extra1@test.com      │        │    │
│  │  │                             │  │                             │        │    │
│  │  └─────────────────────────────┘  └─────────────────────────────┘        │    │
│  │                                                                          │    │
│  │  Changed Fields (3):                                                      │    │
│  │  🟡 name (line 1)                                                          │    │
│  │    - Old: User401                                                         │    │
│  │    + New: ExtraUser1                                                      │    │
│  │  🟡 age (line 2)                                                          │    │
│  │    - Old: 21                                                              │    │
│  │    + New: 25                                                              │    │
│  │  🟡 email (line 3)                                                        │    │
│  │    - Old: user401@test2.com                                              │    │
│  │    + New: extra1@test.com                                                │    │
│  │                                                                          │    │
│  │  [View Raw JSON] [Copy Diff] [Compare Another]                           │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 5: Minimalist Results Summary

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Comparison Summary: users collection                                         │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │    │
│  │  │              │  │              │  │              │  │              │ │    │
│  │  │   500        │  │   403        │  │    3         │  │   97         │ │    │
│  │  │              │  │              │  │              │  │              │ │    │
│  │  │ Before       │  │ After        │  │ Updated      │  │ Deleted      │ │    │
│  │  │              │  │              │  │              │  │              │ │    │
│  │  │ ───────────  │  │ ───────────  │  │ ───────────  │  │ ───────────  │ │    │
│  │  │   Docs       │  │   Docs       │  │   Docs       │  │   Docs       │ │    │
│  │  │              │  │              │  │              │  │              │ │    │
│  │  │              │  │              │  │              │  │              │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │    │
│  │                                                                          │    │
│  │  Progress: ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 81% retained │    │
│  │                                                                          │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  Diff Items                                                           │    │
│  │  ─────────────────────────────────────────────────────────────────────  │    │
│  │  🟡 User401 (3 changes)                                              │    │
│  │  🟡 User402 (3 changes)                                              │    │
│  │  🟡 User403 (3 changes)                                              │    │
│  │  🔴 User435 (deleted)                                                │    │
│  │  🔴 User463 (deleted)                                                │    │
│  │  🔴 User445 (deleted)                                                │    │
│  │  🔴 User453 (deleted)                                                │    │
│  │  🔴 User451 (deleted)                                                │    │
│  │  ... (87 more)                                                       │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  [View All Details] [Download Full Report] [Export to CSV]                     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Color Legend

```
🟢 Green   = Added/Updated fields
🔴 Red     = Deleted fields
🟡 Yellow  = Modified fields
⚫ Black   = Source connection
🔵 Blue    = Target connection
```

---

## Quick Navigation

**For Desktop**: Use side-by-side panels with horizontal summary cards

**For Tablet**: Stack panels vertically with horizontal summary cards

**For Mobile**: Single column with collapsible sections

---

## Key Benefits

1. **Split-view**: See source and target simultaneously
2. **Visual feedback**: Color-coded changes are obvious
3. **Progress tracking**: Summary cards show at a glance
4. **Quick actions**: One-click export and filtering
5. **Responsive**: Works on all screen sizes

---

## Recommended Implementation Order

1. **Step 1**: Implement split-view dashboard
2. **Step 2**: Add horizontal summary cards
3. **Step 3**: Add inline diff preview
4. **Step 4**: Implement grouped filtering
5. **Step 5**: Add view mode switching

---

## Next Steps

Would you like me to:
- Create interactive prototypes?
- Implement the split-view dashboard first?
- Show more detailed component wireframes?
- Create a design system document with component specs?