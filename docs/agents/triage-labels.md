# Triage labels

Standard triage labels for this project:

| Label | Purpose |
|-------|---------|
| `needs-triage` | New issue requires initial evaluation |
| `needs-info` | Waiting for more details from reporter |
| `ready-for-agent` | Fully specified, ready for AI agent implementation |
| `ready-for-human` | Requires human design decisions or implementation |
| `wontfix` | Will not be actioned (deprecated, duplicate, out of scope) |

## Label usage

- **needs-triage**: Apply to all new issues automatically
- **needs-info**: Apply when clarification is needed before proceeding
- **ready-for-agent**: Apply when issue has complete specs and is ready for implementation
- **ready-for-human**: Apply when issue requires architectural decisions
- **wontfix**: Apply to issues that won't be worked on

## State machine

```
needs-triage → [evaluation] → ready-for-agent / needs-info / wontfix
needs-info → [clarified] → ready-for-agent
ready-for-agent → [implementation] → done
ready-for-human → [decision] → ready-for-agent / wontfix
```
