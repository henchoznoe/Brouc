# File: Dockerfile
# Description: Multi-stage Docker build for the Brouc application.
# Author: Noé Henchoz
# License: MIT
# Copyright (c) 2026 Noé Henchoz

# ─── Base ─────────────────────────────────────────────────────────────────────

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# ─── Dependencies ─────────────────────────────────────────────────────────────

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false --ignore-scripts

# ─── Build ────────────────────────────────────────────────────────────────────

FROM base AS build
RUN apk add --no-cache git
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client — dummy URL satisfies prisma.config.ts env() call at generate time
RUN DIRECT_URL=postgresql://x:x@localhost/x DATABASE_URL=postgresql://x:x@localhost/x npx prisma generate

# Build Next.js — git init so lefthook install doesn't fail during pnpm deps check
RUN git init && pnpm next build

# ─── Production ───────────────────────────────────────────────────────────────

FROM base AS production
ENV NODE_ENV=production

# Copy necessary files
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/server.ts ./server.ts
COPY --from=build /app/lib ./lib
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/tsconfig.json ./tsconfig.json

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "--import", "tsx", "server.ts"]
