# 24 — Integration with Existing CLI

**What to build:** Define the integration strategy between the new React UI and the existing Rust CLI library.

**Blocked by:** 06 — Diff Engine Integration

**Status:** ready-for-agent

- [ ] Document CLI library API surface (what functions are exposed)
- [ ] Define Node.js bridge strategy (napi-rs or neon)
- [ ] Implement minimal Rust FFI for diff computation
- [ ] Create TypeScript wrapper for CLI library
- [ ] Test integration with test MongoDB instances
- [ ] Document CLI to UI data flow
- [ ] Handle error propagation from CLI to UI
- [ ] Performance benchmark bridge overhead
- [ ] Write integration tests for CLI-UI communication
- [ ] Document integration architecture
