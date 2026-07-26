# Conservative diffing - only mark changed fields

We only mark fields as changed if their values actually differ between documents, treating identical nested objects as single units instead of recursively comparing them.

## Why this approach

- **Clarity**: Users only see meaningful changes, not identical sub-structures
- **Performance**: Avoids unnecessary recursion for unchanged nested objects
- **Simplicity**: Easier to understand and debug the comparison results

## Consequences

- Requires recursive traversal to identify truly changed nested fields
- Identical nested objects are not broken down, which may hide changes in some edge cases
- Null handling requires special consideration (null-to-null changes are not marked)

## Alternatives considered

- **Full deep comparison**: Recursively compare all nested objects regardless of values
  - Rejected because it generates noise for unchanged nested structures
  - More expensive and less useful for most use cases

- **Shallow comparison**: Only compare top-level fields
  - Rejected because it can't detect nested changes at all