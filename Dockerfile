# Multi-stage Dockerfile for Jordan Customs System

# Stage 1: Build frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY client/package.json ./client/

# Install pnpm and dependencies
RUN npm install -g pnpm@latest && \
    pnpm install --frozen-lockfile

# Copy source code
COPY client ./client
COPY shared ./shared
COPY tsconfig.json ./

# Build frontend
RUN pnpm run build

# Stage 2: Build backend
FROM node:22-alpine AS backend-builder
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY server/package.json ./server/

# Install pnpm and dependencies
RUN npm install -g pnpm@latest && \
    pnpm install --frozen-lockfile --prod

# Copy source code
COPY server ./server
COPY drizzle ./drizzle
COPY shared ./shared
COPY storage ./storage
COPY tsconfig.json ./

# Stage 3: Production
FROM node:22-alpine
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

# Copy dependencies
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/package.json ./

# Copy built frontend
COPY --from=frontend-builder /app/client/dist ./client/dist

# Copy server code
COPY --from=backend-builder /app/server ./server
COPY --from=backend-builder /app/drizzle ./drizzle
COPY --from=backend-builder /app/shared ./shared
COPY --from=backend-builder /app/storage ./storage

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start server
CMD ["node", "server/_core/index.ts"]
