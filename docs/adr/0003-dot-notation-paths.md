# Dot-notation for nested field paths

We use dot-notation (e.g., `nested.field.subfield`) to represent nested field paths in ChangedField structures instead of array notation (e.g., `["nested", "field", "subfield"]`).

## Why this approach

- **Readability**: Dot-notation is more familiar to developers working with JSON and configuration files
- **String compatibility**: Easier to work with in configuration files and command-line interfaces
- **Consistency**: Matches common patterns in other tools (JSONPath, CSS selectors, etc.)

## Consequences

- Limited to fields that don't contain dots naturally (which is rare in practice)
- Can't represent arrays or objects that contain dots in their keys
- Requires special handling for keys that literally contain dots

## Alternatives considered

- **Array notation**: Use `["nested", "field", "subfield"]` for nested paths
  - Rejected because it's less readable and requires JSON parsing to read

- **Custom path format**: Use brackets with spaces like `[nested][field][subfield]`
  - Rejected because it's more verbose and less common