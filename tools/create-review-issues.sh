#!/bin/bash

cd /Users/chiya/GIT/OpenCode-Work/mongo-compare

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

echo "Review issues 19-23 created!"
