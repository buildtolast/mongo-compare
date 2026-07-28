# 02 — MongoDB Client Service

**What to build:** Create a MongoDB client service that manages connections to two MongoDB instances with full authentication, TLS/SSL support, connection pooling, and collection discovery capabilities.

**Blocked by:** 01 — Project Setup

**Blocks:** 03 — Connection Configuration UI

**Status:** ✅ Completed

**Implementation summary:**
- Implemented `MongoDBClient` class with connection management
- Implemented `connect()` method that accepts connection string and configuration (auth, TLS, pool settings)
- Implemented `disconnect()` method with proper cleanup
- Implemented `getDatabases()` to list available databases
- Implemented `getCollections()` to list collections for a database
- Implemented `getSampleDocument()` to fetch a sample document for schema inspection
- Added connection pool configuration (size, timeouts, retry settings)
- Added TLS/SSL support with certificate validation
- Implemented error handling for connection failures with user-friendly messages

**Test coverage:** 6 tests

**Commit reference:** `7e8c1031fc0097db0db5acc30206385347801ad5`

- [x] Implement `MongoDBClient` class with connection management
- [x] Implement `connect()` method that accepts connection string and configuration (auth, TLS, pool settings)
- [x] Implement `disconnect()` method with proper cleanup
- [x] Implement `getDatabases()` to list available databases
- [x] Implement `getCollections()` to list collections for a database
- [x] Implement `getSampleDocument()` to fetch a sample document for schema inspection
- [x] Add connection pool configuration (size, timeouts, retry settings)
- [x] Add TLS/SSL support with certificate validation
- [x] Implement error handling for connection failures with user-friendly messages
- [x] Write unit tests for connection management (mock MongoDB driver)
- [x] Write integration tests with Dockerized MongoDB instances (using testcontainers)
