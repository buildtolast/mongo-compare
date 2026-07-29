# Issue: End-to-End Integration Test

## Summary
Create a comprehensive integration test to verify the complete end-to-end workflow: React UI → Rust Backend → MongoDB.

## What to Test

### 1. Docker Build & Deployment
- [ ] Build image: `docker-compose build`
- [ ] Start services: `docker-compose up -d`
- [ ] Verify UI accessible: `curl http://localhost:80`
- [ ] Verify Rust backend: `curl http://localhost:8080/health`
- [ ] Verify MongoDB: `docker-compose exec mongo mongo --eval "db.adminCommand('ping')"`
- [ ] Stop services: `docker-compose down`

### 2. React UI Components
- [ ] Load React app (index.html)
- [ ] Connection form renders correctly
- [ ] Connection form accepts input
- [ ] Test connection button triggers API call

### 3. Rust Backend API Endpoints
- [ ] `POST /api/test-connection` - Valid connection returns success
- [ ] `POST /api/test-connection` - Invalid connection returns error
- [ ] `POST /api/get-databases` - Returns list of databases
- [ ] `POST /api/get-collections` - Returns list of collections
- [ ] `POST /api/run-comparison` - Returns comparison results

### 4. End-to-End Workflow
- [ ] User enters MongoDB connection config
- [ ] UI validates connection via Rust backend
- [ ] User selects source and target databases
- [ ] User selects collections to compare
- [ ] User clicks "Compare"
- [ ] Rust backend fetches documents from both instances
- [ ] Rust backend runs comparison using DiffEngine
- [ ] Results returned to UI
- [ ] UI displays comparison summary (created, updated, deleted counts)
- [ ] UI displays sample diffs

### 5. Data Comparison Validation
- [ ] Compare same collection with no changes (0 created, 0 updated, 0 deleted)
- [ ] Compare with new documents (created count > 0)
- [ ] Compare with modified documents (updated count > 0)
- [ ] Compare with deleted documents (deleted count > 0)
- [ ] Verify field-level diffs are correct
- [ ] Test different diff strategies (All, Whitelist, Blacklist, DeepEquality)

### 6. Error Handling
- [ ] Invalid MongoDB connection string
- [ ] Non-existent database
- [ ] Non-existent collection
- [ ] Network timeout
- [ ] UI handles errors gracefully

## Test Approach

### Option A: Playwright (Recommended)
```bash
npm install --save-dev @playwright/test
```

Create `src/test/e2e/` directory with:
- `docker.spec.ts` - Docker build and deployment tests
- `api.spec.ts` - API endpoint tests
- `workflow.spec.ts` - Full workflow integration tests
- `comparison.spec.ts` - Data comparison tests

### Option B: Shell Script Tests
Simple bash scripts to verify each component:
```bash
./test-docker-build.sh
./test-api-endpoints.sh
./test-end2end.sh
```

## Current State
- ✅ Rust backend compiles (`cargo build --release --bin mongo-compare-server`)
- ✅ React UI builds (`npm run build`)
- ✅ 306 unit tests passing
- ❌ No integration tests yet
- ❌ Docker deployment not tested end-to-end

## Success Criteria
1. Docker build succeeds
2. All API endpoints respond correctly
3. Full workflow works: UI → Rust Backend → MongoDB
4. Comparison results are accurate
5. Error handling works correctly

## Priority
**HIGH** - Required before deployment

## Blocked by
- #45 — Rust Backend HTTP API (partially complete)
- #46 — End-to-End Implementation (in progress)
