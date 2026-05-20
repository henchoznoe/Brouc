/**
 * File: app/admin/page.tsx
 * Description: Admin dashboard — overview stats.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import type { Metadata } from 'next'
import { StatCard } from '@/components/admin/stat-card'
import prisma from '@/lib/core/prisma'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin',
}

const AdminDashboard = async () => {
  const [userCount, matchCount, activeMatches] = await Promise.all([
    prisma.user.count(),
    prisma.match.count({ where: { status: 'COMPLETED' } }),
    prisma.match.count({ where: { status: 'IN_PROGRESS' } }),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-6 grid grid-cols-3 gap-4">
        <StatCard label="Utilisateurs" value={userCount} />
        <StatCard label="Matchs terminés" value={matchCount} />
        <StatCard label="Matchs en cours" value={activeMatches} />
      </div>
    </div>
  )
}

export default AdminDashboard
