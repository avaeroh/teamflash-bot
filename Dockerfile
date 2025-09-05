# syntax=docker/dockerfile:1

########################
# Builder: compilers + dev deps
########################
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# Toolchain for native addons (@discordjs/opus etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ pkg-config libopus-dev \
 && rm -rf /var/lib/apt/lists/*
ENV npm_config_python=/usr/bin/python3

# Install deps (prod + dev)
COPY package*.json ./
RUN npm ci

# Copy source and build (force output to dist/)
COPY . .
RUN npx tsc -p . --outDir dist

# Prune to production deps
RUN npm prune --omit=dev

########################
# Runtime: small, only what we need
########################
FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Runtime libs for audio
RUN apt-get update && apt-get install -y --no-install-recommends \
    libopus0 ffmpeg \
 && rm -rf /var/lib/apt/lists/*

# Copy pruned node_modules, package files, and compiled JS
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/index.js"]
