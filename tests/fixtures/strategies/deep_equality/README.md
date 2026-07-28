# Test Dataset: Diff Strategy - Deep Equality

## Before Collection

```json
[
  {"_id": {"$oid": "000000000000000000000001"}, "id": 1, "name": "Test", "nested": {"field1": "value1", "field2": "value2"}}
]
```

## After Collection

```json
[
  {"_id": {"$oid": "000000000000000000000001"}, "id": 1, "name": "Test", "nested": {"field1": "value1", "field2": "value2"}}
]
```

## Deep Equality Configuration

```json
{
  "diff_strategy": "deep_equality"
}
```

## Expected Results (No Changes)

- **Created**: 0
- **Updated**: 0
- **Deleted**: 0

## Test Verification

```rust
let strategy = DiffStrategy::DeepEquality;

assert_eq!(created, 0);
assert_eq!(updated, 0);
assert_eq!(deleted, 0);
assert_eq!(sample_updated.len(), 0);
```

## Test with Nested Object Change

### After Collection (with nested change)

```json
[
  {"_id": {"$oid": "000000000000000000000001"}, "id": 1, "name": "Test", "nested": {"field1": "value1", "field2": "NEW_VALUE"}}
]
```

### Expected Results

- **Created**: 0
- **Updated**: 1 (nested object treated as atomic)
- **Deleted**: 0

### Test Verification

```rust
let strategy = DiffStrategy::DeepEquality;

assert_eq!(created, 0);
assert_eq!(updated, 1);
assert_eq!(deleted, 0);

// With DeepEquality, the entire nested object is one "field" change
let doc = sample_updated.first().unwrap();
assert_eq!(doc.changed_fields.len(), 1);
assert_eq!(doc.changed_fields[0].field_name, "nested");
// old_value and new_value should be the full nested JSON objects
```

## Notes

- With DeepEquality, nested objects are compared as complete units
- If nested object changes at all, it's reported as one "nested" field change
- Field-by-field comparison inside nested objects does NOT occur
- The entire nested object is the unit of comparison
