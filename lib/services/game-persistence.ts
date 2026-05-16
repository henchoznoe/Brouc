/**
 * File: lib/services/game-persistence.ts
 * Description: Persists completed matches, games, and deals to PostgreSQL.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import { logger } from '@/lib/core/logger'
import prisma from '@/lib/core/prisma'
import type { MatchState } from '@/lib/game/types'

type CompletedDeal = {
  dealNumber: number
  dealerSeat: number
  trumpSuit: 'SPADES' | 'HEARTS' | 'DIAMONDS' | 'CLUBS'
  rawPointsTeamA: number
  rawPointsTeamB: number
  ardoiseTeamA: number
  ardoiseTeamB: number
  isCape: boolean
  capeTeam: 'NORTH_SOUTH' | 'EAST_WEST' | null
  marriages: {
    seat: number
    team: 'NORTH_SOUTH' | 'EAST_WEST'
    suit: 'SPADES' | 'HEARTS' | 'DIAMONDS' | 'CLUBS'
    type: 'SIMPLE' | 'EXTENDED'
    points: number
  }[]
}

type CompletedGame = {
  gameNumber: number
  scoreTeamA: number
  scoreTeamB: number
  winnerTeam: 'NORTH_SOUTH' | 'EAST_WEST'
  cochesAwarded: number
  deals: CompletedDeal[]
}

export type MatchPersistData = {
  roomCode: string
  players: { userId: string; seat: number; team: 'NORTH_SOUTH' | 'EAST_WEST' }[]
  cochesTeamA: number
  cochesTeamB: number
  winnerTeam: 'NORTH_SOUTH' | 'EAST_WEST'
  games: CompletedGame[]
}

/** Persist a completed match to the database. */
export const persistMatch = async (data: MatchPersistData): Promise<string> => {
  try {
    const match = await prisma.match.create({
      data: {
        roomCode: data.roomCode,
        status: 'COMPLETED',
        finishedAt: new Date(),
        cochesTeamA: data.cochesTeamA,
        cochesTeamB: data.cochesTeamB,
        winnerTeam: data.winnerTeam,
        players: {
          create: data.players.map(p => ({
            userId: p.userId,
            seat: p.seat,
            team: p.team,
          })),
        },
        games: {
          create: data.games.map(g => ({
            gameNumber: g.gameNumber,
            scoreTeamA: g.scoreTeamA,
            scoreTeamB: g.scoreTeamB,
            winnerTeam: g.winnerTeam,
            cochesAwarded: g.cochesAwarded,
            finishedAt: new Date(),
            deals: {
              create: g.deals.map(d => ({
                dealNumber: d.dealNumber,
                dealerSeat: d.dealerSeat,
                trumpSuit: d.trumpSuit,
                rawPointsTeamA: d.rawPointsTeamA,
                rawPointsTeamB: d.rawPointsTeamB,
                ardoiseTeamA: d.ardoiseTeamA,
                ardoiseTeamB: d.ardoiseTeamB,
                isCape: d.isCape,
                capeTeam: d.capeTeam,
                finishedAt: new Date(),
                marriages: {
                  create: d.marriages.map(m => ({
                    seat: m.seat,
                    team: m.team,
                    suit: m.suit,
                    type: m.type,
                    points: m.points,
                  })),
                },
              })),
            },
          })),
        },
      },
    })

    // Update player stats
    await updatePlayerStats(data)

    return match.id
  } catch (error) {
    logger.error(
      { errorMessage: error instanceof Error ? error.message : 'unknown' },
      'Failed to persist match',
    )
    throw error
  }
}

/** Update denormalized player stats after a match. */
const updatePlayerStats = async (data: MatchPersistData): Promise<void> => {
  const winningPlayerIds = data.players
    .filter(p => p.team === data.winnerTeam)
    .map(p => p.userId)

  const totalGames = data.games.length
  let totalMarriages = 0
  let totalCapes = 0

  for (const game of data.games) {
    for (const deal of game.deals) {
      totalMarriages += deal.marriages.length
      if (deal.isCape) totalCapes++
    }
  }

  for (const player of data.players) {
    const isWinner = winningPlayerIds.includes(player.userId)
    const playerGamesWon = data.games.filter(
      g => g.winnerTeam === player.team,
    ).length
    const playerMarriages = data.games.reduce(
      (sum, g) =>
        sum +
        g.deals.reduce(
          (dSum, d) =>
            dSum + d.marriages.filter(m => m.team === player.team).length,
          0,
        ),
      0,
    )

    await prisma.user.update({
      where: { id: player.userId },
      data: {
        matchesPlayed: { increment: 1 },
        matchesWon: { increment: isWinner ? 1 : 0 },
        gamesPlayed: { increment: totalGames },
        gamesWon: { increment: playerGamesWon },
        marriagesScored: { increment: playerMarriages },
        capesScored: { increment: totalCapes },
        rating: { increment: isWinner ? 25 : -25 },
      },
    })
  }
}
