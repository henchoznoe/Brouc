/**
 * File: lib/socket/auth-middleware.ts
 * Description: Socket.io middleware to authenticate connections via session cookie.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import type { Socket } from 'socket.io'
import prisma from '@/lib/core/prisma'
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from './types'

type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>

const DEV_PLAYERS = [
  'player1@dev.local',
  'player2@dev.local',
  'player3@dev.local',
  'player4@dev.local',
] as const

function parseCookieValue(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

async function authenticateDevSocket(
  socket: AppSocket,
  cookie: string,
): Promise<boolean> {
  if (process.env.NODE_ENV !== 'development') return false

  const devPlayer = parseCookieValue(cookie, 'dev-player')
  if (!devPlayer) return false

  const playerIdx = Number(devPlayer) - 1
  if (playerIdx < 0 || playerIdx > 3) return false

  const user = await prisma.user.findUnique({
    where: { email: DEV_PLAYERS[playerIdx] },
  })
  if (!user) return false

  socket.data.userId = user.id
  socket.data.displayName = user.displayName || user.name
  socket.data.roomCode = null
  return true
}

/**
 * Authenticates a socket connection by validating the session cookie
 * against the Better Auth session endpoint.
 */
export const authMiddleware = async (
  socket: AppSocket,
  next: (err?: Error) => void,
): Promise<void> => {
  try {
    const cookie = socket.handshake.headers.cookie
    if (!cookie) {
      return next(new Error('No session cookie'))
    }

    if (await authenticateDevSocket(socket, cookie)) {
      return next()
    }

    const baseUrl =
      process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL
    if (!baseUrl) {
      return next(new Error('Server misconfigured'))
    }

    const response = await fetch(new URL('/api/auth/get-session', baseUrl), {
      headers: { cookie },
    })

    if (!response.ok) {
      return next(new Error('Invalid session'))
    }

    const session = await response.json()
    if (!session?.user?.id) {
      return next(new Error('Invalid session'))
    }

    socket.data.userId = session.user.id
    socket.data.displayName = session.user.displayName || session.user.name
    socket.data.roomCode = null

    next()
  } catch {
    next(new Error('Authentication failed'))
  }
}
