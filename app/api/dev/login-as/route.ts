/**
 * File: app/api/dev/login-as/route.ts
 * Description: Dev-only endpoint to create a session for a test user.
 *   Usage: GET /api/dev/login-as?player=1 (1-4)
 *   Creates user if needed, creates session, sets cookie, redirects to /play.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import prisma from '@/lib/core/prisma'

const DEV_PLAYERS = [
  { email: 'player1@dev.local', name: 'Alice', displayName: 'Alice' },
  { email: 'player2@dev.local', name: 'Bob', displayName: 'Bob' },
  { email: 'player3@dev.local', name: 'Charlie', displayName: 'Charlie' },
  { email: 'player4@dev.local', name: 'Diana', displayName: 'Diana' },
] as const

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 })
  }

  const url = new URL(request.url)
  const playerNum = Number(url.searchParams.get('player'))

  if (!playerNum || playerNum < 1 || playerNum > 4) {
    return NextResponse.json(
      { error: 'Use ?player=1 through ?player=4' },
      { status: 400 },
    )
  }

  const playerDef = DEV_PLAYERS[playerNum - 1]

  const user = await prisma.user.upsert({
    where: { email: playerDef.email },
    update: { lastLoginAt: new Date() },
    create: {
      email: playerDef.email,
      name: playerDef.name,
      displayName: playerDef.displayName,
      emailVerified: true,
    },
  })

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
      ipAddress: '127.0.0.1',
      userAgent: 'dev-login',
    },
  })

  const cookieStore = await cookies()
  cookieStore.set('brouc.session_token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  })

  redirect('/play')
}
