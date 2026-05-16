/**
 * File: app/(public)/leaderboard/page.tsx
 * Description: Leaderboard page — player rankings.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Classement',
}

const LeaderboardPage = () => {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-zinc-50">
      <h1 className="text-2xl font-bold">Classement</h1>
      <p className="mt-4 text-zinc-400">
        Le classement sera disponible après les premières parties.
      </p>
    </div>
  )
}

export default LeaderboardPage
