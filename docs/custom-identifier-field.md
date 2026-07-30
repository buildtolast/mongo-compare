# Custom Identifier Field Support

## Overview

MongoDB Compare now supports custom identifier fields for matching documents between collections. This allows users to specify any field that uniquely identifies documents in their MongoDB collections.

## Features

### 1. Dropdown for Common Fields
Quick selection of common identifier fields:
- `_id` (MongoDB default ObjectId)
- `id` (common custom field)
- `ID` (uppercase custom field)

### 2. Custom Field Input
Users can type any custom field name that uniquely identifies documents in their collection.

### 3. Composite Keys Support
Users can also specify composite keys (multiple fields combined) for complex matching scenarios.

## How It Works

### Document Matching Process

```
BEFORE Collection (users):
{
  _id: ObjectId("..."),
  email: "alice@example.com",
  age: 25
}

AFTER Collection (users):
{
  _id: ObjectId("..."),
  email: "alice@example.com",
  age: 26
}

IDENTIFIER FIELD: "_id"
MATCH: Same _id, different age → UPDATED document
```

### Example Scenarios

#### Scenario 1: Custom Field Identifier
```
BEFORE:
{ user_id: 1, name: "Alice", email: "alice@test.com" }

AFTER:
{ user_id: 1, name: "Alice", email: "alice@test.com" }

IDENTIFIER FIELD: "user_id"
MATCH: Same user_id, no changes → IDENTICAL
```

#### Scenario 2: Composite Keys
```
BEFORE:
{ email: "alice@test.com", phone: "555-0100" }

AFTER:
{ email: "alice@test.com", phone: "555-0100", address: "123 Main St" }

IDENTIFIER FIELD: "email,phone" (composite)
MATCH: Same email and phone → UPDATED document
```

#### Scenario 3: Different Identifier Types
```
BEFORE: { id: "user-123", name: "Alice" }
AFTER:  { id: "user-123", name: "Alice" }
IDENTIFIER: "id"

BEFORE: { username: "alice", email: "alice@test.com" }
AFTER:  { username: "alice", email: "alice@test.com" }
IDENTIFIER: "username"

BEFORE: { email: "alice@test.com" }
AFTER:  { email: "alice@test.com", active: true }
IDENTIFIER: "email"
```

## UI Implementation

### CollectionList Component
```tsx
<div className="space-y-1">
  <label className="block text-sm font-medium text-slate-300">
    Identifier Field
  </label>
  <div className="space-y-1">
    <select
      value={identifierField}
      onChange={handleIdentifierChange}
      className="..."
      data-testid="identifier-select"
    >
      {COMMON_IDENTIFIER_FIELDS.map((field) => (
        <option key={field} value={field}>
          {field}
        </option>
      ))}
    </select>
    <Input
      placeholder="Or type custom field name..."
      value={identifierField}
      onChange={(e) => onIdentifierChange(e.target.value)}
      data-testid="identifier-custom-input"
    />
    <p className="text-xs text-slate-500">
      Choose from common fields or type a custom field name that uniquely identifies documents
    </p>
  </div>
</div>
```

### State Management
```tsx
const [sourceIdentifierField, setSourceIdentifierField] = useState('_id')
const [targetIdentifierField, setTargetIdentifierField] = useState('_id')

const handleIdentifierChange = (
  connectionType: 'source' | 'target',
  field: string
) => {
  if (connectionType === 'source') {
    setSourceIdentifierField(field)
  } else {
    setTargetIdentifierField(field)
  }
}
```

## Technical Details

### How Document Comparison Works

1. **Fetch Documents**: Get all documents from source and target collections
2. **Build Identifier Maps**: Create HashMaps keyed by identifier field value
3. **Match Documents**: Find documents with same identifier in both collections
4. **Compare Fields**: For matched documents, compare all fields recursively
5. **Classify Changes**:
   - **Created**: Document exists in target but not source
   - **Deleted**: Document exists in source but not target
   - **Updated**: Document exists in both with field differences

### Code Example

```rust
// Rust backend comparison logic
use mongodb::{bson::doc, Client};

async fn compare_documents(
    source_client: &Client,
    target_client: &Client,
    identifier_field: &str,
) -> ComparisonResult {
    // Get collections
    let source_coll = source_client.database("source_db").collection("users");
    let target_coll = target_client.database("target_db").collection("users");

    // Fetch all documents
    let source_docs = source_coll.find(doc! {}).await.unwrap().try_collect().await.unwrap();
    let target_docs = target_coll.find(doc! {}).await.unwrap().try_collect().await.unwrap();

    // Build HashMaps by identifier field
    let mut source_map: HashMap<String, Document> = HashMap::new();
    let mut target_map: HashMap<String, Document> = HashMap::new();

    for doc in source_docs {
        let id_value = doc.get_str(identifier_field).unwrap_or("unknown");
        source_map.insert(id_value.to_string(), doc);
    }

    for doc in target_docs {
        let id_value = doc.get_str(identifier_field).unwrap_or("unknown");
        target_map.insert(id_value.to_string(), doc);
    }

    // Compare and classify changes
    let mut created_count = 0;
    let mut deleted_count = 0;
    let mut updated_count = 0;

    // Find created and deleted
    for (id, doc) in &source_map {
        if !target_map.contains_key(id) {
            deleted_count += 1;
        }
    }

    for (id, doc) in &target_map {
        if !source_map.contains_key(id) {
            created_count += 1;
        }
    }

    // Find updated
    for (id, source_doc) in &source_map {
        if let Some(target_doc) = target_map.get(id) {
            if has_field_changes(source_doc, target_doc) {
                updated_count += 1;
            }
        }
    }

    ComparisonResult {
        created_count,
        deleted_count,
        updated_count,
        // ... other fields
    }
}
```

## Best Practices

### Choosing an Identifier Field

1. **Uniqueness**: Field must uniquely identify each document
2. **Consistency**: Field value must be consistent across collections
3. **Performance**: Use indexed fields for better query performance
4. **Simplicity**: Prefer simple field names for readability

### Common Identifier Patterns

#### Pattern 1: Auto-generated IDs
```javascript
// MongoDB ObjectId
{ _id: ObjectId("..."), name: "Alice" }

// Custom auto-increment
{ id: 1, name: "Alice" }
```

#### Pattern 2: Natural Keys
```javascript
// Email as unique identifier
{ email: "alice@example.com", name: "Alice" }

// Username as unique identifier
{ username: "alice", name: "Alice" }

// UUID as unique identifier
{ uuid: "550e8400-e29b...", name: "Alice" }
```

#### Pattern 3: Composite Keys
```javascript
// Email + phone combination
{ email: "alice@example.com", phone: "555-0100", name: "Alice" }

// ID + type combination
{ id: "1", type: "user", name: "Alice" }

// Date + timestamp combination
{ date: "2024-01-01", timestamp: 1234567890, name: "Alice" }
```

### Composite Keys Format

- **Format**: Comma-separated field names
- **Example**: `email,phone` or `id,type`
- **Usage**: When no single field can uniquely identify a document
- **Note**: Composite keys must be specified in the same order in both collections

## Troubleshooting

### Issue: Documents Not Matching
**Cause**: Identifier field values differ between collections
**Solution**:
1. Verify identifier field exists in both collections
2. Check if field values are consistent
3. Try a different identifier field

### Issue: All Documents Marked as Updated
**Cause**: Identifier field value is the same but other fields differ
**Solution**:
1. Verify the identifier field is correctly identifying documents
2. Check if field values should actually be different
3. Review comparison strategy (All vs Whitelist vs Blacklist)

### Issue: Document Comparison Errors
**Cause**: Identifier field type mismatch (e.g., String vs Number)
**Solution**:
1. Check data type of identifier field in both collections
2. Ensure field names are spelled consistently
3. Try using a different identifier field

## Testing

### Manual Test Cases

1. **Test 1**: Use `_id` as identifier field
   - Source: 500 documents
   - Target: 403 documents
   - Expected: 97 deleted, 3 updated

2. **Test 2**: Use custom field `user_id` as identifier
   - Source: `{ user_id: 1, name: "Alice" }`
   - Target: `{ user_id: 1, name: "Alice" }`
   - Expected: 0 changes

3. **Test 3**: Use composite keys `email,phone`
   - Source: `{ email: "alice@test.com", phone: "555-0100" }`
   - Target: `{ email: "alice@test.com", phone: "555-0100", active: true }`
   - Expected: 1 updated

### Automated Tests

```typescript
describe('Custom Identifier Field', () => {
  it('should match documents by custom field', async () => {
    // Test with custom field
    const result = await runComparison({
      identifierField: 'user_id',
      // ... other params
    })

    expect(result.deletedCount).toBe(0)
    expect(result.updatedCount).toBe(0)
  })

  it('should handle composite keys', async () => {
    // Test with composite keys
    const result = await runComparison({
      identifierField: 'email,phone',
      // ... other params
    })

    expect(result.updatedCount).toBeGreaterThan(0)
  })
})
```

## Future Enhancements

### Planned Features
1. **Auto-detection**: Automatically suggest the best identifier field
2. **Field validation**: Validate that identifier field exists and is unique
3. **Sample data preview**: Show sample documents to verify identifier
4. **Field type inference**: Automatically detect field types
5. **Performance optimization**: Use MongoDB indexes for identifier lookups

### Improvement Ideas
1. **Smart defaults**: Auto-detect common identifier fields based on schema
2. **Field suggestions**: Suggest fields that might be unique identifiers
3. **Preview mode**: Show sample documents before running comparison
4. **Validation feedback**: Real-time validation of identifier field
5. **Error recovery**: Handle identifier field mismatches gracefully

## API Integration

### Rust Backend Endpoint
```rust
#[derive(Debug, Deserialize)]
struct RunComparisonRequest {
    source_connection_string: String,
    target_connection_string: String,
    database: String,
    target_database: Option<String>,
    collections: Vec<String>,
    identifier_field: String,  // Custom field support
    sample_limit: usize,
    diff_strategy: DiffStrategy,
}

async fn run_comparison(
    req: web::Json<RunComparisonRequest>,
) -> HttpResponse {
    // Use identifier_field for document matching
    let result = compare_documents(
        all_source_docs,
        all_target_docs,
        &req.identifier_field,  // Pass custom field
        req.sample_limit,
        req.diff_strategy.clone(),
    ).await?

    HttpResponse::Ok().json(RunComparisonResponse {
        success: true,
        result,
    })
}
```

## Migration Guide

### From Hardcoded `_id` to Custom Fields

**Before**:
```tsx
selectedCollections={{
  source: { ..., identifierField: '_id' },
  target: { ..., identifierField: '_id' },
}}
```

**After**:
```tsx
selectedCollections={{
  source: { ..., identifierField: sourceIdentifierField },
  target: { ..., identifierField: targetIdentifierField },
}}
```

### Adding Custom Field Support to Existing Projects

1. Add text input field alongside dropdown
2. Update state management to track identifier field
3. Wire up callback handlers
4. Pass identifier field to comparison API
5. Test with various field types and values

## Summary

Custom identifier field support provides flexibility for comparing MongoDB collections with different schemas and identifier strategies. This feature enables:

- ✅ Custom field identification
- ✅ Composite key support
- ✅ Flexible matching strategies
- ✅ Better data compatibility
- ✅ Improved user experience

By allowing users to specify any field that uniquely identifies documents, MongoDB Compare can now handle a wider variety of data structures and comparison scenarios.