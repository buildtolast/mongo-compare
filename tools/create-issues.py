#!/usr/bin/env python3
"""Create GitHub issues for end-to-end implementation."""

import subprocess
import json

ISSUES = [
    {
        "title": "# 45 — Rust Backend HTTP API",
        "body": """The Rust backend needs a HTTP API server to handle MongoDB connections and comparison operations.

## What to build

Implement HTTP endpoints in Rust using actix-web:

- `POST /api/test-connection` - Test MongoDB connection
- `POST /api/get-databases` - List databases
- `POST /api/get-collections` - List collections
- `POST /api/run-comparison` - Run document comparison

## Blocked by

None — can start immediately

## Status: in-progress

- [x] Rust backend compiles (`cargo build --release --bin mongo-compare-server`)
- [ ] Test API endpoints manually
- [ ] Start Rust backend on port 8080
- [ ] Verify React UI can connect to backend
- [ ] Test full comparison workflow

## Notes

- Uses existing `compare_documents` from `src/comparison.rs`
- Handles MongoDB connections in Rust (not exposed to browser)
- Single Docker container with nginx proxying /api to Rust backend""",
        "labels": ["enhancement", "ready-for-agent"]
    },
    {
        "title": "# 46 — End-to-End Implementation",
        "body": """Implement end-to-end application with React UI connecting to Rust backend.

## What to build

1. **React UI Updates**
   - Create `src/services/apiClient.ts` for HTTP communication
   - Update `App.tsx` with full workflow: connection → collection selection → comparison → results
   - Add `ComparisonContext` for results state
   - Add `UIContext` for loading/errors state

2. **Docker Deployment**
   - Single-container Dockerfile (nginx + Rust backend + UI)
   - docker-compose.yml for service orchestration

## Blocked by

#45 — Rust Backend HTTP API

## Status: in-progress

- [ ] React UI connects to Rust backend via HTTP
- [ ] Full workflow: UI → Rust Backend → MongoDB
- [ ] Docker build and run succeeds
- [ ] E2E testing with Docker

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
```""",
        "labels": ["enhancement", "ready-for-agent"]
    },
    {
        "title": "# 47 — End-to-End Integration Tests",
        "body": """Create comprehensive integration tests to verify the complete end-to-end workflow.

## What to build

Test the full workflow: React UI → Rust Backend → MongoDB

## Test Categories

1. **Docker Build & Deployment**
   - Build image: `docker-compose build`
   - Start services: `docker-compose up -d`
   - Verify UI, Rust backend, MongoDB accessible

2. **UI Functionality**
   - Load React app
   - Enter connection config
   - Test connection button
   - Select database and collections
   - Click compare
   - Verify results display
   - Export to JSON/CSV/HTML

3. **Rust Backend API**
   - All 4 endpoints respond correctly
   - Error handling works
   - CORS configured

4. **Data Comparison**
   - Same collection, no changes
   - New documents (created)
   - Modified documents (updated)
   - Deleted documents (deleted)

5. **Error Handling**
   - Invalid connection strings
   - Non-existent databases
   - Network timeouts

## Blocked by

#46 — End-to-End Implementation

## Status: pending

- [ ] Playwright/Cypress setup
- [ ] UI workflow tests
- [ ] API endpoint tests
- [ ] Comparison workflow tests
- [ ] Docker integration tests

## Priority

**HIGH** - Required before deployment""",
        "labels": ["enhancement", "ready-for-agent"]
    }
]

def create_github_issue(issue):
    """Create a GitHub issue using gh CLI."""
    title = issue["title"]
    body = issue["body"]
    labels = ",".join(issue["labels"])
    
    cmd = [
        "gh", "issue", "create",
        "--title", title,
        "--body", body,
        "--label", labels
    ]
    
    print(f"Creating issue: {title}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode == 0:
        print(f"  ✓ Created: {result.stdout.strip()}")
        return True
    else:
        print(f"  ✗ Failed: {result.stderr}")
        return False

def main():
    print("Creating GitHub issues for end-to-end implementation...")
    print("=" * 60)
    
    success = 0
    for i, issue in enumerate(ISSUES, start=45):
        print(f"\nIssue #{i}:")
        if create_github_issue(issue):
            success += 1
    
    print("\n" + "=" * 60)
    print(f"Completed: {success}/{len(ISSUES)} issues created")

if __name__ == "__main__":
    main()
