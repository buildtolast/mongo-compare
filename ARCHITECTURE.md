# MongoDB Diff UI - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              USER BROWSER                                        │
│                                   │                                              │
└───────────────────────────────────┼──────────────────────────────────────────────┘
                                    │
                                    │ HTTP/HTTPS (Port 80)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           NGINX (Port 80)                                       │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │  React UI (Static Files)                                                  │  │
│  │  - Serves /usr/share/nginx/html                                           │  │
│  │  - Handles SPA routing (try_files $uri $uri/ /index.html)                │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                   │                                              │
│                                   │ /api/* proxy                                 │
│                                   ▼                                              │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │  Rust Backend API (actix-web) - Port 8080                                │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │  │
│  │  │ Endpoints:                                                          │  │  │
│  │  │ - POST /api/test-connection                                         │  │  │
│  │  │ - POST /api/get-databases                                           │  │  │
│  │  │ - POST /api/get-collections                                         │  │  │
│  │  │ - POST /api/run-comparison                                          │  │  │
│  │  └─────────────────────────────────────────────────────────────────────┘  │  │
│  │                                   │                                         │  │
│  │                                   ▼                                         │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │  │
│  │  │ MongoDB Client (mongodb crate)                                      │  │  │
│  │  │ - Connects to MongoDB instances                                     │  │  │
│  │  │ - Runs comparisons using diffEngine logic                           │  │  │
│  │  └─────────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ MongoDB Protocol (Port 27017)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         MongoDB (Port 27017)                                    │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │  - Source Database (e.g., "source_db")                                  │  │
│  │  - Target Database (e.g., "target_db")                                  │  │
│  │  - Collections to compare                                               │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

1. **User opens UI** → Browser loads React app from nginx (port 80)
2. **User enters connection config** → UI calls `/api/test-connection`
3. **Nginx proxies to Rust backend** → `/api/*` requests forwarded to port 8080
4. **Rust backend connects to MongoDB** → Validates connection
5. **User selects collections** → UI calls `/api/get-collections`
6. **Rust backend queries MongoDB** → Returns collection list
7. **User clicks "Compare"** → UI calls `/api/run-comparison`
8. **Rust backend fetches docs** → Reads from source & target MongoDB
9. **Rust backend runs comparison** → Uses `compare_documents()` from lib
10. **Results returned to UI** → UI displays diff stats and details

## Container Architecture (Docker)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Docker Network: mongo-compare-network                  │
│                                                                                 │
│  ┌──────────────────────┐         ┌──────────────────────┐                     │
│  │   mongo-diff:latest  │         │     mongo:7.0        │                     │
│  │                      │         │                      │                     │
│  │  - nginx:80          │─────────│─ Port 27017          │                     │
│  │  - rust:8080         │         │                      │                     │
│  │                      │         │  Data Volume:        │                     │
│  │  Ports:              │         │  - mongo-data        │                     │
│  │  - 80:80 (UI)        │         └──────────────────────┘                     │
│  │  - 8080:8080 (API)   │                                                      │
│  └──────────────────────┘                                                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Environment Variables

### React UI (via nginx config)
```bash
# No env vars needed - API URL is hardcoded to localhost:8080
```

### Rust Backend
```bash
# No env vars needed - MongoDB connection strings come from API requests
```

### MongoDB
```bash
MONGO_INITDB_DATABASE=testdb
```

## Build Process

1. **Build React UI** (`node:20-alpine`)
   - `npm install`
   - `npm run build`
   - Output: `/app/mongo-diff-ui/dist`

2. **Build Rust Backend** (`rust:1.80-alpine`)
   - `cargo build --release --bin mongo-compare-server`
   - Output: `/app/target/release/mongo-compare-server`

3. **Production Image** (`nginx:alpine`)
   - Copy React dist to `/usr/share/nginx/html`
   - Copy Rust binary to `/usr/local/bin/`
   - Copy nginx config with proxy rules
   - Start both services on container run

## Key Design Decisions

1. **Single Container**: Simplifies deployment - no cross-container networking
2. **Nginx as Reverse Proxy**: Serves static files + proxies /api to Rust
3. **Rust Backend**: Leverages existing diff logic, handles MongoDB connections
4. **No CORS issues**: Both UI and API on same origin (port 80)
