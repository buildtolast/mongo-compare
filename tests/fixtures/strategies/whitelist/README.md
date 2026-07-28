# Test Dataset: Diff Strategy - Whitelist

## Before Collection

```json
[
  {"_id": {"$oid": "000000000000000000000001"}, "id": 1, "name": "Original", "value": 100, "metadata": {"created": "2024-01-01"}}
]
```

## After Collection

```json
[
  {"_id": {"$oid": "000000000000000000000001"}, "id": 1, "name": "Updated", "value": 999, "metadata": {"created": "2024-01-01"}}
]
```

## Whitelist Configuration

```json
{
  "diff_strategy": {
    "fields": ["name"]
  }
}
```

## Expected Results

- **Created**: 0
- **Updated**: 1 (only name field compared)
- **Deleted**: 0

## Test Verification

```rust
let strategy = DiffStrategy::Whitelist(vec!["name".to_string()]);

assert_eq!(created, 0);
assert_eq!(updated, 1);
assert_eq!(deleted, 0);

// Only name should be in changed fields
let doc = sample_updated.first().unwrap();
assert_eq!(doc.changed_fields.len(), 1);
assert_eq!(doc.changed_fields[0].field_name, "name");
assert_eq!(doc.changed_fields[0].old_value, "Original");
assert_eq!(doc.changed_fields[0].new_value, "Updated");
```

## Notes

- value field changed (100 -> 999) but NOT in whitelist, so ignored
- metadata field changed but NOT in whitelist, so ignored
- Only name field is compared
