/**
 * File: lib/game/deck.ts
 * Description: Deck creation, shuffling, and dealing (1-3-4 distribution).
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import { DEAL_DISTRIBUTION, FULL_DECK, PLAYERS_COUNT } from './constants'
import type { Card, Seat, Suit } from './types'

export const createDeck = (): Card[] => [...FULL_DECK]

/** Fisher-Yates shuffle. */
export const shuffle = (deck: Card[]): Card[] => {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Deal cards following the Brouc 1-3-4 distribution pattern.
 * Cards are dealt counter-clockwise starting from the player to the right of the dealer.
 * Returns 4 hands (one per seat) and the trump suit (last card dealt = dealer's last card).
 */
export const deal = (
  deck: Card[],
  dealer: Seat,
): { hands: Card[][]; trump: Suit } => {
  if (deck.length !== 32) {
    throw new Error(`Deck must have 32 cards, got ${deck.length}`)
  }

  const hands: Card[][] = [[], [], [], []]
  let cardIndex = 0

  // Counter-clockwise from dealer's right = seats in order: dealer-1, dealer-2, dealer-3, dealer
  // But counter-clockwise means: seat (dealer + 3) % 4, (dealer + 2) % 4, (dealer + 1) % 4, dealer
  // Actually: "to the right" in counter-clockwise = (dealer - 1 + 4) % 4 is first
  // Counter-clockwise order from dealer: (dealer+3)%4, (dealer+2)%4, (dealer+1)%4, dealer
  // Wait — "Le joueur à droite du donneur commence" and "sens antihoraire"
  // So dealing goes counter-clockwise: starting with player to dealer's right
  // In counter-clockwise: right of dealer = (dealer + 3) % 4

  const dealOrder: Seat[] = []
  for (let i = 1; i <= PLAYERS_COUNT; i++) {
    dealOrder.push(((dealer + PLAYERS_COUNT - i) % PLAYERS_COUNT) as Seat)
  }
  // dealOrder = [right of dealer, ..., dealer last]

  for (const count of DEAL_DISTRIBUTION) {
    for (const seat of dealOrder) {
      for (let c = 0; c < count; c++) {
        hands[seat].push(deck[cardIndex])
        cardIndex++
      }
    }
  }

  // Trump is determined by the last card dealt (the dealer's last card)
  const lastCardDealt = deck[cardIndex - 1]
  const trump = lastCardDealt.suit

  return { hands, trump }
}

/** Get the starting player (to the right of the dealer, counter-clockwise). */
export const getStartingPlayer = (dealer: Seat): Seat =>
  ((dealer + PLAYERS_COUNT - 1) % PLAYERS_COUNT) as Seat

/** Get the next player in counter-clockwise order. */
export const getNextPlayer = (current: Seat): Seat =>
  ((current + PLAYERS_COUNT - 1) % PLAYERS_COUNT) as Seat
