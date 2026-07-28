# Test Dataset: Updated Documents

## Before Collection

```json
[
  {"_id": {"$oid": "000000000000000000000001"}, "id": 1, "name": "Original Name 1", "value": 100, "nested": {"field": "old"}},
  {"_id": {"$oid": "000000000000000000000002"}, "id": 2, "name": "Original Name 2", "value": 200}
]
```

## After Collection

```json
[
  {"_id": {"$oid": "000000000000000000000001"}, "id": 1, "name": "Updated Name 1", "value": 100, "nested": {"field": "new"}},
  {"_id": {"$oid": "000000000000000000000002"}, "id": 2, "name": "Updated Name 2", "value": 250}
]
```

## Expected Results

- **Created**: 0
- **Updated**: 2
  - Document 1: name changed, nested.field changed
  - Document 2: name changed, value changed
- **Deleted**: 0

## Test Verification

```rust
assert_eq!(created, 0);
assert_eq!(updated, 2);
assert_eq!(deleted, 0);

// Verify document 1 changes
assert!(sample_updated.iter().any(|d| {
    d.identifier == "1" &&
    d.changed_fields.iter().any(|f| f.field_name == "name") &&
    d.changed_fields.iter().any(|f| f.field_name == "nested.field")
}));

// Verify document 2 changes
assert!(sample_updated.iter().any(|d| {
    d.identifier == "2" &&
    d.changed_fields.iter().any(|f| f.field_name == "value")
}));
```
