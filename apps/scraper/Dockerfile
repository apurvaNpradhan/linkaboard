# Go scraper Dockerfile
FROM golang:1.25.5-alpine AS builder

WORKDIR /build

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . ./

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o scraper .

############################
# Production stage
############################
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /app

# Copy binary from builder
COPY --from=builder /build/scraper .

# Make it executable
RUN chmod +x ./scraper

EXPOSE 8080

CMD ["./scraper"]
