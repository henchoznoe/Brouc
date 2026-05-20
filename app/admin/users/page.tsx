/**
 * File: app/admin/users/page.tsx
 * Description: Admin user management page.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import type { Metadata } from 'next'
import prisma from '@/lib/core/prisma'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Utilisateurs — Admin',
}

const AdminUsersPage = async () => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
      rating: true,
      matchesPlayed: true,
      lastLoginAt: true,
      bannedAt: true,
      createdAt: true,
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold">Utilisateurs</h1>
      <p className="mt-1 text-sm text-zinc-400">{users.length} utilisateurs</p>

      <div className="mt-6 overflow-hidden rounded-lg border border-zinc-700">
        <table className="w-full text-sm">
          <thead className="bg-zinc-800 text-zinc-400">
            <tr>
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Rôle</th>
              <th className="px-4 py-3 text-right">ELO</th>
              <th className="px-4 py-3 text-right">Matchs</th>
              <th className="px-4 py-3 text-left">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-zinc-800/50">
                <td className="px-4 py-3 font-medium">
                  {user.displayName || '—'}
                </td>
                <td className="px-4 py-3 text-zinc-400">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {user.rating}
                </td>
                <td className="px-4 py-3 text-right text-zinc-400">
                  {user.matchesPlayed}
                </td>
                <td className="px-4 py-3">
                  {user.bannedAt ? (
                    <span className="text-red-400">Banni</span>
                  ) : (
                    <span className="text-green-400">Actif</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminUsersPage
