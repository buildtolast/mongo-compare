# Build stage for React UI
FROM node:20-alpine AS ui-builder

WORKDIR /app/mongo-diff-ui

COPY mongo-diff-ui/package*.json ./

RUN npm install

COPY mongo-diff-ui/ ./

RUN npm run build

# Production stage
FROM nginx:alpine

RUN apk add --no-cache curl

# Copy built React UI
COPY --from=ui-builder /app/mongo-diff-ui/dist /usr/share/nginx/html

# Copy pre-built Rust backend binary (Linux x86-64)
COPY target/release/mongo-compare-server /usr/local/bin/

# Create nginx config that proxies /api to Rust backend on port 3001
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
        proxy_pass http://127.0.0.1:3001; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_cache_bypass $http_upgrade; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

# Start Rust backend on port 3001, then nginx on port 80
CMD ["/bin/sh", "-c", "/usr/local/bin/mongo-compare-server & nginx -g 'daemon off;'"]
