# 02 — MongoDB Client Service

**What to build:** Create a MongoDB client service that manages connections to two MongoDB instances with full authentication, TLS/SSL support, connection pooling, and collection discovery capabilities.

**Blocked by:** 01 — Project Setup

**Status:** ready-for-agent

- [ ] Implement `MongoDBClient` class with connection management
- [ ] Implement `connect()` method that accepts connection string and configuration (auth, TLS, pool settings)
- [ ] Implement `disconnect()` method with proper cleanup
- [ ] Implement `getDatabases()` to list available databases
- [ ] Implement `getCollections()` to list collections for a database
- [ ] Implement `getSampleDocument()` to fetch a sample document for schema inspection
- [ ] Add connection pool configuration (size, timeouts, retry settings)
- [ ] Add TLS/SSL support with certificate validation
- [ ] Implement error handling for connection failures with user-friendly messages
- [ ] Write unit tests for connection management (mock MongoDB driver)
- [ ] Write integration tests with Dockerized MongoDB instances (using testcontainers)
