/**
 * File: app/(public)/profile/page.tsx
 * Description: User profile page with stats and match history.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { DisplayNameForm } from '@/components/public/profile/display-name-form'
import { ROUTES } from '@/lib/config/routes'
import { getSession } from '@/lib/services/auth'
import { getPlayerStats } from '@/lib/services/leaderboard'
import { getMatchHistory } from '@/lib/services/match-history'

export const metadata: Metadata = {
  title: 'Profil',
}

const ProfileContent = async () => {
  const session = await getSession()
  if (!session?.user) redirect(ROUTES.LOGIN)

  const [stats, history] = await Promise.all([
    getPlayerStats(session.user.id),
    getMatchHistory(session.user.id, 10),
  ])

  const winRate =
    stats && stats.matchesPlayed > 0
      ? Math.round((stats.matchesWon / stats.matchesPlayed) * 100)
      : 0

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-zinc-50">
      <DisplayNameForm
        currentName={session.user.displayName || session.user.name}
      />

      {/* Stats grid */}
      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="ELO" value={stats.rating} />
          <StatCard label="Matchs" value={stats.matchesPlayed} />
          <StatCard label="Victoires" value={`${winRate}%`} />
          <StatCard label="Parties" value={stats.gamesPlayed} />
          <StatCard label="Capes" value={stats.capesScored} />
          <StatCard label="Mariages" value={stats.marriagesScored} />
        </div>
      )}

      {/* Match history */}
      <h2 className="mt-10 text-lg font-semibold">Historique</h2>
      {history.length === 0 ? (
        <p className="mt-2 text-zinc-400">Aucune partie jouée.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {history.map(match => (
            <div
              key={match.id}
              className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {match.isWinner ? '✓ Victoire' : '✗ Défaite'}
                </p>
                <p className="text-xs text-zinc-500">
                  {match.cochesTeamA} - {match.cochesTeamB} coches •{' '}
                  {match.gamesCount} parties
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs text-zinc-500">
                  {match.roomCode}
                </p>
                <p className="text-xs text-zinc-600">
                  {match.startedAt.toLocaleDateString('fr-CH')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const StatCard = ({
  label,
  value,
}: {
  label: string
  value: string | number
}) => (
  <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-center">
    <p className="text-xs text-zinc-500">{label}</p>
    <p className="mt-1 text-xl font-bold">{value}</p>
  </div>
)

const ProfilePage = () => (
  <Suspense>
    <ProfileContent />
  </Suspense>
)

export default ProfilePage
