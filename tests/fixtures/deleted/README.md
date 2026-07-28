# Test Dataset: Deleted Documents

## Before Collection

```json
[
  {"_id": {"$oid": "000000000000000000000001"}, "id": 1, "name": "Document 1", "value": 100},
  {"_id": {"$oid": "000000000000000000000002"}, "id": 2, "name": "Document 2", "value": 200},
  {"_id": {"$oid": "000000000000000000000003"}, "id": 3, "name": "Document 3", "value": 300},
  {"_id": {"$oid": "000000000000000000000004"}, "id": 4, "name": "Document 4", "value": 400}
]
```

## After Collection

```json
[
  {"_id": {"$oid": "000000000000000000000001"}, "id": 1, "name": "Document 1", "value": 100},
  {"_id": {"$oid": "000000000000000000000002"}, "id": 2, "name": "Document 2", "value": 200}
]
```

## Expected Results

- **Created**: 0
- **Updated**: 0
- **Deleted**: 2 (documents with id 3, 4)

## Test Verification

```rust
assert_eq!(created, 0);
assert_eq!(updated, 0);
assert_eq!(deleted, 2);
assert!(sample_deleted.iter().any(|d| d.get("id") == Some(json!(3))));
assert!(sample_deleted.iter().any(|d| d.get("id") == Some(json!(4))));
```
