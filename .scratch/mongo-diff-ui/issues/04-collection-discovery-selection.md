# 04 — Collection Discovery and Selection

**What to build:** Implement database and collection discovery with browse/filter UI and pattern matching for selecting collections to compare.

**Blocked by:** 03 — Connection Configuration UI

**Blocks:** 05 — Snapshot Management

**Status:** ✅ Completed

**Implementation summary:**
- Created `DatabaseTree` component for hierarchical database exploration
- Created `CollectionList` component with checkboxes for collection selection
- Implemented "select all" functionality for collections
- Added pattern matching input (regex) for collection filtering
- Added identifier field selector with auto-detection (common patterns: `_id`, `id`, `ID`)
- Added composite key configuration (comma-separated fields)
- Implemented "Load Snapshot" functionality to restore saved configurations
- Added collection discovery loading states
- Connected to `MongoDBClient` for real collection listing

**Test coverage:** 48 tests

**Commit reference:** `ba2329a940a7d0eb0ff8042e72acbc5ba0dbfead`

- [x] Create `DatabaseTree` component for hierarchical database exploration
- [x] Create `CollectionList` component with checkboxes for collection selection
- [x] Implement "select all" functionality for collections
- [x] Add pattern matching input (regex) for collection filtering
- [x] Add identifier field selector with auto-detection (common patterns: `_id`, `id`, `ID`)
- [x] Add composite key configuration (comma-separated fields)
- [x] Implement "Load Snapshot" functionality to restore saved configurations
- [x] Add collection discovery loading states
- [x] Connect to `MongoDBClient` for real collection listing
- [x] Write component tests for discovery and selection
- [x] Write E2E tests for snapshot save/load workflow
