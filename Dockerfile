# Multi-stage build for production deployment

# Backend build stage
FROM node:18-alpine as backend-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ ./

# Frontend build stage
FROM node:18-alpine as frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . ./
RUN npm run build

# Production stage
FROM node:18-alpine as production

# Install production dependencies for backend
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy backend application
COPY server/ ./

# Copy built frontend
COPY --from=frontend-builder /app/build ./public

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3001/api/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"

# Start the application
CMD ["node", "server.js"]