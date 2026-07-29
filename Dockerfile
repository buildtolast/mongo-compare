# Build stage for React UI
FROM node:20-alpine AS ui-builder

WORKDIR /app/mongo-diff-ui

COPY mongo-diff-ui/package*.json ./

RUN npm install

COPY mongo-diff-ui/ ./

RUN npm run build

# Build stage for Rust backend (static binary)
FROM rust:1-alpine AS rust-builder

WORKDIR /app

COPY Cargo.toml Cargo.lock ./
COPY src ./src

RUN cargo build --release --bin mongo-compare-server

# Production stage
FROM nginx:alpine

RUN apk add --no-cache curl

# Copy built React UI
COPY --from=ui-builder /app/mongo-diff-ui/dist /usr/share/nginx/html

# Copy Rust backend binary from builder stage
COPY --from=rust-builder /app/target/release/mongo-compare-server /usr/local/bin/

# Create nginx config that proxies /api to Rust backend on port 3001
# Health check goes to Rust backend, all other requests go to React UI
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location = /health { \
        proxy_pass http://127.0.0.1:3001/health; \
        proxy_http_version 1.1; \
    } \
    \
    location /api { \
        proxy_pass http://127.0.0.1:3001; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_cache_bypass $http_upgrade; \
    } \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
        add_header Cache-Control "no-cache, no-store, must-revalidate"; \
        add_header Pragma "no-cache"; \
        add_header Expires "0"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

# Start Rust backend on port 3001, then nginx on port 80
CMD ["/bin/sh", "-c", "/usr/local/bin/mongo-compare-server & nginx -g 'daemon off;'"]
