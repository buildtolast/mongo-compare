# Test Dataset: No Changes

## Before Collection

```json
[
  {"_id": {"$oid": "000000000000000000000001"}, "id": 1, "name": "Document 1", "value": 100},
  {"_id": {"$oid": "000000000000000000000002"}, "id": 2, "name": "Document 2", "value": 200},
  {"_id": {"$oid": "000000000000000000000003"}, "id": 3, "name": "Document 3", "value": 300}
]
```

## After Collection

```json
[
  {"_id": {"$oid": "000000000000000000000001"}, "id": 1, "name": "Document 1", "value": 100},
  {"_id": {"$oid": "000000000000000000000002"}, "id": 2, "name": "Document 2", "value": 200},
  {"_id": {"$oid": "000000000000000000000003"}, "id": 3, "name": "Document 3", "value": 300}
]
```

## Expected Results

- **Created**: 0
- **Updated**: 0
- **Deleted**: 0

## Test Verification

```rust
assert_eq!(created, 0);
assert_eq!(updated, 0);
assert_eq!(deleted, 0);
assert_eq!(sample_created.len(), 0);
assert_eq!(sample_updated.len(), 0);
assert_eq!(sample_deleted.len(), 0);
```
