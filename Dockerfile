# ============================================
# STAGE 1: Build
# ============================================
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./

# Install ALL dependencies (including dev for build)
RUN npm install

# Copy source code
COPY . .

# Build NestJS
RUN npm run build

# ============================================
# STAGE 2: Production
# ============================================
FROM node:20-slim

WORKDIR /app

# Install only production deps
COPY package*.json ./
RUN npm install --omit=dev

# Copy build output from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
