#!/bin/bash

cd /Users/chiya/GIT/OpenCode-Work/mongo-compare

# Issue 03: Connection Configuration UI (blocked by 3 - MongoDB Client Service)
gh issue create \
  --title "# 03 — Connection Configuration UI" \
  --body "# 03 — Connection Configuration UI

## What to build

Build the connection configuration form that allows users to set up source and target MongoDB instances with authentication, security, and pool settings.

## Blocked by

#02 — MongoDB Client Service

## Status: ready-for-agent

- [ ] Create \`ConnectionForm\` component with source and target instance inputs
- [ ] Implement authentication section (username, password, auth database)
- [ ] Implement TLS/SSL toggle with certificate configuration
- [ ] Implement connection pool settings (pool size, connect timeout, socket timeout, server selection)
- [ ] Add \"Test Connection\" button that validates credentials
- [ ] Add \"Save as Snapshot\" button to persist configuration
- [ ] Add connection status indicators (connected/disconnected/loading)
- [ ] Add input validation with user-friendly error messages
- [ ] Connect form to \`ConnectionContext\` for state management
- [ ] Write component tests for form interactions
- [ ] Write E2E tests for test connection workflow" \
  --label "ready-for-agent,enhancement" \
  --blocking 3

echo "Issue 03 created!"
