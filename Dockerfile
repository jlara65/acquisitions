# See https://docs.docker.com/engine/reference/builder/
# Multi-stage Node.js build for dev and prod

# Base deps layer
FROM node:22-alpine AS base
WORKDIR /app
ENV NODE_ENV=production
# Install OS deps if needed (uncomment when native deps are required)
# RUN apk add --no-cache python3 make g++

# Only copy package manifests first (better cache)
COPY package*.json ./

# Development deps layer
FROM base AS deps-dev
ENV NODE_ENV=development
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Production deps layer (no dev deps)
FROM base AS deps-prod
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# ---------- Development image ----------
FROM node:22-alpine AS development
WORKDIR /app
ENV NODE_ENV=development
# Copy node_modules from deps-dev
COPY --from=deps-dev /app/node_modules /app/node_modules
# Copy the rest of the source
COPY . .
EXPOSE 3000
# Run the dev server (hot-reload via `node --watch` defined in package.json)
CMD ["npm", "run", "dev"]

# ---------- Production image ----------
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
# Copy only needed files
COPY --from=deps-prod /app/node_modules /app/node_modules
COPY package*.json ./
COPY src ./src
# If you have other runtime assets (e.g. drizzle config, migrations), copy them too
# COPY drizzle ./drizzle
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "start"]
