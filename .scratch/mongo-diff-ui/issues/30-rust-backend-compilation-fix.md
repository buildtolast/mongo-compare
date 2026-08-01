# Issue: Fix Rust Backend Compilation for Docker Deployment

## Summary
The Rust backend (`src/server.rs`) has compilation errors related to MongoDB cursor iteration that need to be fixed for the end-to-end Docker deployment.

## Problem
The `cargo build --release --bin mongo-compare-server` command fails with multiple errors:
- Cursor iteration API mismatch (`StreamExt` not in scope)
- `unwrap_or_default()` not working on `mongodb::cursor::Cursor`
- Type mismatches in cursor `next()` return values

## Current Status
- ✅ Rust CLI tool compiles and works (`mongo-compare` binary)
- ✅ React UI builds successfully
- ❌ Rust HTTP backend (`mongo-compare-server`) fails to compile
- ❌ Docker build cannot proceed

## Tasks
- [ ] Fix MongoDB cursor iteration to properly fetch documents
- [ ] Ensure `futures-util::stream::StreamExt` is properly imported
- [ ] Fix cursor `find()` API usage for async iteration
- [ ] Test Rust backend compiles with `cargo build --release --bin mongo-compare-server`

## Architecture Context
The Rust backend should:
1. Run on port 8080 as an HTTP API server (actix-web)
2. Handle MongoDB connections and run comparisons
3. Be served alongside React UI via nginx on port 80
4. Proxy `/api/*` requests to the Rust backend

## Docker Integration
Once compilation succeeds, the Dockerfile should:
1. Build React UI with Node.js
2. Build Rust backend with Rust toolchain
3. Copy both to nginx container
4. Start both services (Rust server + nginx) on container run

## Files Involved
- `src/server.rs` - Rust HTTP backend (needs fix)
- `Cargo.toml` - Added `futures-util` dependency
- `Dockerfile` - Single-container setup
- `docker-compose.yml` - Service orchestration

## Dependencies
```toml
futures-util = "0.3"  # Added to Cargo.toml
mongodb = "3.1"
actix-web = "4.9"
actix-cors = "0.7"
```

## Testing
After fix, verify:
1. `cargo build --release --bin mongo-compare-server` succeeds
2. Backend starts on port 8080
3. API endpoints respond correctly
4. Docker build completes successfully

## Priority
**HIGH** - Blocking end-to-end deployment
