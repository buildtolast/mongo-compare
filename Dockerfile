# Build stage for React UI
FROM node:20-alpine AS ui-builder

WORKDIR /app/mongo-diff-ui

COPY mongo-diff-ui/package*.json ./

RUN npm install

COPY mongo-diff-ui/ ./

RUN npm run build

# Build stage for Rust backend
FROM rust:1.80-alpine AS rust-builder

WORKDIR /app

COPY Cargo.toml Cargo.lock ./

RUN mkdir -p src && \
    echo 'pub mod comparison; pub mod config; pub mod mongo; pub mod output; pub mod types;' > src/lib.rs && \
    echo 'fn main() {}' > src/main.rs

COPY src/comparison.rs src/
COPY src/config.rs src/
COPY src/mongo.rs src/
COPY src/output.rs src/
COPY src/types.rs src/
COPY src/server.rs src/

RUN apk add --no-cache musl-dev openssl-dev

RUN cargo build --release --bin mongo-compare-server

# Production stage
FROM nginx:alpine

RUN apk add --no-cache curl

# Copy built React UI
COPY --from=ui-builder /app/mongo-diff-ui/dist /usr/share/nginx/html

# Copy Rust backend binary
COPY --from=rust-builder /app/target/release/mongo-compare-server /usr/local/bin/

# Create nginx config that proxies /api to Rust backend on port 8080
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    location /api { \
        proxy_pass http://127.0.0.1:8080; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_cache_bypass $http_upgrade; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

# Start Rust backend on port 8080, then nginx on port 80
CMD ["/bin/sh", "-c", "/usr/local/bin/mongo-compare-server & nginx -g 'daemon off;'"]
