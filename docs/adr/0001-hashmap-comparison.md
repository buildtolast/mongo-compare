# HashMap-based document comparison for O(n) performance

We use a HashMap to store before-collection documents by identifier field, enabling O(n) comparison between before and after collections instead of O(n²) brute-force matching.

## Why this approach

- **Performance**: For large collections with thousands of documents, O(n) is critical for fast comparison
- **Simplicity**: HashMap lookups are straightforward and well-understood in Rust
- **Memory trade-off**: Acceptable for typical use cases where collections fit in memory

## Consequences

- Requires identifier field to exist in all documents
- All documents must be loaded into memory before comparison
- Not suitable for extremely large collections beyond available RAM

## Alternatives considered

- **Brute-force comparison**: Compare each before document against each after document
  - Rejected because O(n²) becomes unusable for large collections
  - Simpler code but unacceptable performance

- **Database-level comparison**: Use MongoDB aggregation pipelines for delta detection
  - Rejected because it requires running MongoDB queries and adds external dependencies
  - More complex to implement and less flexible for different data sources