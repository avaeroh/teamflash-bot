# syntax=docker/dockerfile:1

########################
# Builder
########################
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# toolchain for native addons used by @discordjs/opus, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ pkg-config libopus-dev \
 && rm -rf /var/lib/apt/lists/*
ENV npm_config_python=/usr/bin/python3

# install deps (simple & deterministic enough for our use case)
COPY package*.json ./
RUN npm install --no-audit --no-fund

# compile TypeScript -> build/
COPY . .
RUN npx tsc -p .

# prune to production deps
RUN npm prune --omit=dev

########################
# Runtime
########################
FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

# runtime libs for audio
RUN apt-get update && apt-get install -y --no-install-recommends \
    libopus0 ffmpeg \
 && rm -rf /var/lib/apt/lists/*

# copy ONLY what we need (keep node_modules as a directory!)
COPY --chown=node:node package*.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/build ./build

USER node
CMD ["npm", "start"]