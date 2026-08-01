# Ticket 06: Implement Diff Engine Service

**Status:** ready-for-human

## Summary

Implement the `DiffEngine` class with multiple comparison strategies for detecting document differences between MongoDB collections.

## Implementation Checklist

- [x] Create `DiffEngine` class with comparison logic
- [x] Implement `DiffStrategy` enum (All, Whitelist, Blacklist, DeepEquality)
- [x] Support identifier-based document matching (single or composite keys)
- [x] Detect created, updated, and deleted documents
- [x] Field-level diffing with dot-notation paths for nested objects
- [x] Implement all four diff strategies
- [x] Add sample limit for large result sets
- [x] Write unit tests (target: >80% coverage)
- [x] Write integration tests for real-world scenarios

## Files

- `mongo-diff-ui/src/services/diffEngine.ts` (implementation)
- `mongo-diff-ui/src/services/diffEngine.test.ts` (unit tests)
- `mongo-diff-ui/src/services/diffEngine.integration.test.ts` (integration tests)

## Related

- Ticket 05: Snapshot Management
