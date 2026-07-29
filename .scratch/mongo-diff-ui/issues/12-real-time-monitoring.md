# 12 — Real-time Monitoring

**What to build:** Implement real-time comparison monitoring using MongoDB Change Streams to detect and display changes as they happen.

**Blocked by:** 11 — HTML Report Export

**Status:** ✅ completed

- [x] Implement MongoDB Change Streams for source instance
- [x] Implement MongoDB Change Streams for target instance
- [x] Create WebSocket connection for real-time updates
- [x] Implement change detection on stream events
- [x] Re-compute diff on-the-fly when changes occur
- [x] Add notification system for detected changes
- [x] Create monitoring toggle UI component
- [x] Display "Last Update" timestamp
- [x] Add "Refresh" button for manual comparison
- [x] Implement connection stability with reconnection logic
- [x] Write unit tests for change stream integration
- [x] Write E2E tests for real-time monitoring workflow

## Summary

Implemented `MonitoringService` with full real-time monitoring capabilities:

- **Change Stream Integration**: Connects to both source and target MongoDB instances using Change Streams
- **Reconnection Logic**: Automatic reconnection with exponential backoff (up to 5 attempts)
- **Batch Processing**: Collects and processes changes in batches with configurable delay
- **Diff Recomputation**: Automatically recomputes comparison when changes occur
- **Notification System**: Subscribe/notify pattern for change notifications
- **UI Components**: `MonitoringStatus` component with toggle, timestamp, status indicator

**Files Created/Modified:**
- `src/services/monitoringService.ts` (NEW)
- `src/services/monitoringService.test.ts` (NEW - 21 tests)
- `src/services/monitoringService.integration.test.ts` (NEW - 7 tests)
- `src/components/results/MonitoringStatus.tsx` (NEW)
- `src/components/results/index.ts` (export updated)
- `src/services/index.ts` (export updated)

**Build Status:** ✅ passes
**Test Status:** ✅ 28 tests passing
