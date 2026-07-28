# 03 — Connection Configuration UI

**What to build:** Build the connection configuration form that allows users to set up source and target MongoDB instances with authentication, security, and pool settings.

**Blocked by:** 02 — MongoDB Client Service

**Blocks:** 04 — Collection Discovery and Selection

**Status:** ✅ Completed

**Implementation summary:**
- Created `ConnectionForm` component with source and target instance inputs
- Implemented authentication section (username, password, auth database)
- Implemented TLS/SSL toggle with certificate configuration
- Implemented connection pool settings (pool size, connect timeout, socket timeout, server selection)
- Added "Test Connection" button that validates credentials
- Added "Save as Snapshot" button to persist configuration
- Added connection status indicators (connected/disconnected/loading)
- Added input validation with user-friendly error messages
- Connected form to `ConnectionContext` for state management

**Test coverage:** 21 tests

**Commit reference:** `20612f02c538c945f560d427a66c70158a60a482`

- [x] Create `ConnectionForm` component with source and target instance inputs
- [x] Implement authentication section (username, password, auth database)
- [x] Implement TLS/SSL toggle with certificate configuration
- [x] Implement connection pool settings (pool size, connect timeout, socket timeout, server selection)
- [x] Add "Test Connection" button that validates credentials
- [x] Add "Save as Snapshot" button to persist configuration
- [x] Add connection status indicators (connected/disconnected/loading)
- [x] Add input validation with user-friendly error messages
- [x] Connect form to `ConnectionContext` for state management
- [x] Write component tests for form interactions
- [x] Write E2E tests for test connection workflow
