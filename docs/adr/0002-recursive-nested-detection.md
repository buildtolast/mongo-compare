# Recursive nested field change detection

We use recursive traversal to detect changes at any nested depth, producing dot-notation paths (e.g., `nested.field.subfield`) instead of treating nested objects as atomic units.

## Why this approach

- **Granularity**: Users need to know which specific nested fields changed, not just that a nested object changed
- **Consistency**: Matches the expected behavior of JSON diff tools
- **Use cases**: Common in migrations where specific nested fields are modified

## Consequences

- More complex comparison algorithm with nested recursion
- Dot-notation paths can become long for deeply nested structures
- Requires careful handling of object equality at each level

## Alternatives considered

- **Atomic nested comparison**: Treat nested objects as single units
  - Rejected because users can't see which specific nested fields changed
  - Simpler but less useful for most use cases

- **Flat structure flattening**: Pre-flatten all nested paths before comparison
  - Rejected because it requires modifying input data and loses nesting context