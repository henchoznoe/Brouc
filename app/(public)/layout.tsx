/**
 * File: app/(public)/layout.tsx
 * Description: Layout for public pages — header, footer, and main content area.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import type { ReactNode } from 'react'
import { Footer } from '@/components/public/layout/footer'
import { Header } from '@/components/public/layout/header'
import { getSession } from '@/lib/services/auth'

const PublicLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getSession()

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <Header session={session} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default PublicLayout
