/**
 * File: lib/game/types.ts
 * Description: Core type definitions for the Brouc card game engine.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

export type Suit = 'SPADES' | 'HEARTS' | 'DIAMONDS' | 'CLUBS'

export type Rank = '7' | '8' | '9' | '10' | 'JACK' | 'QUEEN' | 'KING' | 'ACE'

export type Card = {
  suit: Suit
  rank: Rank
}

export type Seat = 0 | 1 | 2 | 3

export type Team = 'NORTH_SOUTH' | 'EAST_WEST'

export type MarriageType = 'SIMPLE' | 'EXTENDED'

export type PlayedCard = {
  seat: Seat
  card: Card
}

export type DeclaredMarriage = {
  seat: Seat
  team: Team
  suit: Suit
  type: MarriageType
  points: number
}

export type CompletedTrick = {
  trickNumber: number
  cards: PlayedCard[]
  winnerSeat: Seat
  points: number
}

export type DealState = {
  hands: Card[][]
  trump: Suit
  dealer: Seat
  currentTrick: PlayedCard[]
  trickNumber: number
  currentPlayer: Seat
  tricks: CompletedTrick[]
  marriages: DeclaredMarriage[]
  leadSuit: Suit | null
}

export type DealResult = {
  rawPointsTeamA: number
  rawPointsTeamB: number
  ardoiseTeamA: number
  ardoiseTeamB: number
  marriages: DeclaredMarriage[]
  isCape: boolean
  capeTeam: Team | null
}

export type GamePhase =
  | 'WAITING_FOR_DEAL'
  | 'PLAYING'
  | 'DEAL_COMPLETE'
  | 'GAME_OVER'

export type GameState = {
  scoreTeamA: number
  scoreTeamB: number
  currentDeal: DealState | null
  dealNumber: number
  phase: GamePhase
  dealer: Seat
  dehorsAnnounced: { team: Team; atTrick: number } | null
}

export type MatchState = {
  roomCode: string
  players: PlayerInfo[]
  cochesTeamA: number
  cochesTeamB: number
  currentGame: GameState | null
  gameNumber: number
  matchPhase: 'PLAYING' | 'FINISHED'
  winnerTeam: Team | null
}

export type PlayerInfo = {
  userId: string
  displayName: string
  seat: Seat
  team: Team
}
