/**
 * File: app/play/page.tsx
 * Description: Lobby page — create or join a game room.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { ROUTES } from '@/lib/config/routes'
import { getSession } from '@/lib/services/auth'
import { LobbyClient } from './lobby-client'

export const metadata: Metadata = {
  title: 'Jouer',
}

const LobbyContent = async () => {
  const session = await getSession()
  if (!session?.user) {
    redirect(ROUTES.LOGIN)
  }
  return <LobbyClient user={session.user} />
}

const PlayPage = () => {
  return (
    <Suspense>
      <LobbyContent />
    </Suspense>
  )
}

export default PlayPage
