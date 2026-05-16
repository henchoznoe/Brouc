/**
 * File: lib/game/engine.ts
 * Description: Core game engine — orchestrates deal flow, card plays, and state transitions.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import {
  CARDS_PER_PLAYER,
  COCHES_TO_LOSE,
  PLAYERS_COUNT,
  TEAM_FOR_SEAT,
  TRICKS_PER_DEAL,
  WIN_THRESHOLD,
} from './constants'
import {
  createDeck,
  deal,
  getNextPlayer,
  getStartingPlayer,
  shuffle,
} from './deck'
import { detectMarriageInTrick } from './marriages'
import {
  determineTrickWinner,
  getValidCards,
  hasCard,
  isValidPlay,
  removeCard,
} from './rules'
import {
  calculateCoches,
  calculateDealScore,
  countCardPoints,
  detectCape,
  toArdoise,
} from './scoring'
import type {
  Card,
  CompletedTrick,
  DealResult,
  DealState,
  GameState,
  MatchState,
  PlayerInfo,
  Seat,
  Team,
} from './types'

/** Create initial game state. */
export const createGameState = (dealer: Seat): GameState => ({
  scoreTeamA: 0,
  scoreTeamB: 0,
  currentDeal: null,
  dealNumber: 0,
  phase: 'WAITING_FOR_DEAL',
  dealer,
})

/** Create initial match state. */
export const createMatchState = (
  roomCode: string,
  players: PlayerInfo[],
): MatchState => ({
  roomCode,
  players,
  cochesTeamA: 0,
  cochesTeamB: 0,
  currentGame: null,
  gameNumber: 0,
  matchPhase: 'PLAYING',
  winnerTeam: null,
})

/** Start a new deal: shuffle, deal cards, set starting player. */
export const startDeal = (game: GameState): GameState => {
  const deck = shuffle(createDeck())
  const { hands, trump } = deal(deck, game.dealer)
  const startingPlayer = getStartingPlayer(game.dealer)

  // Verify each hand has exactly 8 cards
  for (let i = 0; i < PLAYERS_COUNT; i++) {
    if (hands[i].length !== CARDS_PER_PLAYER) {
      throw new Error(
        `Hand ${i} has ${hands[i].length} cards, expected ${CARDS_PER_PLAYER}`,
      )
    }
  }

  const dealState: DealState = {
    hands,
    trump,
    dealer: game.dealer,
    currentTrick: [],
    trickNumber: 1,
    currentPlayer: startingPlayer,
    tricks: [],
    marriages: [],
    leadSuit: null,
  }

  return {
    ...game,
    currentDeal: dealState,
    dealNumber: game.dealNumber + 1,
    phase: 'PLAYING',
  }
}

/** Play a card. Returns updated game state or throws on invalid play. */
export const playCard = (
  game: GameState,
  seat: Seat,
  card: Card,
): GameState => {
  if (game.phase !== 'PLAYING' || !game.currentDeal) {
    throw new Error('No active deal')
  }

  const dealState = game.currentDeal
  if (dealState.currentPlayer !== seat) {
    throw new Error(
      `Not seat ${seat}'s turn, expected seat ${dealState.currentPlayer}`,
    )
  }

  const hand = dealState.hands[seat]
  if (!hasCard(hand, card)) {
    throw new Error('Card not in hand')
  }

  if (!isValidPlay(card, hand, dealState)) {
    throw new Error('Invalid card play')
  }

  // Remove card from hand
  const newHands = [...dealState.hands]
  newHands[seat] = removeCard(hand, card)

  // Add card to current trick
  const newTrick = [...dealState.currentTrick, { seat, card }]

  // Set lead suit if first card in trick
  const leadSuit =
    dealState.currentTrick.length === 0 ? card.suit : dealState.leadSuit

  // Check if trick is complete
  if (newTrick.length === PLAYERS_COUNT) {
    return completeTrick(game, {
      ...dealState,
      hands: newHands,
      currentTrick: newTrick,
      leadSuit,
    })
  }

  // Move to next player
  const nextPlayer = getNextPlayer(seat)

  return {
    ...game,
    currentDeal: {
      ...dealState,
      hands: newHands,
      currentTrick: newTrick,
      currentPlayer: nextPlayer,
      leadSuit,
    },
  }
}

/** Complete a trick: determine winner, award points, check for marriages in trick. */
const completeTrick = (game: GameState, dealState: DealState): GameState => {
  const trick = dealState.currentTrick
  const winnerSeat = determineTrickWinner(trick, dealState.trump)
  const points = countCardPoints(trick.map(p => p.card))

  const completedTrick: CompletedTrick = {
    trickNumber: dealState.trickNumber,
    cards: [...trick],
    winnerSeat,
    points,
  }

  const newTricks = [...dealState.tricks, completedTrick]

  // Detect marriages formed in this trick
  const trickMarriages = detectMarriageInTrick(trick, dealState.trump)
  const newMarriages = [...dealState.marriages, ...trickMarriages]

  // Check if deal is complete (8 tricks played)
  if (newTricks.length === TRICKS_PER_DEAL) {
    return completeDeal(game, {
      ...dealState,
      tricks: newTricks,
      marriages: newMarriages,
    })
  }

  // Next trick: winner leads
  return {
    ...game,
    currentDeal: {
      ...dealState,
      currentTrick: [],
      trickNumber: dealState.trickNumber + 1,
      currentPlayer: winnerSeat,
      tricks: newTricks,
      marriages: newMarriages,
      leadSuit: null,
    },
  }
}

/** Complete a deal: calculate scores, check game over. */
const completeDeal = (game: GameState, dealState: DealState): GameState => {
  const { isCape, capeTeam } = detectCape(dealState.tricks)
  const { ardoiseTeamA, ardoiseTeamB } = calculateDealScore(
    dealState.tricks,
    dealState.marriages,
    isCape,
  )

  const newScoreA = game.scoreTeamA + ardoiseTeamA
  const newScoreB = game.scoreTeamB + ardoiseTeamB

  // Rotate dealer for next deal (counter-clockwise)
  const nextDealer = getNextPlayer(game.dealer)

  // Check if game is over (first team to ≥31 on ardoise)
  const gameOver = newScoreA >= WIN_THRESHOLD || newScoreB >= WIN_THRESHOLD

  return {
    ...game,
    scoreTeamA: newScoreA,
    scoreTeamB: newScoreB,
    currentDeal: {
      ...dealState,
      currentTrick: [],
      leadSuit: null,
    },
    dealer: nextDealer,
    phase: gameOver ? 'GAME_OVER' : 'DEAL_COMPLETE',
  }
}

/** Get the result of the completed deal. */
export const getDealResult = (game: GameState): DealResult | null => {
  if (!game.currentDeal || game.phase === 'PLAYING') return null

  const dealState = game.currentDeal
  const { isCape, capeTeam } = detectCape(dealState.tricks)
  const { ardoiseTeamA, ardoiseTeamB, rawA, rawB } = calculateDealScore(
    dealState.tricks,
    dealState.marriages,
    isCape,
  )

  return {
    rawPointsTeamA: rawA,
    rawPointsTeamB: rawB,
    ardoiseTeamA,
    ardoiseTeamB,
    marriages: dealState.marriages,
    isCape,
    capeTeam,
  }
}

/** Determine the winner of a completed game. */
export const getGameWinner = (game: GameState): Team | null => {
  if (game.phase !== 'GAME_OVER') return null
  if (game.scoreTeamA >= WIN_THRESHOLD && game.scoreTeamB >= WIN_THRESHOLD) {
    // Both crossed: higher score wins (shouldn't normally happen as game ends immediately)
    return game.scoreTeamA >= game.scoreTeamB ? 'NORTH_SOUTH' : 'EAST_WEST'
  }
  if (game.scoreTeamA >= WIN_THRESHOLD) return 'NORTH_SOUTH'
  if (game.scoreTeamB >= WIN_THRESHOLD) return 'EAST_WEST'
  return null
}

/** Complete a game within a match: assign coches and check match over. */
export const completeGame = (
  match: MatchState,
  isCape: boolean,
  isDehors: boolean,
): MatchState => {
  const game = match.currentGame
  if (!game || game.phase !== 'GAME_OVER') {
    throw new Error('No completed game')
  }

  const winner = getGameWinner(game)
  if (!winner) throw new Error('Cannot determine game winner')

  const loserTeam: Team = winner === 'NORTH_SOUTH' ? 'EAST_WEST' : 'NORTH_SOUTH'
  const loserScoreBefore =
    loserTeam === 'NORTH_SOUTH'
      ? game.scoreTeamA - (getDealResult(game)?.ardoiseTeamA ?? 0)
      : game.scoreTeamB - (getDealResult(game)?.ardoiseTeamB ?? 0)
  const winnerScoreBefore =
    winner === 'NORTH_SOUTH'
      ? game.scoreTeamA - (getDealResult(game)?.ardoiseTeamA ?? 0)
      : game.scoreTeamB - (getDealResult(game)?.ardoiseTeamB ?? 0)

  const coches = calculateCoches(
    isCape,
    isDehors,
    loserScoreBefore,
    winnerScoreBefore,
  )

  const newCochesA =
    match.cochesTeamA + (loserTeam === 'NORTH_SOUTH' ? coches : 0)
  const newCochesB =
    match.cochesTeamB + (loserTeam === 'EAST_WEST' ? coches : 0)

  const matchOver = newCochesA >= COCHES_TO_LOSE || newCochesB >= COCHES_TO_LOSE

  return {
    ...match,
    cochesTeamA: newCochesA,
    cochesTeamB: newCochesB,
    currentGame: null,
    matchPhase: matchOver ? 'FINISHED' : 'PLAYING',
    winnerTeam: matchOver
      ? newCochesA >= COCHES_TO_LOSE
        ? 'EAST_WEST'
        : 'NORTH_SOUTH'
      : null,
  }
}

/** Start a new game within a match. */
export const startNewGame = (match: MatchState, dealer: Seat): MatchState => {
  if (match.matchPhase === 'FINISHED') {
    throw new Error('Match is already finished')
  }

  return {
    ...match,
    currentGame: createGameState(dealer),
    gameNumber: match.gameNumber + 1,
  }
}

/**
 * Check if "Dehors" can be announced.
 * A team can announce "Dehors" if their current ardoise score + estimated
 * current trick points would reach 31+.
 */
export const canAnnounceDehors = (game: GameState, team: Team): boolean => {
  if (game.phase !== 'PLAYING' || !game.currentDeal) return false

  const currentScore =
    team === 'NORTH_SOUTH' ? game.scoreTeamA : game.scoreTeamB
  const dealState = game.currentDeal

  // Count points already won in this deal by this team
  let dealPoints = 0
  for (const trick of dealState.tricks) {
    if (TEAM_FOR_SEAT[trick.winnerSeat] === team) {
      dealPoints += trick.points
    }
  }

  // Count points in current trick (optimistic: assume this team wins it)
  const currentTrickPoints = countCardPoints(
    dealState.currentTrick.map(p => p.card),
  )
  dealPoints += currentTrickPoints

  const estimatedArdoise = currentScore + toArdoise(dealPoints)
  return estimatedArdoise >= WIN_THRESHOLD
}
