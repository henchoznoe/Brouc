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
| Database | PostgreSQL 18 |
| ORM | Prisma 7 with PrismaPg adapter |
| Auth | Better Auth with Google OAuth |
| Real-time | Socket.io (custom server) |
| Game State | Redis 7 (ioredis) |
| Validation | Zod v4 + react-hook-form |
| Quality | Biome, Vitest, knip |
| Reverse Proxy | Caddy (auto-HTTPS) |
| Deployment | Docker on VPS |

## Project Structure

```bash
.
├── app/                  # Next.js routes (public, admin, play, api)
├── components/           # UI split by domain (game, lobby, ui, providers)
├── lib/
│   ├── game/             # Pure game engine (rules, scoring, deck, state machine)
│   ├── socket/           # Socket.io server, room management, game handlers
│   ├── services/         # Data access (leaderboard, match-history, persistence)
│   ├── core/             # Auth, env, logger, Prisma, Redis
│   ├── config/           # Routes and constants
│   ├── utils/            # Formatting, role helpers
│   └── types/            # Shared TypeScript types
├── prisma/               # Schema, migrations, seed, generated client
├── public/               # Static assets and game rules
├── tests/                # Vitest test suites
├── server.ts             # Custom server (Next.js + Socket.io)
├── proxy.ts              # Edge middleware for /admin/*
├── Dockerfile            # Multi-stage production build
├── docker-compose.yml    # Local dev (PostgreSQL + Redis)
├── docker-compose.prod.yml  # Production (app + db + redis + caddy)
└── Caddyfile             # Reverse proxy config
```

## Local Development

### Prerequisites

- Node.js 22+
- pnpm 11+
- Docker

### Setup

```bash
pnpm install
cp .env.example .env.local
# Fill in BETTER_AUTH_SECRET (openssl rand -base64 32)
# Fill in GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
pnpm docker:up       # Start PostgreSQL + Redis
pnpm generate        # Generate Prisma client
pnpm migrate         # Create initial migration
pnpm dev             # Start dev server (Next.js + Socket.io)
```

The app runs on `http://localhost:3000`.

### Google OAuth Setup (dev)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select existing
3. Go to APIs & Services → Credentials → Create OAuth 2.0 Client
4. Set Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Secret to `.env.local`

### Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Custom server (Next.js + Socket.io) with hot reload |
| `pnpm dev:next` | Next.js only (no WebSocket) |
| `pnpm build` | Prisma generate + migrate + seed + Next.js build |
| `pnpm start` | Production server |
| `pnpm test` | Run Vitest |
| `pnpm exec tsc --noEmit` | TypeScript check |
| `pnpm exec biome check .` | Lint/format check |
| `pnpm check` | Biome with auto-fix |
| `pnpm generate` | Generate Prisma client |
| `pnpm migrate` | Create local migration |
| `pnpm docker:up` | Start PostgreSQL + Redis |
| `pnpm docker:down` | Stop containers |

## Deployment (VPS Docker)

### VPS Prerequisites

- Ubuntu 22.04+ (or Debian 12+)
- Docker Engine 24+ and Docker Compose v2
- A domain name pointing to the VPS IP (A record)
- Port 80 and 443 open in firewall

### Step-by-step

**1. Install Docker on VPS**

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in
```

**2. Clone the repository**

```bash
git clone https://github.com/henchoznoe/Brouc.git
cd Brouc
```

**3. Configure environment**

```bash
cp .env.production.example .env

# Edit .env with your values:
# - BETTER_AUTH_SECRET: openssl rand -base64 32
# - POSTGRES_PASSWORD: strong random password
# - DATABASE_URL: postgresql://brouc:YOUR_PASSWORD@db:5432/brouc
# - DIRECT_URL: same as DATABASE_URL
# - GOOGLE_CLIENT_ID/SECRET: from Google Cloud Console
# - BETTER_AUTH_URL: https://your-domain.com
# - NEXT_PUBLIC_APP_URL: https://your-domain.com
# - ADMIN_EMAILS: your email (comma-separated)
nano .env
```

**4. Configure domain in Caddyfile**

```bash
# Replace brouc.example.com with your domain
nano Caddyfile
```

**5. Google OAuth — production redirect**

In Google Cloud Console, add authorized redirect URI:
```
https://your-domain.com/api/auth/callback/google
```

**6. Build and start**

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

**7. Run migrations and seed**

```bash
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
docker compose -f docker-compose.prod.yml exec app npx tsx prisma/seed.ts
```

**8. Verify**

- Visit `https://your-domain.com` — should show the landing page
- Caddy automatically provisions HTTPS via Let's Encrypt
- Check logs: `docker compose -f docker-compose.prod.yml logs -f app`

### Updating

```bash
cd Brouc
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

### Useful commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f app

# Restart app only
docker compose -f docker-compose.prod.yml restart app

# Access database
docker compose -f docker-compose.prod.yml exec db psql -U brouc

# Redis CLI
docker compose -f docker-compose.prod.yml exec redis redis-cli

# Stop everything
docker compose -f docker-compose.prod.yml down

# Nuclear reset (destroys data!)
docker compose -f docker-compose.prod.yml down -v
```

### Security notes

- Caddy handles HTTPS automatically (Let's Encrypt)
- PostgreSQL and Redis are not exposed externally (internal Docker network)
- Game state is server-authoritative — clients cannot cheat
- Session cookies are `httpOnly`, `secure`, `SameSite=Lax`
- Rate limiting enabled in production on auth endpoints

## Environment Variables

See `.env.example` (dev) and `.env.production.example` (prod) for full templates.

| Variable | Required | Description |
| --- | --- | --- |
| `BETTER_AUTH_SECRET` | Yes | 32+ char secret for session encryption |
| `BETTER_AUTH_URL` | Yes | Base URL of the app |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `DIRECT_URL` | Yes | Direct PostgreSQL URL (for Prisma CLI) |
| `REDIS_URL` | Yes | Redis connection string |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL |
| `ADMIN_EMAILS` | No | Comma-separated admin emails (seed) |
| `SUPER_ADMIN_EMAILS` | No | Comma-separated super admin emails (seed) |

## License

This project is licensed under the MIT License.
