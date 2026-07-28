# Domain docs

This is a **single-context** project. All domain documentation lives at the repository root.

## Files

| File | Purpose |
|------|---------|
| `CONTEXT.md` | Domain glossary, ubiquitous language, and core concepts |
| `docs/adr/` | Architectural Decision Records (ADRs) |

## How to consume

1. **For domain language**: Read `CONTEXT.md` first to understand the project's terminology
2. **For architectural decisions**: Check `docs/adr/` for past decisions

## ADR format

ADRs follow this structure:

```
docs/adr/
├── 0001-event-sourced-orders.md
└── 0002-postgres-for-write-model.md
```

Each ADR should:
- Name the decision
- Describe the problem
- List alternatives considered
- Explain the chosen approach
- Document trade-offs
