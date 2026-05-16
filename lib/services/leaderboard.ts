/**
 * File: lib/services/leaderboard.ts
 * Description: Leaderboard service — ranked player queries.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import 'server-only'
import prisma from '@/lib/core/prisma'

export type LeaderboardEntry = {
  id: string
  displayName: string
  image: string | null
  rating: number
  matchesPlayed: number
  matchesWon: number
  gamesPlayed: number
  gamesWon: number
  winRate: number
}

/** Get top players by rating. */
export const getLeaderboard = async (
  limit = 50,
): Promise<LeaderboardEntry[]> => {
  const users = await prisma.user.findMany({
    where: { matchesPlayed: { gt: 0 } },
    orderBy: { rating: 'desc' },
    take: limit,
    select: {
      id: true,
      displayName: true,
      image: true,
      rating: true,
      matchesPlayed: true,
      matchesWon: true,
      gamesPlayed: true,
      gamesWon: true,
    },
  })

  return users.map(u => ({
    ...u,
    winRate:
      u.matchesPlayed > 0
        ? Math.round((u.matchesWon / u.matchesPlayed) * 100)
        : 0,
  }))
}

/** Get a single player's stats. */
export const getPlayerStats = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      displayName: true,
      image: true,
      rating: true,
      matchesPlayed: true,
      matchesWon: true,
      gamesPlayed: true,
      gamesWon: true,
      totalPoints: true,
      capesScored: true,
      marriagesScored: true,
    },
  })
}
