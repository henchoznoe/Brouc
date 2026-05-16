/**
 * File: lib/services/match-history.ts
 * Description: Match history service — past matches for a user.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import 'server-only'
import prisma from '@/lib/core/prisma'

export type MatchHistoryEntry = {
  id: string
  roomCode: string
  startedAt: Date
  finishedAt: Date | null
  cochesTeamA: number
  cochesTeamB: number
  winnerTeam: string | null
  playerTeam: string
  isWinner: boolean
  players: { displayName: string; seat: number; team: string }[]
  gamesCount: number
}

/** Get match history for a user. */
export const getMatchHistory = async (
  userId: string,
  limit = 20,
  offset = 0,
): Promise<MatchHistoryEntry[]> => {
  const matchPlayers = await prisma.matchPlayer.findMany({
    where: { userId },
    orderBy: { match: { startedAt: 'desc' } },
    take: limit,
    skip: offset,
    include: {
      match: {
        include: {
          players: {
            include: {
              user: { select: { displayName: true } },
            },
          },
          _count: { select: { games: true } },
        },
      },
    },
  })

  return matchPlayers.map(mp => ({
    id: mp.match.id,
    roomCode: mp.match.roomCode,
    startedAt: mp.match.startedAt,
    finishedAt: mp.match.finishedAt,
    cochesTeamA: mp.match.cochesTeamA,
    cochesTeamB: mp.match.cochesTeamB,
    winnerTeam: mp.match.winnerTeam,
    playerTeam: mp.team,
    isWinner: mp.match.winnerTeam === mp.team,
    players: mp.match.players.map(p => ({
      displayName: p.user.displayName,
      seat: p.seat,
      team: p.team,
    })),
    gamesCount: mp.match._count.games,
  }))
}

/** Get total match count for a user. */
export const getMatchCount = async (userId: string): Promise<number> => {
  return prisma.matchPlayer.count({ where: { userId } })
}
