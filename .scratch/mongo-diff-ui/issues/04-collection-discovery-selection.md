# 04 — Collection Discovery and Selection

**What to build:** Implement database and collection discovery with browse/filter UI and pattern matching for selecting collections to compare.

**Blocked by:** 03 — Connection Configuration UI

**Status:** ready-for-agent

- [ ] Create `DatabaseTree` component for hierarchical database exploration
- [ ] Create `CollectionList` component with checkboxes for collection selection
- [ ] Implement "select all" functionality for collections
- [ ] Add pattern matching input (regex) for collection filtering
- [ ] Add identifier field selector with auto-detection (common patterns: `_id`, `id`, `ID`)
- [ ] Add composite key configuration (comma-separated fields)
- [ ] Implement "Load Snapshot" functionality to restore saved configurations
- [ ] Add collection discovery loading states
- [ ] Connect to `MongoDBClient` for real collection listing
- [ ] Write component tests for discovery and selection
- [ ] Write E2E tests for snapshot save/load workflow
