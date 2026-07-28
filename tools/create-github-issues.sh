#!/bin/bash

# Create all GitHub issues for MongoDB Diff UI project

cd /Users/chiya/GIT/OpenCode-Work/mongo-compare

# Issue 04: Collection Discovery and Selection
gh issue create \
  --title "# 04 — Collection Discovery and Selection" \
  --body "# 04 — Collection Discovery and Selection

## What to build

Implement database and collection discovery with browse/filter UI and pattern matching for selecting collections to compare.

## Blocked by

#03 — Connection Configuration UI

## Status: ready-for-agent

- [ ] Create \`DatabaseTree\` component for hierarchical database exploration
- [ ] Create \`CollectionList\` component with checkboxes for collection selection
- [ ] Implement \"select all\" functionality for collections
- [ ] Add pattern matching input (regex) for collection filtering
- [ ] Add identifier field selector with auto-detection (common patterns: \`_id\`, \`id\`, \`ID\`)
- [ ] Add composite key configuration (comma-separated fields)
- [ ] Implement \"Load Snapshot\" functionality to restore saved configurations
- [ ] Add collection discovery loading states
- [ ] Connect to \`MongoDBClient\` for real collection listing
- [ ] Write component tests for discovery and selection
- [ ] Write E2E tests for snapshot save/load workflow" \
  --label "ready-for-agent,enhancement" \
  --blocking 3

# Issue 05: Snapshot Management
gh issue create \
  --title "# 05 — Snapshot Management" \
  --body "# 05 — Snapshot Management

## What to build

Implement snapshot save/load functionality to persist and restore comparison configurations for recurring tasks.

## Blocked by

#04 — Collection Discovery and Selection

## Status: ready-for-agent

- [ ] Create \`SnapshotService\` class for snapshot CRUD operations
- [ ] Implement \`save()\` to persist configuration to localStorage
- [ ] Implement \`load()\` to retrieve all saved snapshots
- [ ] Implement \`delete()\` to remove a snapshot
- [ ] Add snapshot metadata (name, description, timestamp, configuration)
- [ ] Create \`SnapshotManager\` UI component with list view
- [ ] Implement \"Save Current Configuration\" form
- [ ] Add \"Load Snapshot\" button to restore configurations
- [ ] Add \"Delete Snapshot\" functionality
- [ ] Implement snapshot naming and description fields
- [ ] Write unit tests for snapshot service
- [ ] Write component tests for snapshot manager UI" \
  --label "ready-for-agent,enhancement" \
  --blocking 4

# Issue 06: Diff Engine Integration
gh issue create \
  --title "# 06 — Diff Engine Integration" \
  --body "# 06 — Diff Engine Integration

## What to build

Integrate the existing Rust \`mongo-compare\` library or implement the diff engine in TypeScript to compute document differences between source and target collections.

## Blocked by

#05 — Snapshot Management

## Status: ready-for-agent

- [ ] Review existing Rust \`mongo-compare\` library diff algorithms
- [ ] Option A: Build Node.js bridge to Rust library (using \`neon\` or \`napi-rs\`)
- [ ] Option B: Implement diff engine in TypeScript with same logic
- [ ] Implement identifier-based document matching
- [ ] Implement recursive nested field diffing with dot-notation paths
- [ ] Support composite key matching
- [ ] Implement diff strategies: All, Whitelist, Blacklist, DeepEquality
- [ ] Categorize documents: created, updated, deleted
- [ ] Generate field-level diffs with old/new values
- [ ] Handle null values correctly (added/removed fields)
- [ ] Write unit tests for diff engine (target: >80% coverage)
- [ ] Write integration tests with test MongoDB instances" \
  --label "ready-for-agent,enhancement" \
  --blocking 5

# Issue 07: Comparison Results Summary
gh issue create \
  --title "# 07 — Comparison Results Summary" \
  --body "# 07 — Comparison Results Summary

## What to build

Build the comparison results summary view that displays counts for created, updated, and deleted documents with color-coded visualization.

## Blocked by

#06 — Diff Engine Integration

## Status: ready-for-agent

- [ ] Create \`SummaryStats\` component with three stat cards (created, updated, deleted)
- [ ] Implement color-coded cards: green for created, yellow for updated, red for deleted
- [ ] Display counts with large, readable numbers
- [ ] Add export buttons (JSON, CSV, HTML) to summary
- [ ] Add monitoring toggle for real-time comparison
- [ ] Add \"Refresh\" button for manual comparison rerun
- [ ] Connect to \`ComparisonContext\` for results storage
- [ ] Add loading states and error handling
- [ ] Implement export functionality triggers
- [ ] Write component tests for summary view
- [ ] Write E2E tests for export workflow" \
  --label "ready-for-agent,enhancement" \
  --blocking 6

# Issue 08: Side-by-Side Diff Viewer
gh issue create \
  --title "# 08 — Side-by-Side Diff Viewer" \
  --body "# 08 — Side-by-Side Diff Viewer

## What to build

Implement side-by-side document comparison view with two-column layout and clear visual indicators for changes.

## Blocked by

#07 — Comparison Results Summary

## Status: ready-for-agent

- [ ] Create \`SideBySideDiff\` component with two-column layout
- [ ] Display source document on left, target document on right
- [ ] Highlight matching identifier field
- [ ] Show changed fields with visual indicators
- [ ] Implement tab switching (side-by-side/unified diff)
- [ ] Add navigation between documents (previous/next)
- [ ] Support expand/collapse for nested fields
- [ ] Implement pagination for large result sets
- [ ] Connect to diff engine results
- [ ] Write component tests for diff viewer interactions
- [ ] Write E2E tests for document navigation" \
  --label "ready-for-agent,enhancement" \
  --blocking 7

# Issue 09: Color-Coded Diff Viewer
gh issue create \
  --title "# 09 — Color-Coded Diff Viewer" \
  --body "# 09 — Color-Coded Diff Viewer

## What to build

Implement inline color-coded diff visualization with green for additions, red for removals, and yellow for changes.

## Blocked by

#08 — Side-by-Side Diff Viewer

## Status: ready-for-agent

- [ ] Create \`ColorDiff\` component with inline highlighting
- [ ] Implement color scheme: green (\`#d1fae5\`) for added, red (\`#fee2e2\`) for removed, yellow (\`#fef3c7\`) for changed
- [ ] Display field-level changes with old vs new values
- [ ] Show legend explaining color coding
- [ ] Support expand/collapse for nested fields
- [ ] Display nested path changes with dot notation
- [ ] Add \"Copy to Clipboard\" for individual diffs
- [ ] Add \"Export This Document\" functionality
- [ ] Connect to diff engine results
- [ ] Write component tests for color-coded view
- [ ] Write E2E tests for export functionality" \
  --label "ready-for-agent,enhancement" \
  --blocking 8

# Issue 10: JSON and CSV Export
gh issue create \
  --title "# 10 — JSON and CSV Export" \
  --body "# 10 — JSON and CSV Export

## What to build

Implement JSON and CSV export functionality for comparison results with proper data formatting and file generation.

## Blocked by

#09 — Color-Coded Diff Viewer

## Status: ready-for-agent

- [ ] Create \`ExportService\` class for format-specific generation
- [ ] Implement \`exportJSON()\` method for full structured data
- [ ] Implement \`exportCSV()\` method for tabular format
- [ ] Flatten nested structures for CSV export
- [ ] Generate proper CSV headers
- [ ] Create download triggers for both formats
- [ ] Implement file naming conventions (timestamp-based)
- [ ] Add \"Download JSON\" button to summary
- [ ] Add \"Download CSV\" button to summary
- [ ] Handle large result sets with streaming or pagination
- [ ] Write unit tests for export service
- [ ] Write E2E tests for download functionality" \
  --label "ready-for-agent,enhancement" \
  --blocking 9

# Issue 11: HTML Report Export
gh issue create \
  --title "# 11 — HTML Report Export" \
  --body "# 11 — HTML Report Export

## What to build

Implement interactive HTML report generation with embedded diff data, color-coded visualization, and side-by-side viewers.

## Blocked by

#10 — JSON and CSV Export

## Status: ready-for-agent

- [ ] Create HTML template with embedded JSON data
- [ ] Include side-by-side diff viewers in HTML
- [ ] Add color-coded highlighting (green/red/yellow)
- [ ] Implement filterable/sortable diff list
- [ ] Add expand/collapse for nested fields
- [ ] Include summary statistics in HTML
- [ ] Make report shareable (self-contained with embedded data)
- [ ] Add \"Download HTML Report\" button
- [ ] Implement \"Open in Browser\" functionality
- [ ] Ensure responsive design for HTML report
- [ ] Write component tests for HTML export
- [ ] Write E2E tests for HTML report generation and opening" \
  --label "ready-for-agent,enhancement" \
  --blocking 10

# Issue 12: Real-time Monitoring
gh issue create \
  --title "# 12 — Real-time Monitoring" \
  --body "# 12 — Real-time Monitoring

## What to build

Implement real-time comparison monitoring using MongoDB Change Streams to detect and display changes as they happen.

## Blocked by

#11 — HTML Report Export

## Status: ready-for-agent

- [ ] Implement MongoDB Change Streams for source instance
- [ ] Implement MongoDB Change Streams for target instance
- [ ] Create WebSocket connection for real-time updates
- [ ] Implement change detection on stream events
- [ ] Re-compute diff on-the-fly when changes occur
- [ ] Add notification system for detected changes
- [ ] Create monitoring toggle UI component
- [ ] Display \"Last Update\" timestamp
- [ ] Add \"Refresh\" button for manual comparison
- [ ] Implement connection stability with reconnection logic
- [ ] Write unit tests for change stream integration
- [ ] Write E2E tests for real-time monitoring workflow" \
  --label "ready-for-agent,enhancement" \
  --blocking 11

# Issue 13: Performance Optimization
gh issue create \
  --title "# 13 — Performance Optimization" \
  --body "# 13 — Performance Optimization

## What to build

Optimize the application for large result sets with virtual scrolling, Web Workers, and efficient memory management.

## Blocked by

#12 — Real-time Monitoring

## Status: ready-for-agent

- [ ] Implement virtual scrolling for long diff lists (react-window or react-virtualized)
- [ ] Move diff computation to Web Worker for large datasets
- [ ] Implement pagination for document lists
- [ ] Add lazy loading for nested field details
- [ ] Optimize memory usage for large comparison results
- [ ] Implement loading state optimization (skeleton screens)
- [ ] Add progress indicators for long-running comparisons
- [ ] Optimize bundle size with code splitting
- [ ] Implement caching for repeated comparisons
- [ ] Write performance benchmarks
- [ ] Write component tests for virtualized lists" \
  --label "ready-for-agent,enhancement" \
  --blocking 12

# Issue 14: Accessibility Compliance
gh issue create \
  --title "# 14 — Accessibility Compliance" \
  --body "# 14 — Accessibility Compliance

## What to build

Ensure full accessibility compliance with keyboard navigation, ARIA labels, and screen reader support.

## Blocked by

#13 — Performance Optimization

## Status: ready-for-agent

- [ ] Implement full keyboard navigation (arrow keys, Tab, Enter, Escape)
- [ ] Add ARIA labels to all interactive elements
- [ ] Ensure proper focus management in modals
- [ ] Test screen reader compatibility (NVDA, JAWS, VoiceOver)
- [ ] Fix color contrast issues (WCAG AA compliance)
- [ ] Add skip-to-content link
- [ ] Implement accessible form labels
- [ ] Ensure table accessibility for diff data
- [ ] Add keyboard shortcuts documentation
- [ ] Run accessibility audit (axe-core or similar)
- [ ] Write accessibility tests" \
  --label "ready-for-agent,enhancement" \
  --blocking 13

# Issue 15: Testing Suite
gh issue create \
  --title "# 15 — Testing Suite" \
  --body "# 15 — Testing Suite

## What to build

Implement comprehensive testing suite with unit, integration, and E2E tests targeting >80% coverage.

## Blocked by

#14 — Accessibility Compliance

## Status: ready-for-agent

- [ ] Set up Vitest for unit testing
- [ ] Set up React Testing Library for component testing
- [ ] Set up Playwright for E2E testing
- [ ] Write unit tests for all services (target: >80% coverage)
- [ ] Write component tests for all UI components
- [ ] Write E2E tests for critical user workflows
- [ ] Implement test fixtures and mocks for MongoDB
- [ ] Set up test coverage reporting
- [ ] Add CI/CD pipeline for automated testing
- [ ] Write integration tests for MongoDB connections
- [ ] Run final test coverage report and address gaps" \
  --label "ready-for-agent,enhancement" \
  --blocking 14

# Issue 16: Desktop Build (Electron)
gh issue create \
  --title "# 16 — Desktop Build (Electron)" \
  --body "# 16 — Desktop Build (Electron)

## What to build

Package the application as a desktop app for Windows, macOS, and Linux using Electron.

## Blocked by

#15 — Testing Suite

## Status: ready-for-agent

- [ ] Set up Electron build configuration
- [ ] Configure auto-updater for desktop app
- [ ] Create platform-specific builds (Windows, macOS, Linux)
- [ ] Implement native notifications for monitoring
- [ ] Add app icon and branding
- [ ] Create installer for each platform
- [ ] Test desktop app on all platforms
- [ ] Implement desktop-specific features (system tray, notifications)
- [ ] Write desktop E2E tests
- [ ] Package and distribute desktop installer" \
  --label "ready-for-agent,enhancement" \
  --blocking 15

# Issue 17: Web Build and Deployment
gh issue create \
  --title "# 17 — Web Build and Deployment" \
  --body "# 17 — Web Build and Deployment

## What to build

Build and deploy the web version of the application to a CDN with production optimizations.

## Blocked by

#16 — Desktop Build (Electron)

## Status: ready-for-agent

- [ ] Optimize production build (Vite production build)
- [ ] Configure CDN deployment (Vercel or Netlify)
- [ ] Set up custom domain (if applicable)
- [ ] Implement server-side rendering or static export
- [ ] Add meta tags and SEO optimization
- [ ] Configure HTTPS and security headers
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics (optional)
- [ ] Write deployment documentation
- [ ] Deploy to staging environment for testing
- [ ] Deploy to production environment" \
  --label "ready-for-agent,enhancement" \
  --blocking 16

# Issue 18: Documentation and Final Polish
gh issue create \
  --title "# 18 — Documentation and Final Polish" \
  --body "# 18 — Documentation and Final Polish

## What to build

Create comprehensive documentation and finalize all user-facing materials for the MongoDB Diff UI.

## Blocked by

#17 — Web Build and Deployment

## Status: ready-for-agent

- [ ] Write user guide (installation, setup, usage)
- [ ] Write developer documentation (codebase overview, contribution guide)
- [ ] Write API documentation for service layer
- [ ] Create architecture diagrams
- [ ] Write migration guide from CLI to UI
- [ ] Create tutorial videos or GIFs
- [ ] Write changelog for initial release
- [ ] Create FAQ documentation
- [ ] Review and update all in-code comments
- [ ] Run final QA checklist
- [ ] Prepare release notes" \
  --label "ready-for-agent,enhancement" \
  --blocking 17

# Issue 19: Wireframe Review and Feedback
gh issue create \
  --title "# 19 — Wireframe Review and Feedback" \
  --body "# 19 — Wireframe Review and Feedback

## What to build

Review the interactive wireframes and gather user feedback on the UI design before implementation begins.

## Blocked by

None — can start immediately (parallel to 01)

## Status: ready-for-human

- [ ] Review wireframes in \`/Users/chiya/GIT/OpenCode-Work/mongo-compare/ecc-design/mongo-diff-ui-wireframes.html\`
- [ ] Test all 8 wireframe slides (connection, collections, results, diff views, snapshots, export)
- [ ] Provide feedback on UI layout and flow
- [ ] Suggest improvements to interaction patterns
- [ ] Confirm color scheme and visual style
- [ ] Verify navigation and workflow make sense
- [ ] Approve wireframes before moving to implementation" \
  --label "ready-for-human,enhancement"

# Issue 20: Component Architecture Review
gh issue create \
  --title "# 20 — Component Architecture Review" \
  --body "# 20 — Component Architecture Review

## What to build

Review the component architecture document and provide feedback on the proposed structure before implementation begins.

## Blocked by

None — can start immediately (parallel to 01)

## Status: ready-for-human

- [ ] Review component architecture in \`/Users/chiya/GIT/OpenCode-Work/mongo-compare/docs/component-architecture.md\`
- [ ] Verify directory structure matches project needs
- [ ] Confirm state management approach (Context + useReducer → Zustand)
- [ ] Check service layer separation (MongoDB client, diff engine, snapshot, export)
- [ ] Review hook definitions for completeness
- [ ] Verify performance optimization strategies
- [ ] Check accessibility considerations
- [ ] Provide feedback on extensibility points
- [ ] Approve architecture before moving to implementation" \
  --label "ready-for-human,enhancement"

# Issue 21: Implementation Plan Review
gh issue create \
  --title "# 21 — Implementation Plan Review" \
  --body "# 21 — Implementation Plan Review

## What to build

Review the 8-week implementation plan and provide feedback on the phased approach before execution begins.

## Blocked by

None — can start immediately (parallel to 01)

## Status: ready-for-human

- [ ] Review implementation plan in \`/Users/chiya/GIT/OpenCode-Work/mongo-compare/docs/implementation-plan.md\`
- [ ] Verify 8-week timeline is realistic
- [ ] Check Phases 1-8 coverage of all requirements
- [ ] Review technical decisions (React + TypeScript + MongoDB driver)
- [ ] Verify risk mitigation strategies
- [ ] Check success criteria alignment with MVP
- [ ] Provide feedback on sprint planning
- [ ] Approve plan before starting implementation" \
  --label "ready-for-human,enhancement"

# Issue 22: Domain Model Validation
gh issue create \
  --title "# 22 — Domain Model Validation" \
  --body "# 22 — Domain Model Validation

## What to build

Validate the domain model in CONTEXT.md against the actual use cases for the MongoDB Diff UI.

## Blocked by

None — can start immediately (parallel to 01)

## Status: ready-for-human

- [ ] Review domain model in \`/Users/chiya/GIT/OpenCode-Work/mongo-compare/CONTEXT.md\`
- [ ] Validate terms: Source Instance, Target Instance, Collection Selection, Export Format
- [ ] Check rules: Full diff output, Recursive nested detection, Hybrid ID matching
- [ ] Verify core types: ConnectionConfig, CollectionSelector, ExportResult
- [ ] Confirm usage scenarios cover all UI workflows
- [ ] Provide feedback on domain model completeness
- [ ] Update CONTEXT.md with any missing terms or rules
- [ ] Approve domain model before moving to implementation" \
  --label "ready-for-human,enhancement"

# Issue 23: ADR Validation
gh issue create \
  --title "# 23 — ADR Validation" \
  --body "# 23 — ADR Validation

## What to build

Validate the architectural decision record (ADR-0005) against the UI requirements and ensure all decisions are well-documented.

## Blocked by

None — can start immediately (parallel to 01)

## Status: ready-for-human

- [ ] Review ADR-0005 in \`/Users/chiya/GIT/OpenCode-Work/mongo-compare/docs/adr/0005-ui-comparison-architecture.md\`
- [ ] Validate decision: Dual live instance connections
- [ ] Validate decision: Browse-and-filter collection selection
- [ ] Validate decision: Full diff output with export
- [ ] Validate decision: Hybrid identifier matching
- [ ] Validate decision: Both one-time and continuous modes
- [ ] Validate decision: Snapshot saving/loading
- [ ] Review consequences and trade-offs
- [ ] Provide feedback on architectural decisions
- [ ] Update ADR if needed before implementation" \
  --label "ready-for-human,enhancement"

# Issue 24: Integration with Existing CLI
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
  --label "ready-for-agent,enhancement" \
  --blocking 24

# Issue 25: Security Audit
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
  --label "ready-for-agent,enhancement" \
  --blocking 25

# Issue 26: Multi-Instance Support (Advanced)
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
  --label "ready-for-agent,enhancement" \
  --blocking 26

# Issue 27: Advanced Diff Visualization (Advanced)
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
  --label "ready-for-agent,enhancement" \
  --blocking 27

# Issue 28: Cloud Deployment (Advanced)
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
  --label "ready-for-agent,enhancement" \
  --blocking 28

echo "All issues created successfully!"
