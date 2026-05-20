/**
 * File: lib/services/auth.ts
 * Description: Services for handling authentication logic.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import 'server-only'
import { cookies, headers } from 'next/headers'
import auth from '@/lib/core/auth'
import prisma from '@/lib/core/prisma'
import type { AuthSession } from '@/lib/types/auth'

const DEV_PLAYERS = [
  { email: 'player1@dev.local', name: 'Alice', displayName: 'Alice' },
  { email: 'player2@dev.local', name: 'Bob', displayName: 'Bob' },
  { email: 'player3@dev.local', name: 'Charlie', displayName: 'Charlie' },
  { email: 'player4@dev.local', name: 'Diana', displayName: 'Diana' },
] as const

async function getDevSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies()
  const devPlayer = cookieStore.get('dev-player')?.value
  if (!devPlayer) return null

  const playerIdx = Number(devPlayer) - 1
  if (playerIdx < 0 || playerIdx > 3) return null

  const def = DEV_PLAYERS[playerIdx]
  const user = await prisma.user.upsert({
    where: { email: def.email },
    update: {},
    create: {
      email: def.email,
      name: def.name,
      displayName: def.displayName,
      emailVerified: true,
    },
  })

  return {
    session: {
      id: `dev-session-${user.id}`,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      token: `dev-token-${user.id}`,
    },
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      displayName: user.displayName,
      role: user.role,
      image: user.image,
    },
  }
}

/** Retrieves the typed session for the current request, or null. */
export const getSession = async (): Promise<AuthSession | null> => {
  if (process.env.NODE_ENV === 'development') {
    const devSession = await getDevSession()
    if (devSession) return devSession
  }

  const session = await auth.api.getSession({ headers: await headers() })
  return (session as AuthSession | null) ?? null
}
