# Issue: End-to-End Integration Testing

## Summary
After implementing the end-to-end service (React UI + Rust Backend + MongoDB), create comprehensive integration tests to verify the complete workflow works correctly with all components running together.

## What to Test

### 1. Docker Build & Deployment Tests
- [ ] Build image: `docker-compose build`
- [ ] Start services: `docker-compose up -d`
- [ ] Verify UI accessible: `curl http://localhost:80`
- [ ] Verify Rust backend: `curl http://localhost:8080/health`
- [ ] Verify MongoDB: `docker-compose exec mongo mongo --eval "db.adminCommand('ping')"`
- [ ] Stop services: `docker-compose down`

### 2. UI Functionality Tests (using Playwright/Cypress)
- [ ] Load React app (index.html)
- [ ] Enter MongoDB connection string
- [ ] Test connection button works
- [ ] Select database from dropdown
- [ ] Select collections to compare
- [ ] Click "Compare" button
- [ ] Verify comparison results display
- [ ] Export to JSON works
- [ ] Export to CSV works
- [ ] Export to HTML works
- [ ] Snapshot save/load works
- [ ] Real-time monitoring toggle works

### 3. Rust Backend API Tests
- [ ] `POST /api/test-connection` - Valid connection returns success
- [ ] `POST /api/test-connection` - Invalid connection returns error
- [ ] `POST /api/get-databases` - Returns list of databases
- [ ] `POST /api/get-collections` - Returns list of collections
- [ ] `POST /api/run-comparison` - Returns comparison results
- [ ] API handles CORS correctly
- [ ] API returns proper error responses

### 4. Data Comparison Tests
- [ ] Compare same collection with no changes (0 created, 0 updated, 0 deleted)
- [ ] Compare with new documents (created count > 0)
- [ ] Compare with modified documents (updated count > 0)
- [ ] Compare with deleted documents (deleted count > 0)
- [ ] Verify field-level diffs are correct
- [ ] Test different diff strategies (All, Whitelist, Blacklist, DeepEquality)

### 5. Multi-Collection Tests
- [ ] Compare multiple collections at once
- [ ] Verify each collection's comparison is independent
- [ ] Verify total counts sum correctly

### 6. Performance Tests
- [ ] Test with 100 documents
- [ ] Test with 1000 documents
- [ ] Test with 10000 documents
- [ ] Verify memory usage stays reasonable
- [ ] Verify response time acceptable (< 5s for 1000 docs)

### 7. Error Handling Tests
- [ ] Invalid MongoDB connection string
- [ ] Non-existent database
- [ ] Non-existent collection
- [ ] Network timeout
- [ ] MongoDB auth failure
- [ ] UI handles errors gracefully

### 8. Snapshot Management Tests
- [ ] Save snapshot with all connection details
- [ ] Load snapshot and verify connection restored
- [ ] Edit saved snapshot
- [ ] Delete snapshot
- [ ] List all snapshots

## Test Approach

### Option A: Playwright (Recommended)
```bash
npm install --save-dev @playwright/test
```

Create `src/test/e2e/` directory with:
- `ui.spec.ts` - UI workflow tests
- `api.spec.ts` - API endpoint tests
- `comparison.spec.ts` - Data comparison tests

### Option B: Cypress
```bash
npm install --save-dev cypress
```

### Option C: Docker Integration Tests
Use testcontainers or similar to spin up MongoDB for tests.

## Success Criteria
1. All integration tests pass
2. Coverage for core workflows > 80%
3. Tests run in < 5 minutes
4. Tests can be run in CI/CD pipeline

## Current State
- ✅ Unit tests passing (306 tests)
- ✅ React components built
- ✅ Rust backend compiles (in progress)
- ❌ No E2E tests yet
- ❌ No integration tests yet

## Priority
**CRITICAL** - Required before deployment

## Dependencies
- Issue #20: End-to-End Implementation (must be complete first)
