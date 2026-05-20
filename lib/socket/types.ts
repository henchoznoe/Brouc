/**
 * File: lib/socket/types.ts
 * Description: Socket.io event type definitions for client-server communication.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import type {
  Card,
  DeclaredMarriage,
  MarriageType,
  MatchState,
  Seat,
  Suit,
  Team,
} from '@/lib/game/types'

export type RoomStatus = 'WAITING' | 'STARTING' | 'PLAYING' | 'FINISHED'

export type RoomPlayer = {
  userId: string
  displayName: string
  seat: Seat
  team: Team
  isReady: boolean
}

export type RoomState = {
  code: string
  name: string | null
  status: RoomStatus
  players: RoomPlayer[]
  createdBy: string
}

export interface ClientToServerEvents {
  'room:create': (
    data: { name?: string },
    callback: (response: { code: string } | { error: string }) => void,
  ) => void
  'room:join': (
    data: { code: string },
    callback: (response: { success: boolean; error?: string }) => void,
  ) => void
  'room:leave': () => void
  'room:ready': () => void
  'room:unready': () => void
  'room:kick': (data: { userId: string }) => void
  'game:play-card': (
    data: { card: Card },
    callback: (response: { success: boolean; error?: string }) => void,
  ) => void
  'game:announce-marriage': (
    data: { suit: Suit; type: MarriageType },
    callback: (response: { success: boolean; error?: string }) => void,
  ) => void
  'game:announce-dehors': (
    callback: (response: { success: boolean; error?: string }) => void,
  ) => void
}

export interface ServerToClientEvents {
  'room:state': (state: RoomState) => void
  'room:player-joined': (player: RoomPlayer) => void
  'room:player-left': (data: { userId: string }) => void
  'room:player-ready': (data: { userId: string; isReady: boolean }) => void
  'room:countdown': (data: { seconds: number }) => void
  'room:dissolved': (data: { reason: string }) => void
  'game:started': (data: { match: MatchState }) => void
  'game:deal': (data: {
    hand: Card[]
    trump: Suit
    dealer: Seat
    dealNumber: number
  }) => void
  'game:your-turn': (data: { validCards: Card[] }) => void
  'game:card-played': (data: { seat: Seat; card: Card }) => void
  'game:trick-won': (data: {
    winnerSeat: Seat
    points: number
    trickNumber: number
  }) => void
  'game:marriage': (data: {
    seat: Seat
    suit: Suit
    type: MarriageType
    points: number
    team: Team
  }) => void
  'game:deal-result': (data: {
    ardoiseTeamA: number
    ardoiseTeamB: number
    marriages: DeclaredMarriage[]
    isCape: boolean
    capeTeam: Team | null
  }) => void
  'game:over': (data: {
    winnerTeam: Team
    scoreTeamA: number
    scoreTeamB: number
    coches: number
  }) => void
  'game:dehors': (data: { team: Team; seat: Seat }) => void
  'game:match-over': (data: {
    winnerTeam: Team
    cochesTeamA: number
    cochesTeamB: number
  }) => void
  error: (data: { code: string; message: string }) => void
}

export interface InterServerEvents {
  ping: () => void
}

export interface SocketData {
  userId: string
  displayName: string
  roomCode: string | null
}
