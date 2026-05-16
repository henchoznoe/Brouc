/**
 * File: lib/game/constants.ts
 * Description: Game constants — card values, thresholds, deck definition.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import type { Card, Rank, Seat, Suit, Team } from './types'

export const SUITS: Suit[] = ['SPADES', 'HEARTS', 'DIAMONDS', 'CLUBS']

export const RANKS: Rank[] = [
  '7',
  '8',
  '9',
  '10',
  'JACK',
  'QUEEN',
  'KING',
  'ACE',
]

export const CARD_VALUES: Record<Rank, number> = {
  '7': 0,
  '8': 0,
  '9': 0,
  '10': 10,
  JACK: 2,
  QUEEN: 3,
  KING: 4,
  ACE: 11,
}

export const RANK_ORDER: Record<Rank, number> = {
  '7': 0,
  '8': 1,
  '9': 2,
  JACK: 3,
  QUEEN: 4,
  KING: 5,
  '10': 6,
  ACE: 7,
}

export const POINTS_PER_DEAL = 120
export const WIN_THRESHOLD = 31
export const COCHES_TO_LOSE = 5
export const TRICKS_PER_DEAL = 8
export const CARDS_PER_PLAYER = 8
export const PLAYERS_COUNT = 4

export const MARRIAGE_POINTS = {
  SIMPLE_ORDINARY: 20,
  SIMPLE_TRUMP: 40,
  EXTENDED_ORDINARY: 30,
  EXTENDED_TRUMP: 60,
} as const

export const FULL_DECK: Card[] = SUITS.flatMap(suit =>
  RANKS.map(rank => ({ suit, rank })),
)

export const TEAM_FOR_SEAT: Record<Seat, Team> = {
  0: 'NORTH_SOUTH',
  1: 'EAST_WEST',
  2: 'NORTH_SOUTH',
  3: 'EAST_WEST',
}

export const DEAL_DISTRIBUTION = [1, 3, 4] as const
