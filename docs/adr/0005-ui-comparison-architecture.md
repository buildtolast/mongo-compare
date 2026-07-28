# MongoDB UI Comparison Architecture

We're building a desktop/web UI for comparing live MongoDB instances that extends the existing CLI library with full diff output support, multiple export formats, and continuous monitoring capabilities.

**Context**: The existing CLI tool provides document-level comparison with sample-limited results. The UI needs to support live MongoDB connections, full result sets, and interactive exploration.

**Decision**: The UI will support:
- **Dual live instance connections**: Two separate MongoDB instances with full connection configuration (auth, TLS, pooling)
- **Browse-and-filter collection selection**: UI shows available databases/collections with search/filter, plus pattern matching for batch operations
- **Full diff output with export**: Complete comparison data exported to JSON, CSV, and HTML (with color-coded highlighting and side-by-side viewers)
- **Hybrid identifier matching**: Auto-detect common ID fields with manual override, plus composite key support
- **Both one-time and continuous modes**: Manual comparison runs and real-time monitoring via change streams
- **Snapshot saving/loading**: Persist and reload comparison configurations for recurring tasks

**Why**:
- Users need to compare live databases for sync validation, not just backup files
- Full diff output is required for comprehensive analysis (no sample limiting)
- Multiple export formats support different user workflows (technical JSON, business CSV, visual HTML)
- Hybrid ID detection balances automation with control for complex schemas
- Continuous monitoring addresses ongoing sync verification needs
- Snapshots enable repeatable comparison workflows

**Consequences**:
- UI requires more sophisticated connection management than CLI
- Export functionality must handle large result sets efficiently
- Real-time monitoring needs MongoDB change stream support
- HTML export requires client-side or server-side visualization layer
