<div align="center">

<img src="public/assets/logo-blue.png" alt="Logo" width="auto" height="200">

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Biome](https://img.shields.io/badge/formatter|linter-biome-39B420?style=flat&logo=biome)](https://biomejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Brouc

Le jeu de cartes du Pays-d'Enhaut, en ligne et multijoueur.

</div>

## Overview

**Brouc** is an online multiplayer implementation of the traditional Swiss card game "Le Brouc" from L'Étivaz (VD). The game has been played for over 200 years and is similar to Jass and Belote.

The project is built with **Next.js 16**, **React 19**, **Prisma 7**, **PostgreSQL**, **Better Auth** (Google OAuth), **Socket.io** for real-time multiplayer, and **Redis** for game state management.

## Game Rules

- 4 players, 2 teams of 2 partners
- 32-card French deck (7 through Ace, 4 suits)
- Trick-taking with trump determined by last dealt card
- Signature mechanic: **Marriages** (King+Queen = 20/40pts, King+Queen+Jack = 30/60pts)
- Win condition: first team to 30+ on the scoreboard (300+ real points)
- Match format: first team to lose 5 "coches" loses

Full rules: [`public/doc/rules.md`](./public/doc/rules.md) | [brouc.ch](https://brouc.ch/)

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, RSC, Server Actions) |
| UI | React 19, TailwindCSS v4, Radix UI |
| Language | TypeScript (strict) |
| Database | PostgreSQL |
| ORM | Prisma 7 with PrismaPg adapter |
| Auth | Better Auth with Google OAuth |
| Real-time | Socket.io (custom server) |
| Game State | Redis (ioredis) |
| Validation | Zod v4 + react-hook-form |
| Quality | Biome, Vitest, knip |
| Deployment | Docker (VPS) |

## Project Structure

```bash
.
├── app/                  # Next.js routes, layouts, error pages, API routes
├── components/           # UI split by domain (game, lobby, ui, public)
├── lib/
│   ├── game/             # Pure game engine (rules, scoring, deck, state machine)
│   ├── socket/           # Socket.io server, room management, game handlers
│   ├── actions/          # Server mutations
│   ├── services/         # Cached read-side access
│   ├── core/             # Auth, env, logger, Prisma, Redis
│   ├── config/           # Routes and constants
│   ├── validations/      # Zod schemas
│   ├── utils/            # Formatting, auth helpers
│   └── types/            # Shared TypeScript types
├── prisma/               # Schema, migrations, seed, generated client
├── public/               # Static assets and game rules
├── tests/                # Top-level Vitest suites
├── server.ts             # Custom server (Next.js + Socket.io)
├── proxy.ts              # Edge protection for /admin/*
└── docker-compose.yml    # PostgreSQL + Redis
```

## Quick Start

### Prerequisites

- Node.js 22+
- pnpm 11+
- Docker

### Installation

```bash
pnpm install
cp .env.example .env.local
# Fill in BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
pnpm docker:up
pnpm generate
pnpm migrate
pnpm dev
```

The app runs on `http://localhost:3000`.

## Environment

See `.env.example` for the full template.

Key variables:

- `DATABASE_URL` and `DIRECT_URL` for PostgreSQL
- `REDIS_URL` for game state storage
- `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` for auth
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for Google OAuth
- `ADMIN_EMAILS` for seeding admin accounts
- `NEXT_PUBLIC_APP_URL` for the public app URL

## Development Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server (Next.js + Socket.io) |
| `pnpm build` | Generate Prisma client, deploy migrations, seed, then build |
| `pnpm exec tsc --noEmit` | TypeScript type-checking |
| `pnpm exec biome check .` | Lint/format check |
| `pnpm check` | Biome check with auto-fix |
| `pnpm test` | Run Vitest |
| `pnpm generate` | Generate Prisma client |
| `pnpm migrate` | Create a local Prisma migration |
| `pnpm docker:up` | Start PostgreSQL + Redis |
| `pnpm docker:down` | Stop containers |

## License

This project is licensed under the MIT License.
