# 07 — Comparison Results Summary

**What to build:** Build the comparison results summary view that displays counts for created, updated, and deleted documents with color-coded visualization.

**Blocked by:** 06 — Diff Engine Integration

**Status:** ready-for-agent

- [ ] Create `SummaryStats` component with three stat cards (created, updated, deleted)
- [ ] Implement color-coded cards: green for created, yellow for updated, red for deleted
- [ ] Display counts with large, readable numbers
- [ ] Add export buttons (JSON, CSV, HTML) to summary
- [ ] Add monitoring toggle for real-time comparison
- [ ] Add "Refresh" button for manual comparison rerun
- [ ] Connect to `ComparisonContext` for results storage
- [ ] Add loading states and error handling
- [ ] Implement export functionality triggers
- [ ] Write component tests for summary view
- [ ] Write E2E tests for export workflow
