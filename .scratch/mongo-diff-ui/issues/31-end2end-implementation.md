# Issue: Implement End-to-End MongoDB Diff UI with Rust Backend

## Summary
Implement a complete end-to-end MongoDB Diff UI that uses the existing Rust backend for comparison logic instead of direct MongoDB connections from the browser. This involves fixing the Rust HTTP backend, updating the UI to communicate via API, and setting up Docker deployment.

## Architecture
```
USER BROWSER (Port 80)
         │
         ▼
    NGINX (React UI + Proxy /api/*)
         │
         ▼
Rust Backend (actix-web, Port 8080)
         │
         ▼
    MongoDB (Port 27017)
```

## Current State
- ✅ Rust CLI tool exists (`src/main.rs`) - works for batch comparison
- ✅ Rust diff logic exists (`src/comparison.rs`) - working
- ✅ React UI exists with components but not connected
- ❌ No HTTP backend - UI cannot communicate with Rust logic
- ❌ Docker deployment not set up

## Tasks

### Phase 1: Rust Backend API (CRITICAL)
- [ ] Fix `src/server.rs` compilation errors
- [ ] Implement `/api/test-connection` endpoint
- [ ] Implement `/api/get-databases` endpoint
- [ ] Implement `/api/get-collections` endpoint
- [ ] Implement `/api/run-comparison` endpoint
- [ ] Test endpoints with curl

### Phase 2: UI Updates (CRITICAL)
- [ ] Create `src/services/apiClient.ts` for HTTP communication
- [ ] Update `ConnectionForm.tsx` to use API instead of direct MongoDB
- [ ] Update `CollectionDiscovery.tsx` to use API
- [ ] Create `ComparisonContext.tsx` for results state
- [ ] Create `UIContext.tsx` for loading/errors state
- [ ] Rewrite `App.tsx` with full workflow
- [ ] Update environment variables (API_URL instead of MONGODB_URI)

### Phase 3: Docker Deployment (HIGH)
- [ ] Create single-container Dockerfile (nginx + Rust backend)
- [ ] Update docker-compose.yml for end-to-end setup
- [ ] Test Docker build: `docker-compose build`
- [ ] Test Docker run: `docker-compose up`

### Phase 4: Testing & Verification (HIGH)
- [ ] Run full test suite: `npm run test`
- [ ] Typecheck: `npm run typecheck`
- [ ] Build: `npm run build`
- [ ] Manual e2e testing with Docker
- [ ] Fix any issues found

### Phase 5: Documentation & Cleanup
- [ ] Update ARCHITECTURE.md with final design
- [ ] Remove Node.js backend files (if created)
- [ ] Update CONTEXT.md with new deployment
- [ ] Run code review on implementation
- [ ] Commit work to current branch

## Files Modified/Created

### Backend (Rust)
- `src/server.rs` - NEW: HTTP API server
- `Cargo.toml` - MODIFIED: Added actix-web, futures-util

### Frontend (React)
- `src/services/apiClient.ts` - NEW: API communication
- `src/services/mongoClient.ts` - MODIFIED: Orphaned
- `src/contexts/ComparisonContext.tsx` - NEW: Results state
- `src/contexts/UIContext.tsx` - NEW: UI state
- `src/App.tsx` - MODIFIED: Full workflow integration
- `src/main.tsx` - MODIFIED: Add providers

### Deployment
- `Dockerfile` - NEW: Single-container build
- `docker-compose.yml` - NEW: Service orchestration
- `start.sh` - NEW: Port configuration script

## Dependencies Added (Rust)
```toml
actix-web = "4.9"
actix-cors = "0.7"
futures-util = "0.3"
```

## Dependencies Added (React)
None - using existing mongodb package (will be replaced with API calls)

## Success Criteria
1. ✅ Rust backend compiles and runs on port 8080
2. ✅ All API endpoints respond correctly
3. ✅ React UI connects to Rust backend (no direct MongoDB)
4. ✅ Full comparison workflow works end-to-end
5. ✅ Docker build and run succeeds
6. ✅ All tests pass (306 tests)
7. ✅ Typecheck passes
8. ✅ Code reviewed and committed

## Blocking Issues
- None currently

## Related Issues
- Issue #13: Performance Optimization (Virtual Scrolling) - already implemented
- Issue #19: Rust Backend Compilation - this issue's first task

## Priority
**CRITICAL** - Blocks end-to-end functionality

## Status
In Progress
