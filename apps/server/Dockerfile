# Bun server Dockerfile
FROM oven/bun:1 AS builder

WORKDIR /build

# Copy root package files for monorepo
COPY package.json bun.lock ./

# Copy packages directory (shared dependencies)
COPY packages ./packages

# Copy server app
COPY apps/server ./apps/server

# Install dependencies from root
RUN bun install

# Build the server
WORKDIR /build/apps/server
RUN bun build \
  --compile \
  --minify-whitespace \
  --minify-syntax \
  --outfile server \
  src/index.ts

############################
# Production stage
############################
FROM debian:bookworm-slim

WORKDIR /app

# Install required dependencies for bun compiled binary
RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy compiled binary from builder
COPY --from=builder /build/apps/server/server .

# Make it executable
RUN chmod +x ./server

EXPOSE 3000

CMD ["./server"]
