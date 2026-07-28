# 25 — Security Audit

**What to build:** Perform a comprehensive security audit of the application including connection string handling, authentication, and data exposure.

**Blocked by:** 15 — Testing Suite

**Status:** ready-for-agent

- [ ] Audit connection string storage (never store passwords)
- [ ] Review authentication flow (username/password, TLS certificates)
- [ ] Check for SQL injection vulnerabilities (MongoDB injection patterns)
- [ ] Review data export for sensitive information exposure
- [ ] Audit WebSocket communication for security
- [ ] Implement input validation on all user inputs
- [ ] Add rate limiting for comparison operations
- [ ] Review error messages for information leakage
- [ ] Run security scanning tools (npm audit, Snyk)
- [ ] Document security decisions in a new ADR
- [ ] Create security checklist for future development
