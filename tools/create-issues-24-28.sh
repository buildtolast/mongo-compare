#!/bin/bash

cd /Users/chiya/GIT/OpenCode-Work/mongo-compare

# First, let me check which issues are missing (24-28 as per the numbering in ticket files)
# These are actually the advanced feature tickets that weren't created yet

# Issue 24: Integration with Existing CLI (blocked by 6)
gh issue create \
  --title "# 24 — Integration with Existing CLI" \
  --body "# 24 — Integration with Existing CLI

## What to build

Define the integration strategy between the new React UI and the existing Rust CLI library.

## Blocked by

#06 — Diff Engine Integration

## Status: ready-for-agent

- [ ] Document CLI library API surface (what functions are exposed)
- [ ] Define Node.js bridge strategy (napi-rs or neon)
- [ ] Implement minimal Rust FFI for diff computation
- [ ] Create TypeScript wrapper for CLI library
- [ ] Test integration with test MongoDB instances
- [ ] Document CLI to UI data flow
- [ ] Handle error propagation from CLI to UI
- [ ] Performance benchmark bridge overhead
- [ ] Write integration tests for CLI-UI communication
- [ ] Document integration architecture" \
  --label "ready-for-agent,enhancement"

# Issue 25: Security Audit (blocked by 15)
gh issue create \
  --title "# 25 — Security Audit" \
  --body "# 25 — Security Audit

## What to build

Perform a comprehensive security audit of the application including connection string handling, authentication, and data exposure.

## Blocked by

#15 — Testing Suite

## Status: ready-for-agent

- [ ] Audit connection string storage (never store passwords)
- [ ] Review authentication flow (username/password, TLS certificates)
- [ ] Check for SQL injection vulnerabilities (MongoDB injection patterns)
- [ ] Review data export for sensitive information exposure
- [ ] Audit WebSocket communication for security
- [ ] Implement input validation on all user inputs
- [ ] Add rate limiting for comparison operations
- [ ] Review error messages for information leakage
- [ ] Run security scanning tools (npm audit, Snyk)
- [ ] Document security decisions in a new ADR
- [ ] Create security checklist for future development" \
  --label "ready-for-agent,enhancement"

# Issue 26: Multi-Instance Support (blocked by 18)
gh issue create \
  --title "# 26 — Multi-Instance Support (Advanced)" \
  --body "# 26 — Multi-Instance Support (Advanced)

## What to build

Implement support for comparing more than two MongoDB instances (e.g., multi-region sync validation).

## Blocked by

#18 — Documentation and Final Polish

## Status: ready-for-agent

- [ ] Extend connection configuration to support N instances
- [ ] Update collection selection UI for multiple instances
- [ ] Implement n-way diff algorithm
- [ ] Create visualization for multi-instance comparison
- [ ] Add conflict detection for multi-master scenarios
- [ ] Implement sync status indicators
- [ ] Write tests for multi-instance workflows
- [ ] Update documentation for advanced use cases" \
  --label "ready-for-agent,enhancement"

# Issue 27: Advanced Diff Visualization (blocked by 18)
gh issue create \
  --title "# 27 — Advanced Diff Visualization (Advanced)" \
  --body "# 27 — Advanced Diff Visualization (Advanced)

## What to build

Implement advanced visualization options for complex diff scenarios (tree view, graph view, timeline view).

## Blocked by

#18 — Documentation and Final Polish

## Status: ready-for-agent

- [ ] Implement tree view for nested document comparison
- [ ] Implement graph view for relationship-based comparison
- [ ] Implement timeline view for change history
- [ ] Add diff summary statistics (total changes, most changed fields)
- [ ] Implement filtering by field type or change category
- [ ] Add comparison comparison (diff of diff results)
- [ ] Write tests for advanced visualization modes
- [ ] Update documentation for advanced features" \
  --label "ready-for-agent,enhancement"

# Issue 28: Cloud Deployment (blocked by 18)
gh issue create \
  --title "# 28 — Cloud Deployment (Advanced)" \
  --body "# 28 — Cloud Deployment (Advanced)

## What to build

Deploy the application as a cloud service with user accounts, multi-tenancy, and shared comparison results.

## Blocked by

#18 — Documentation and Final Polish

## Status: ready-for-agent

- [ ] Design cloud architecture (backend service, database, auth)
- [ ] Implement user authentication (OAuth2, JWT)
- [ ] Create tenant isolation for multi-tenant deployment
- [ ] Implement shared comparison results
- [ ] Add collaboration features (comment on diffs, share reports)
- [ ] Implement cloud storage for snapshots
- [ ] Add usage analytics and monitoring
- [ ] Write documentation for cloud deployment
- [ ] Deploy to cloud provider (AWS/GCP/Azure)" \
  --label "ready-for-agent,enhancement"

echo "Issues 24-28 created!"
