# Spec: UI Personalization, Query-Scoped Comparisons, and Inline Diff Review

## Problem Statement

Users of the MongoDB Diff UI run Comparisons against real, often large
Collections and then need to make sense of the result. Three frictions show
up in that workflow today:

1. The dashboard has a single fixed dark palette. Users working long
   sessions, presenting results on a shared screen, or with different
   contrast/legibility needs have no way to change how the tool looks.
2. A Comparison always runs against every Document in the selected
   Collection(s). A user who only cares about a subset of Documents — e.g.
   "only active accounts," "only orders from the last release" — has no way
   to narrow the Comparison, and must instead run the full Comparison and
   mentally filter the Comparison Result afterward.
3. The side-by-side diff viewer for updated Documents already exists, but
   the only way to see it is to export and open an HTML report. A user who
   just wants a quick before/after look at what changed on a few Documents
   has to leave the app to see it.

## Solution

1. Add a persistent theme switcher to the dashboard header offering 6 named
   themes (Navy, Slate mono, Light editorial, Terminal, Warm amber, Violet).
   The selected theme applies to every interactive surface in the app and is
   remembered across sessions.
2. Let the user attach an optional query filter (a MongoDB filter-document,
   the same shape passed to `find()`) independently to the Source Instance
   and the Target Instance before running a Comparison. When supplied, only
   Documents matching the filter on that side are loaded into the
   Comparison. When omitted, behavior is unchanged from today.
3. Add a view toggle in the results section so the existing side-by-side
   diff viewer renders inline, right below the Comparison summary, without
   requiring an HTML export first.

## User Stories

1. As a user running a long comparison session, I want to switch the app's
   color theme, so that I can reduce eye strain or match my working
   environment.
2. As a user presenting comparison results on a shared or projected screen,
   I want a high-contrast light theme, so that the results are legible in a
   bright room.
3. As a user who prefers a terminal-style aesthetic, I want a monospace
   dark theme, so that the tool feels consistent with my other developer
   tools.
4. As a returning user, I want my theme choice to persist across page
   reloads, so that I don't have to reselect it every session.
5. As a user auditing a large Collection, I want every part of the UI —
   connection panels, the comparison form, the results view, both diff
   viewers, and any dialogs — to respect my chosen theme, so that no part of
   the app looks broken or jarring regardless of which theme I pick.
6. As a user who only cares about a subset of records, I want to supply a
   query filter for the Source Instance, so that the Comparison only
   considers Documents matching that filter.
7. As a user comparing two instances where the meaningful subset differs on
   each side, I want to supply an independent query filter for the Target
   Instance, so that Source and Target can each be scoped to what's relevant
   for that side.
8. As a user who doesn't need filtering, I want the Comparison to behave
   exactly as it does today when I leave the filter fields empty, so that
   this feature never changes existing behavior by default.
9. As a user who mistypes a filter, I want to see a clear, immediate error
   pointing at the specific field with bad JSON, so that I don't waste a
   comparison run on a request that will fail.
10. As a user who submits a well-formed but non-matching filter, I want the
    Comparison Result's totals to reflect only the filtered subset (e.g.
    Total Before / Total After), so that I can trust the counts I'm looking
    at.
11. As a user who just ran a Comparison, I want to see which fields changed
    on an updated Document side-by-side, right in the results view, so that
    I don't have to export a report first.
12. As a user reviewing an inline side-by-side diff, I want to switch back to
    the summary view, so that I can move between a high-level count and a
    detailed field-by-field look without losing my place.
13. As a user with many updated Documents, I want the inline side-by-side
    view to paginate rather than render everything at once, so that the page
    stays responsive.
14. As a developer maintaining this codebase, I want the filter parameter to
    be part of the documented Comparison Result / request contract, so that
    the Rust backend and TypeScript frontend agree on its shape the same way
    they already agree on `ComparisonResult`.

## Implementation Decisions

**Theming**
- Theme values are expressed as CSS custom properties (design tokens):
  background/panel/panel-2/border/text/text-muted/accent/accent-text/accent2/
  danger/danger-bg/warn/warn-bg/add-bg, plus semantic aliases (success,
  warning, primary, secondary) consumed by legend/status indicators.
- Each of the 6 themes is a value block selected by a `data-theme` attribute
  on the document root; switching themes is a single attribute write, no
  re-render of component logic.
- Every component must resolve its colors through these tokens — component
  libraries or utility-class systems in use (e.g. Tailwind) must reference
  the tokens via arbitrary-value syntax or inline styles rather than
  hardcoded utility color classes, since hardcoded utility classes do not
  respond to the `data-theme` attribute.
- The active theme is persisted client-side (a simple key/value store keyed
  by a stable app identifier) and restored on load, defaulting to the
  original/current theme when unset or invalid.
- The "Terminal" theme additionally swaps the base font family to a
  monospace stack; all other themes keep the existing font family.

**Query filter criteria**
- The Comparison request gains two independent, optional filter fields — one
  scoped to the Source Instance, one to the Target Instance — each accepting
  an arbitrary MongoDB filter-document (the same shape as the argument to
  `find()`).
- Server-side, each filter (when present) is converted from its wire
  representation into the native query-document type and passed to the
  corresponding side's `find()` call in place of the current unconditional
  empty-filter scan. Absent filters continue to use the current unconditional
  scan — this is a pure narrowing operation, never a behavior change when
  unused.
- A filter that fails to convert (malformed/non-object JSON) is rejected
  before any Collection is queried, with a 400-class response naming which
  side (source/target) failed and why.
- Client-side, the filter fields are free-text JSON entry, parsed and
  validated before the Comparison request is sent; a parse failure is
  surfaced inline next to the relevant field and blocks the request — the
  network call is never made with unparseable input.
- Comparison Result totals (Total Before / Total After and all delta
  category counts) are computed from the filtered Document sets, so a
  filtered Comparison's summary is self-consistent with what was actually
  compared.

**Inline diff review**
- The results view gains a two-state toggle (Summary / Side-by-side) that
  swaps which viewer renders below the Comparison summary cards; both states
  read from the same in-memory Comparison Result, no additional network
  request.
- The existing side-by-side diff viewer component's pagination,
  expand/collapse, and internal side-by-side/unified toggle are reused
  as-is — this is a wiring change (making an existing, already-tested view
  reachable), not a new viewer.
- Switching back to Summary and starting a new Comparison both reset the
  toggle back to the Summary state, so a stale Side-by-side view is never
  shown against a new or absent Comparison Result.

## Testing Decisions

A good test here exercises the feature the way a user or an external caller
would — through the HTTP contract on the backend, and through rendered
output and simulated interaction on the frontend — rather than asserting on
internal helper functions or component-private state. This project's own
code review of the working tree flagged that the previous, much larger test
suite (thousands of lines, since deleted) skewed toward this kind of
implementation-detail testing and became a maintenance burden without
proportionate confidence; this spec deliberately mandates the smallest
number of seams that still cover all three features end-to-end.

- **Backend seam — HTTP boundary**: one integration test suite exercising
  the Comparison HTTP endpoint directly (request in, JSON response out),
  covering: an unfiltered Comparison (today's behavior, unchanged); a
  Comparison with a Source-only filter narrowing the result; a Comparison
  with both Source and Target filters; and a malformed filter on each side
  producing the documented 400-class error. Prior art: this project already
  has Docker-backed integration tests for the comparison engine
  (`tests/*.rs`, `scripts/test-integration.sh`) — this suite follows the
  same pattern, run against the HTTP layer instead of the library function
  directly, since the filter-conversion and error-response logic live at
  that layer.
- **Frontend seam — rendered DOM**: one integration-style test suite
  (rendering the full dashboard, with network calls mocked) covering: theme
  selection updates the applied theme and is restored on reload; entering
  filter text and running a Comparison sends the parsed filter in the
  request; entering invalid filter JSON shows an inline error and makes no
  network call; toggling to Side-by-side after a successful Comparison
  renders the diff viewer with the returned data; toggling back to Summary
  and starting a new Comparison resets the view state. Prior art: existing
  component tests under `mongo-diff-ui/src/components/**/*.test.tsx` render
  components with React Testing Library and assert on rendered output and
  simulated user events — this suite follows the same convention at the
  whole-dashboard level rather than per-component.
- Explicitly out of scope for these two seams: unit tests against the
  filter-to-query-document conversion function in isolation, unit tests
  against individual theme CSS values, or unit tests against the
  side-by-side viewer's internal pagination state — those are implementation
  details reachable and already covered through the two seams above.

## Out of Scope

- Building new diff-visualization components — the side-by-side viewer
  already exists; this spec only makes it reachable inline.
- Saving a filter as part of a Snapshot, or any other Snapshot Management
  behavior change.
- Real-time monitoring / Change Streams integration.
- Query filters expressed as anything other than a raw MongoDB
  filter-document (no query builder UI, no saved/named filters).
- Adding themes beyond the 6 named ones, or user-defined/custom theme
  colors.
- Authentication, TLS/SSL, or connection-pooling changes — unrelated to
  these three capabilities.
- Accessibility (WCAG) audit of the new theme palettes — each theme should
  be legible, but a formal contrast audit is separate follow-up work.

## Further Notes

- The query filter capability is adjacent to, but distinct from, "Advanced
  diff strategies" — it narrows *which Documents* are loaded before
  diffing, not *how* two given Documents are diffed (that remains governed
  by the existing Diff Strategy: All/Whitelist/Blacklist/DeepEquality). This
  distinction is worth an explicit line in the ADR that formalizes this
  spec, since the original project spec listed "advanced diff strategies
  beyond existing CLI" as out-of-scope for v1 and a future reader could
  otherwise conflate the two.
- Because theming touches nearly every component file, prefer landing it as
  its own reviewable slice ahead of the filter and inline-diff work, so a
  regression is easy to bisect to "theming" vs. "behavior."
- The 6 theme names/palettes referenced here were already designed and
  approved via mockup during this feature's exploratory phase; the palette
  values themselves are an implementation detail belonging in code/ADR, not
  repeated in this spec.
