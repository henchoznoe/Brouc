/**
 * File: lib/socket/game-handler.ts
 * Description: Socket.io game event handlers — play card, announce marriage/dehors.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import type { Server, Socket } from 'socket.io'
import { TEAM_FOR_SEAT } from '@/lib/game/constants'
import {
  canAnnounceDehors,
  completeGame,
  createMatchState,
  getGameWinner,
  playCard,
  startDeal,
  startNewGame,
} from '@/lib/game/engine'
import { canDeclareMarriage, createMarriage } from '@/lib/game/marriages'
import { getValidCards } from '@/lib/game/rules'
import type {
  Card,
  MarriageType,
  PlayerInfo,
  Seat,
  Suit,
} from '@/lib/game/types'
import {
  type MatchPersistData,
  persistMatch,
} from '@/lib/services/game-persistence'
import { stateStore } from './state-store'
import type {
  ClientToServerEvents,
  InterServerEvents,
  RoomState,
  ServerToClientEvents,
  SocketData,
} from './types'

type AppServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>

type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>

/** Start a game when all 4 players are ready. */
export const startGame = async (
  io: AppServer,
  room: RoomState,
): Promise<void> => {
  const players: PlayerInfo[] = room.players.map(p => ({
    userId: p.userId,
    displayName: p.displayName,
    seat: p.seat,
    team: p.team,
  }))

  let match = createMatchState(room.code, players)
  match = startNewGame(match, 0 as Seat)
  match = {
    ...match,
    currentGame: startDeal(match.currentGame!),
  }

  await stateStore.setGame(room.code, match)

  // Update room status
  room.status = 'PLAYING'
  await stateStore.setRoom(room.code, room)

  // Notify all players
  io.to(room.code).emit('game:started', { match })

  // Send each player their hand
  const game = match.currentGame!
  const deal = game.currentDeal!

  for (const player of players) {
    const socketId = await stateStore.getUserSocket(player.userId)
    if (socketId) {
      io.to(socketId).emit('game:deal', {
        hand: deal.hands[player.seat],
        trump: deal.trump,
        dealer: deal.dealer,
        dealNumber: game.dealNumber,
      })
    }
  }

  // Notify current player it's their turn
  await notifyCurrentPlayer(io, room.code, match)
}

/** Notify the current player it's their turn with valid cards. */
const notifyCurrentPlayer = async (
  io: AppServer,
  _roomCode: string,
  match: ReturnType<typeof createMatchState>,
): Promise<void> => {
  const game = match.currentGame
  if (!game?.currentDeal) return

  const deal = game.currentDeal
  const currentSeat = deal.currentPlayer
  const currentPlayer = match.players.find(p => p.seat === currentSeat)
  if (!currentPlayer) return

  const hand = deal.hands[currentSeat]
  const validCards = getValidCards(hand, deal)

  const socketId = await stateStore.getUserSocket(currentPlayer.userId)
  if (socketId) {
    io.to(socketId).emit('game:your-turn', { validCards })
  }
}

/** Handle a card play from a player. */
export const handlePlayCard = async (
  io: AppServer,
  socket: AppSocket,
  card: Card,
): Promise<{ success: boolean; error?: string }> => {
  const roomCode = socket.data.roomCode
  if (!roomCode) return { success: false, error: 'Not in a room' }

  const match = await stateStore.getGame(roomCode)
  if (!match) return { success: false, error: 'No active game' }

  const game = match.currentGame
  if (!game?.currentDeal) return { success: false, error: 'No active deal' }

  const player = match.players.find(p => p.userId === socket.data.userId)
  if (!player) return { success: false, error: 'Player not found' }

  const deal = game.currentDeal
  if (deal.currentPlayer !== player.seat) {
    return { success: false, error: 'Not your turn' }
  }

  try {
    const previousTrickCount = deal.tricks.length
    const updatedGame = playCard(game, player.seat, card)
    match.currentGame = updatedGame

    await stateStore.setGame(roomCode, match)

    // Broadcast card played to all
    io.to(roomCode).emit('game:card-played', { seat: player.seat, card })

    // Check if trick completed
    const newDeal = updatedGame.currentDeal!
    if (newDeal.tricks.length > previousTrickCount) {
      const lastTrick = newDeal.tricks[newDeal.tricks.length - 1]
      io.to(roomCode).emit('game:trick-won', {
        winnerSeat: lastTrick.winnerSeat,
        points: lastTrick.points,
        trickNumber: lastTrick.trickNumber,
      })
    }

    // Check if deal/game is over
    if (
      updatedGame.phase === 'DEAL_COMPLETE' ||
      updatedGame.phase === 'GAME_OVER'
    ) {
      await handleDealComplete(io, roomCode, match)
      return { success: true }
    }

    // Notify next player
    await notifyCurrentPlayer(io, roomCode, match)
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid play'
    return { success: false, error: message }
  }
}

/** Handle deal completion — broadcast results, start next deal or end game. */
const handleDealComplete = async (
  io: AppServer,
  roomCode: string,
  match: ReturnType<typeof createMatchState>,
): Promise<void> => {
  const game = match.currentGame!
  const deal = game.currentDeal!

  // Broadcast deal result
  const lastDealMarriages = deal.marriages
  const isCape =
    deal.tricks.length === 8 &&
    deal.tricks.every(
      t =>
        TEAM_FOR_SEAT[t.winnerSeat] ===
        TEAM_FOR_SEAT[deal.tricks[0].winnerSeat],
    )
  const capeTeam = isCape ? TEAM_FOR_SEAT[deal.tricks[0].winnerSeat] : null

  io.to(roomCode).emit('game:deal-result', {
    ardoiseTeamA: game.scoreTeamA,
    ardoiseTeamB: game.scoreTeamB,
    marriages: lastDealMarriages,
    isCape,
    capeTeam,
  })

  if (game.phase === 'GAME_OVER') {
    const winnerTeam = getGameWinner(game)!
    const isDehors = game.dehorsAnnounced !== null

    const updatedMatch = completeGame(match, isCape, isDehors)
    const cochesAwarded =
      updatedMatch.cochesTeamA -
      match.cochesTeamA +
      (updatedMatch.cochesTeamB - match.cochesTeamB)

    io.to(roomCode).emit('game:over', {
      winnerTeam,
      scoreTeamA: game.scoreTeamA,
      scoreTeamB: game.scoreTeamB,
      coches: cochesAwarded,
    })

    if (updatedMatch.matchPhase === 'FINISHED') {
      const persistData: MatchPersistData = {
        roomCode,
        players: updatedMatch.players.map(p => ({
          userId: p.userId,
          seat: p.seat,
          team: p.team,
        })),
        cochesTeamA: updatedMatch.cochesTeamA,
        cochesTeamB: updatedMatch.cochesTeamB,
        winnerTeam: updatedMatch.winnerTeam!,
        games: [
          {
            gameNumber: updatedMatch.gameNumber,
            scoreTeamA: game.scoreTeamA,
            scoreTeamB: game.scoreTeamB,
            winnerTeam,
            cochesAwarded,
            deals: [],
          },
        ],
      }

      persistMatch(persistData).catch(() => {})

      await stateStore.deleteGame(roomCode)
      await stateStore.deleteRoom(roomCode)

      io.to(roomCode).emit('game:match-over', {
        winnerTeam: updatedMatch.winnerTeam!,
        cochesTeamA: updatedMatch.cochesTeamA,
        cochesTeamB: updatedMatch.cochesTeamB,
      })
      return
    }

    // Match continues — start next game after delay
    await stateStore.setGame(roomCode, updatedMatch)

    setTimeout(async () => {
      const currentMatch = await stateStore.getGame(roomCode)
      if (!currentMatch || currentMatch.matchPhase === 'FINISHED') return

      const nextDealer = game.dealer
      let nextMatch = startNewGame(currentMatch, nextDealer)
      nextMatch = {
        ...nextMatch,
        currentGame: startDeal(nextMatch.currentGame!),
      }
      await stateStore.setGame(roomCode, nextMatch)

      const nextGame = nextMatch.currentGame!
      const nextDeal = nextGame.currentDeal!
      for (const player of nextMatch.players) {
        const socketId = await stateStore.getUserSocket(player.userId)
        if (socketId) {
          io.to(socketId).emit('game:deal', {
            hand: nextDeal.hands[player.seat],
            trump: nextDeal.trump,
            dealer: nextDeal.dealer,
            dealNumber: nextGame.dealNumber,
          })
        }
      }

      await notifyCurrentPlayer(io, roomCode, nextMatch)
    }, 5000)
    return
  }

  // Start next deal after a short delay
  setTimeout(async () => {
    const currentMatch = await stateStore.getGame(roomCode)
    if (!currentMatch?.currentGame) return

    const nextGame = startDeal(currentMatch.currentGame)
    currentMatch.currentGame = nextGame
    await stateStore.setGame(roomCode, currentMatch)

    const nextDeal = nextGame.currentDeal!
    for (const player of currentMatch.players) {
      const socketId = await stateStore.getUserSocket(player.userId)
      if (socketId) {
        io.to(socketId).emit('game:deal', {
          hand: nextDeal.hands[player.seat],
          trump: nextDeal.trump,
          dealer: nextDeal.dealer,
          dealNumber: nextGame.dealNumber,
        })
      }
    }

    await notifyCurrentPlayer(io, roomCode, currentMatch)
  }, 3000)
}

/** Handle a marriage announcement from a player. */
export const handleAnnounceMarriage = async (
  io: AppServer,
  socket: AppSocket,
  suit: Suit,
  type: MarriageType,
): Promise<{ success: boolean; error?: string }> => {
  const roomCode = socket.data.roomCode
  if (!roomCode) return { success: false, error: 'Not in a room' }

  const match = await stateStore.getGame(roomCode)
  if (!match) return { success: false, error: 'No active game' }

  const game = match.currentGame
  if (!game?.currentDeal || game.phase !== 'PLAYING') {
    return { success: false, error: 'No active deal' }
  }

  const player = match.players.find(p => p.userId === socket.data.userId)
  if (!player) return { success: false, error: 'Player not found' }

  const deal = game.currentDeal
  const hand = deal.hands[player.seat]
  const team = TEAM_FOR_SEAT[player.seat]

  const teamHasWonTrick = deal.tricks.some(
    t => TEAM_FOR_SEAT[t.winnerSeat] === team,
  )

  const alreadyDeclared = deal.marriages.some(
    m => m.suit === suit && m.team === team,
  )
  if (alreadyDeclared) {
    return { success: false, error: 'Marriage already declared for this suit' }
  }

  if (
    !canDeclareMarriage(
      hand,
      player.seat,
      suit,
      type,
      deal.trump,
      teamHasWonTrick,
    )
  ) {
    return { success: false, error: 'Cannot declare this marriage' }
  }

  const marriage = createMarriage(player.seat, suit, type, deal.trump)
  deal.marriages.push(marriage)

  await stateStore.setGame(roomCode, match)

  io.to(roomCode).emit('game:marriage', {
    seat: player.seat,
    suit,
    type,
    points: marriage.points,
    team,
  })

  return { success: true }
}

/** Handle a "Dehors" announcement from a player. */
export const handleAnnounceDehors = async (
  io: AppServer,
  socket: AppSocket,
): Promise<{ success: boolean; error?: string }> => {
  const roomCode = socket.data.roomCode
  if (!roomCode) return { success: false, error: 'Not in a room' }

  const match = await stateStore.getGame(roomCode)
  if (!match) return { success: false, error: 'No active game' }

  const game = match.currentGame
  if (!game?.currentDeal || game.phase !== 'PLAYING') {
    return { success: false, error: 'No active deal' }
  }

  const player = match.players.find(p => p.userId === socket.data.userId)
  if (!player) return { success: false, error: 'Player not found' }

  const team = TEAM_FOR_SEAT[player.seat]

  if (game.dehorsAnnounced) {
    return { success: false, error: 'Dehors already announced' }
  }

  if (!canAnnounceDehors(game, team)) {
    return { success: false, error: 'Cannot announce dehors yet' }
  }

  game.dehorsAnnounced = { team, atTrick: game.currentDeal.trickNumber }
  await stateStore.setGame(roomCode, match)

  io.to(roomCode).emit('game:dehors', { team, seat: player.seat })

  return { success: true }
}
