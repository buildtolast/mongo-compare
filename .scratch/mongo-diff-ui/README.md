# MongoDB Diff UI — implementation tickets

Status: **MVP complete.** All 28 original tickets (01-28) plus 4 follow-on
tickets discovered during implementation (29-32) are done. This directory is
kept as the historical record of how the MVP was built; new work gets its
own `.scratch/<feature-name>/` directory (see `../ui-theming-query-filters-inline-diff/`
for the current example) rather than adding more numbered tickets here.

## Ticket format

```
<NN>-<slug>.md
```

```markdown
# <NN> — <Ticket title>

**What to build:** the end-to-end behaviour this ticket makes work, from
the user's perspective — not a layer-by-layer implementation list.

**Blocked by:** the numbers/titles of the tickets that gate this one, or
"None — can start immediately".

**Status:** ✅ Completed

- [x] Acceptance criterion 1
- [x] Acceptance criterion 2
```

## What was built, by category

**01-18 — MVP implementation chain** (each blocked by the previous): project
setup, MongoDB client service, connection UI, collection discovery, snapshot
management, diff engine, results summary, side-by-side viewer, color-coded
viewer, JSON/CSV export, HTML report, real-time monitoring, performance
optimization, accessibility, testing suite, desktop build, web build,
documentation.

**19-23 — Review tickets** (ran in parallel, non-blocking): wireframe
review, architecture review, plan review, domain model validation, ADR
validation.

**24-28 — Advanced/post-MVP tickets**: CLI integration, security audit,
multi-instance support, advanced visualization, cloud deployment.

**29-32 — Follow-on tickets discovered during implementation** (not part of
the original 28, added once real integration work surfaced gaps the
planning tickets didn't anticipate): diff engine service implementation
details, a Rust backend compilation fix for Docker deployment, the actual
end-to-end (React UI + Rust backend + MongoDB) implementation, and its
integration tests.

## Related documentation

- **Feature spec:** `../../FEATURE-SPEC-MONGO-DIFF-UI.md` — the original MVP scope
- **Context:** `../../CONTEXT.md` — domain model and language
- **ADRs:** `../../docs/adr/` — architectural decisions
- **Current/active work:** other directories under `.scratch/` (e.g.
  `../ui-theming-query-filters-inline-diff/`)
