# 06 — Diff Engine Integration

**What to build:** Integrate the existing Rust `mongo-compare` library or implement the diff engine in TypeScript to compute document differences between source and target collections.

**Blocked by:** 05 — Snapshot Management

**Status:** ready-for-agent

- [ ] Review existing Rust `mongo-compare` library diff algorithms
- [ ] Option A: Build Node.js bridge to Rust library (using `neon` or `napi-rs`)
- [ ] Option B: Implement diff engine in TypeScript with same logic
- [ ] Implement identifier-based document matching
- [ ] Implement recursive nested field diffing with dot-notation paths
- [ ] Support composite key matching
- [ ] Implement diff strategies: All, Whitelist, Blacklist, DeepEquality
- [ ] Categorize documents: created, updated, deleted
- [ ] Generate field-level diffs with old/new values
- [ ] Handle null values correctly (added/removed fields)
- [ ] Write unit tests for diff engine (target: >80% coverage)
- [ ] Write integration tests with test MongoDB instances
