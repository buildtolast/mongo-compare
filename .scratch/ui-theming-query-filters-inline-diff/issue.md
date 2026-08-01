# UI Personalization, Query-Scoped Comparisons, and Inline Diff Review

## Description

The MongoDB Diff UI's original MVP (tickets 01-28) shipped comparison, discovery,
export, and side-by-side/color-coded diff viewer components, but three
capabilities were built on top of that MVP without a formal spec: a
multi-theme UI, the ability to scope a Comparison to a subset of Documents
via a query filter, and making the existing side-by-side diff viewer reachable
directly from the results view instead of only via HTML export. This spec
formalizes those three capabilities retroactively so they have proper
acceptance criteria, test coverage, and ADR-level rationale instead of
existing only as undocumented working code.

See `spec.md` in this directory for the full spec.

## Acceptance criteria

- [x] User can switch between 6 named themes from the results/dashboard header
- [x] Theme selection persists across page reloads
- [x] All interactive surfaces (connection panels, comparison form, results,
      diff viewers, dialogs) render correctly in all 6 themes — no
      hardcoded-color elements left unthemed
- [x] User can supply an optional query filter (MongoDB filter-document JSON)
      for the Source Instance and, independently, for the Target Instance
      before running a Comparison
- [x] An empty/omitted filter preserves current unfiltered behavior exactly
- [x] Invalid filter JSON is rejected with a clear, field-scoped error before
      any network request is made
- [x] Comparison Result reflects only Documents matching the supplied
      filter(s) on each side
- [x] User can view the side-by-side diff of updated Documents directly in
      the results view, without exporting/downloading the HTML report first
- [x] Backend integration test (HTTP-boundary) covers filtered vs. unfiltered
      comparison behavior and the invalid-filter error path
- [x] Frontend integration test (rendered-DOM) covers theme switching +
      persistence, filter input validation, and the inline side-by-side view

## Priority

Medium — the app is fully functional without these three capabilities, but
they were already built and are live; this ticket exists to bring them under
test coverage and document rationale, closing gaps flagged in a Standards+Spec
code review of the working tree.

## Status

Done. Test seams implemented in commit `406e93e` (`src/server_app.rs` +
`tests/run_comparison_filter_test.rs` for the backend HTTP boundary,
`mongo-diff-ui/src/App.integration.test.tsx` for the frontend rendered-DOM
seam). A Standards+Spec code review ran against that diff before commit;
its two findings (missing `build_filter_doc` unit tests, missing standalone
toggle-back-to-Summary test) were fixed in the same commit.

## Label

ready-for-agent → done
