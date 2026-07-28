# MongoDB Diff UI - Implementation Tickets

This directory contains individual implementation tickets for the MongoDB Diff UI project.

## Ticket Format

Each ticket follows the tracer-bullet vertical slice pattern:

```
<NN>-<slug>.md
```

Where `<NN>` is the sequential number and `<slug>` is a descriptive identifier.

## Ticket Structure

Each ticket file contains:

```markdown
# <NN> — <Ticket title>

**What to build:** the end-to-end behaviour this ticket makes work, from the user's perspective — not a layer-by-layer implementation list.

**Blocked by:** the numbers/titles of the tickets that gate this one, or "None — can start immediately".

**Status:** ready-for-agent

- [ ] Acceptance criterion 1
- [ ] Acceptance criterion 2
```

## Ticket Dependencies

Tickets are numbered in dependency order. A ticket can only start once all tickets with lower numbers (its blockers) are complete.

### Primary Dependency Chain (Implementation)

```
01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11 → 12 → 13 → 14 → 15 → 16 → 17 → 18
```

### Review Tickets (Parallel to Implementation)

Review tickets run in parallel and can be completed at any time:

- **19 — Wireframe Review** (no blockers) — Review UI wireframes
- **20 — Architecture Review** (no blockers) — Review component architecture
- **21 — Plan Review** (no blockers) — Review implementation plan
- **22 — Domain Model Validation** (no blockers) — Review CONTEXT.md
- **23 — ADR Validation** (no blockers) — Review ADR-0005

### Advanced Feature Tickets (Post-MVP)

Advanced features after MVP completion:

- **24 — CLI Integration** (blocked by 06) — Integrate with Rust CLI
- **25 — Security Audit** (blocked by 15) — Security review
- **26 — Multi-Instance Support** (blocked by 18) — Compare >2 instances
- **27 — Advanced Visualization** (blocked by 18) — Tree/graph/timeline views
- **28 — Cloud Deployment** (blocked by 18) — Cloud service deployment

## Running Tickets

1. Read the ticket you want to work on
2. Verify all blockers are complete
3. Work through the acceptance criteria
4. Mark criteria as complete when done
5. Move to the next ticket in the chain

## Current Frontier

The "frontier" is the first incomplete ticket in the chain. Work on one ticket at a time, completing it before moving to the next.

## Related Documentation

- **Feature Spec:** `FEATURE-SPEC-MONGO-DIFF-UI.md` — overview of the entire feature
- **Component Architecture:** `../docs/component-architecture.md` — detailed architecture
- **Implementation Plan:** `../docs/implementation-plan.md` — phased implementation plan
- **Wireframes:** `../../ecc-design/mongo-diff-ui-wireframes.html` — interactive UI wireframes
- **Context:** `../../CONTEXT.md` — domain model and language
- **ADR:** `../../docs/adr/0005-ui-comparison-architecture.md` — architectural decisions
