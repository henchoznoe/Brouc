/**
 * File: lib/core/auth.ts
 * Description: Authentication configuration using Better Auth with Google OAuth.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import 'server-only'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { AUTH_CONFIG } from '@/lib/config/constants'
import { env } from '@/lib/core/env'
import { logger } from '@/lib/core/logger'
import prisma from '@/lib/core/prisma'
import { Role } from '@/prisma/generated/prisma'

/**
 * CSRF assumption: mutating endpoints are Server Actions (Next.js enforces
 * an Origin check). Session cookies are `SameSite=Lax` + `httpOnly` + `secure`,
 * which blocks cross-site POST with credentials.
 */

const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  advanced: {
    database: { generateId: 'uuid' },
    cookiePrefix: 'brouc',
    defaultCookieAttributes: {
      secure: true,
      httpOnly: true,
      sameSite: 'lax' as const,
    },
  },
  session: {
    expiresIn: AUTH_CONFIG.SESSION_EXPIRES_IN,
    updateAge: AUTH_CONFIG.SESSION_UPDATE_AGE,
    cookieCache: { enabled: true, maxAge: AUTH_CONFIG.COOKIE_CACHE_MAX_AGE },
  },
  rateLimit: {
    enabled: env.VERCEL_ENV === 'production',
    window: AUTH_CONFIG.RATE_LIMIT_WINDOW,
    max: AUTH_CONFIG.RATE_LIMIT_MAX,
  },
  trustedOrigins: [env.BETTER_AUTH_URL, env.NEXT_PUBLIC_APP_URL],
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: Role.USER,
        input: false,
      },
      displayName: {
        type: 'string',
        required: false,
        defaultValue: '',
        input: false,
      },
    },
  },
  databaseHooks: {
    session: {
      create: {
        after: async session => {
          try {
            const user = await prisma.user.findUnique({
              where: { id: session.userId },
            })

            if (!user) return

            const updateData: Record<string, unknown> = {
              lastLoginAt: session.createdAt
                ? new Date(session.createdAt)
                : new Date(),
            }

            if (!user.displayName) {
              updateData.displayName = user.name
            }

            await prisma.user.update({
              where: { id: user.id },
              data: updateData,
            })
          } catch (error) {
            logger.error(
              {
                errorMessage:
                  error instanceof Error ? error.message : 'unknown',
                userId: session.userId,
              },
              'Failed to update user on session create',
            )
          }
        },
      },
    },
  },
})

export default auth
