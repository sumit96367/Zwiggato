# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy dependencies and source from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 5000

# Start the application
CMD ["node", "src/server.js"]

