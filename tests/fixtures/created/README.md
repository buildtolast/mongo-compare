# Test Dataset: Created Documents

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
  {"_id": {"$oid": "000000000000000000000003"}, "id": 3, "name": "Document 3", "value": 300},
  {"_id": {"$oid": "000000000000000000000004"}, "id": 4, "name": "New Document 4", "value": 400},
  {"_id": {"$oid": "000000000000000000000005"}, "id": 5, "name": "New Document 5", "value": 500}
]
```

## Expected Results

- **Created**: 2 (documents with id 4, 5)
- **Updated**: 0
- **Deleted**: 0

## Test Verification

```rust
assert_eq!(created, 2);
assert_eq!(updated, 0);
assert_eq!(deleted, 0);
assert!(sample_created.iter().any(|d| d.get("id") == Some(json!(4))));
assert!(sample_created.iter().any(|d| d.get("id") == Some(json!(5))));
```
