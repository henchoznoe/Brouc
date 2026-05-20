/**
 * File: app/api/dev/login-as/route.ts
 * Description: Dev-only endpoint to log in as a test player.
 *   Usage: GET /api/dev/login-as?player=1 (1-4)
 *   Sets a simple dev cookie and redirects to /play.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'

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

  const cookieStore = await cookies()
  cookieStore.set('dev-player', String(playerNum), {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  })

  redirect('/play')
}
