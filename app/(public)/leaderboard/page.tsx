/**
 * File: app/(public)/leaderboard/page.tsx
 * Description: Leaderboard page — player rankings by ELO rating.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import type { Metadata } from 'next'
import { getLeaderboard } from '@/lib/services/leaderboard'

export const metadata: Metadata = {
  title: 'Classement',
}

const LeaderboardPage = async () => {
  const entries = await getLeaderboard(50)

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-zinc-50">
      <h1 className="text-2xl font-bold">Classement</h1>

      {entries.length === 0 ? (
        <p className="mt-4 text-zinc-400">
          Le classement sera disponible après les premières parties.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-zinc-700">
          <table className="w-full text-sm">
            <thead className="bg-zinc-800 text-zinc-400">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Joueur</th>
                <th className="px-4 py-3 text-right">ELO</th>
                <th className="px-4 py-3 text-right">Matchs</th>
                <th className="px-4 py-3 text-right">Victoires</th>
                <th className="px-4 py-3 text-right">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {entries.map((entry, i) => (
                <tr key={entry.id} className="hover:bg-zinc-800/50">
                  <td className="px-4 py-3 font-mono text-zinc-500">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{entry.displayName}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {entry.rating}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-400">
                    {entry.matchesPlayed}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-400">
                    {entry.matchesWon}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-400">
                    {entry.winRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default LeaderboardPage
