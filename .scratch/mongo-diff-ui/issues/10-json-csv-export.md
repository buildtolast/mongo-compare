# 10 — JSON and CSV Export

**What to build:** Implement JSON and CSV export functionality for comparison results with proper data formatting and file generation.

**Blocked by:** 09 — Color-Coded Diff Viewer

**Status:** ready-for-agent

- [ ] Create `ExportService` class for format-specific generation
- [ ] Implement `exportJSON()` method for full structured data
- [ ] Implement `exportCSV()` method for tabular format
- [ ] Flatten nested structures for CSV export
- [ ] Generate proper CSV headers
- [ ] Create download triggers for both formats
- [ ] Implement file naming conventions (timestamp-based)
- [ ] Add "Download JSON" button to summary
- [ ] Add "Download CSV" button to summary
- [ ] Handle large result sets with streaming or pagination
- [ ] Write unit tests for export service
- [ ] Write E2E tests for download functionality
