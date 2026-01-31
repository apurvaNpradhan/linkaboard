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
FROM gcr.io/distroless/base

WORKDIR /app


COPY --from=builder /build/apps/server/server .
EXPOSE 3000

CMD ["./server"]
