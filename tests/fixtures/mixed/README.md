# Test Dataset: Mixed Changes

## Before Collection

```json
[
  {"_id": {"$oid": "000000000000000000000001"}, "id": 1, "name": "Original Name", "value": 100},
  {"_id": {"$oid": "000000000000000000000002"}, "id": 2, "name": "Document 2", "value": 200},
  {"_id": {"$oid": "000000000000000000000003"}, "id": 3, "name": "Document 3", "value": 300}
]
```

## After Collection

```json
[
  {"_id": {"$oid": "000000000000000000000001"}, "id": 1, "name": "Updated Name", "value": 100},
  {"_id": {"$oid": "000000000000000000000002"}, "id": 2, "name": "Document 2", "value": 200},
  {"_id": {"$oid": "000000000000000000000004"}, "id": 4, "name": "New Document", "value": 400}
]
```

## Expected Results

- **Created**: 1 (document with id 4)
- **Updated**: 1 (document with id 1)
- **Deleted**: 1 (document with id 3)

## Test Verification

```rust
assert_eq!(created, 1);
assert_eq!(updated, 1);
assert_eq!(deleted, 1);

// Verify created document
assert!(sample_created.iter().any(|d| d.get("id") == Some(json!(4))));

// Verify updated document
assert!(sample_updated.iter().any(|d| d.identifier == "1"));

// Verify deleted document
assert!(sample_deleted.iter().any(|d| d.get("id") == Some(json!(3))));
```
