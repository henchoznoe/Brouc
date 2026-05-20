/**
 * File: prisma.config.ts
 * Description: Prisma configuration options.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import { existsSync } from 'node:fs'
import { config } from 'dotenv'
import { defineConfig, env } from 'prisma/config'

if (existsSync('.env.local')) {
  config({ path: '.env.local' })
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DIRECT_URL'),
  },
})
