# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Brouc is an online multiplayer card game built as a single Next.js 16 app (App Router, React 19, TypeScript strict mode) with a custom server for Socket.io WebSocket support. PostgreSQL via Prisma 7, Better Auth with Google OAuth, Redis for game state, Docker deployment on VPS.

The game "Le Brouc" is a traditional Swiss trick-taking card game from L'Étivaz (VD), played with 32 French cards by 4 players in 2 teams. Full rules in `public/doc/rules.md`.

UI text is French. Code, comments, and identifiers are English.

## Commands

```bash
pnpm dev                    # Start dev server (Next.js + Socket.io via custom server)
pnpm build                  # prisma generate -> migrate deploy -> seed -> next build (touches DB!)
pnpm test                   # Vitest once
pnpm test:coverage          # Vitest with coverage
pnpm vitest run tests/path/to/file.test.ts  # Single test file
pnpm vitest run -t "name"   # Tests matching pattern
pnpm exec tsc --noEmit      # Type-check
pnpm exec biome check .     # Lint/format check (matches CI)
pnpm check                  # Biome check --write
pnpm check:all              # Biome + knip (dead code)
pnpm generate               # Generate Prisma client
pnpm migrate                # Local prisma migrate dev (schema changes)
pnpm db:deploy              # generate + migrate deploy + seed (no next build)
pnpm db:reset               # Reset database with --force
pnpm db:studio              # Prisma Studio
pnpm docker:up              # Start PostgreSQL + Redis
pnpm docker:down            # Stop containers
```

## Architecture

### Boundaries

- `app/` — Routes and page orchestration. Route groups: `(public)/`, `admin/`, `api/`, `play/`
- `components/` — UI split by domain: `public/`, `admin/`, `game/`, `lobby/`, `ui/` (primitives), `providers/`
- `lib/game/` — Pure game engine (rules, scoring, deck, state machine). No IO, no side effects.
- `lib/socket/` — Socket.io server setup, room management, game event handlers, Redis state store
- `lib/actions/` — Server Actions for mutations via `authenticatedAction()` wrapper
- `lib/services/` — Read-side cached data access (server-only, `'use cache'`, `cacheTag()`)
- `lib/core/` — Auth, env, logger, Prisma client, Redis client
- `lib/validations/` — Zod v4 schemas
- `lib/config/constants/` — Named constants (new constants go here)
- `lib/utils/` — Helpers (formatting, cn, role, etc.)
- `prisma/` — Schema, migrations, seed, generated client at `prisma/generated/prisma`
- `proxy.ts` — Edge middleware for admin route protection
- `server.ts` — Custom Node server wrapping Next.js + Socket.io

### Real-Time Architecture

- Custom `server.ts` wraps Next.js HTTP handler + Socket.io on same port
- Game state lives in Redis (`ioredis`) for crash recovery and scaling
- Game logic is server-authoritative: clients send intents, server validates via `lib/game/`
- Socket.io rooms map to game tables (4 players per room)
- Client receives only their own hand (anti-cheat)

### Auth & Admin Protection

- Two-tier: `USER` and `ADMIN` roles (stored in DB via Better Auth)
- `proxy.ts` (edge) + app-level checks protect admin routes
- Session reads: `getSession()` from `lib/services/auth.ts`

### Data Access Pattern

**Reads:** `lib/services/*` — server-only, cached with `'use cache'` + `cacheTag()`.

**Writes:** `lib/actions/*` — use `authenticatedAction()` which centralizes auth, role checks, Zod validation.

## Repo Conventions

- Every `.ts`/`.tsx` file starts with the repository header block (File, Description, Author, License, Copyright).
- Prisma client generated to `prisma/generated/prisma`. Import `Role` and other enums from `@/prisma/generated/prisma`.
- Runtime env access through `lib/core/env.ts` (exceptions: `proxy.ts`, Prisma config/seed).
- Prisma CLI reads `.env.local` via `prisma.config.ts`. Prisma 7 does NOT use `url`/`directUrl` in schema — those go in `prisma.config.ts`.
- Biome for lint/format (not ESLint/Prettier). `noExplicitAny: error`.
- `cn()` from `@/lib/utils/cn`, not `@/lib/utils`.
- Numeric form inputs: `z.number()` + React Hook Form `{ valueAsNumber: true }`.
- Behavior changes must ship with tests.
- Game engine (`lib/game/`) must be pure functions with comprehensive tests.

## Gotchas

- `pnpm build` and `pnpm db:deploy` both touch the target database. Double-check `.env.local` DB before running.
- Do NOT run `prisma migrate dev` against remote environments.
- Socket.io server requires the custom `server.ts` — plain `next dev` won't have WebSocket support.
- Game state in Redis has TTL — abandoned games expire after 2h.
