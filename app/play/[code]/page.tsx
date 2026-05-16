/**
 * File: app/play/[code]/page.tsx
 * Description: Game room page — waiting room and active game.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { ROUTES } from '@/lib/config/routes'
import { getSession } from '@/lib/services/auth'
import { RoomClient } from './room-client'

export const metadata: Metadata = {
  title: 'Partie en cours',
}

const RoomContent = async ({ code }: { code: string }) => {
  const session = await getSession()
  if (!session?.user) {
    redirect(ROUTES.LOGIN)
  }
  return <RoomClient code={code} user={session.user} />
}

const RoomPage = async ({ params }: { params: Promise<{ code: string }> }) => {
  const { code } = await params
  return (
    <Suspense>
      <RoomContent code={code} />
    </Suspense>
  )
}

export default RoomPage
