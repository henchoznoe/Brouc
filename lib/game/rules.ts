/**
 * File: lib/game/rules.ts
 * Description: Rule validation — determines which cards can be legally played.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import { RANK_ORDER } from './constants'
import type { Card, DealState, PlayedCard, Seat, Suit } from './types'

/** Check if a card matches a suit. */
export const isSuit = (card: Card, suit: Suit): boolean => card.suit === suit

/** Check if card A is higher than card B in the same suit. */
export const isHigher = (a: Card, b: Card): boolean =>
  RANK_ORDER[a.rank] > RANK_ORDER[b.rank]

/** Get all cards of a given suit from a hand. */
export const cardsOfSuit = (hand: Card[], suit: Suit): Card[] =>
  hand.filter(c => c.suit === suit)

/** Get the highest trump played in the current trick. */
const getHighestTrump = (trick: PlayedCard[], trump: Suit): Card | null => {
  const trumpCards = trick.filter(p => p.card.suit === trump).map(p => p.card)
  if (trumpCards.length === 0) return null
  return trumpCards.reduce((best, card) => (isHigher(card, best) ? card : best))
}

/**
 * Check if playing a card would form a marriage at trump.
 * A marriage can be formed if:
 * - The card is K, Q, or J of trump
 * - The player holds the other required cards (K+Q for simple, K+Q+J for extended)
 */
const wouldFormTrumpMarriage = (
  card: Card,
  hand: Card[],
  trump: Suit,
): boolean => {
  if (card.suit !== trump) return false
  if (card.rank !== 'KING' && card.rank !== 'QUEEN' && card.rank !== 'JACK') {
    return false
  }

  const trumpCards = cardsOfSuit(hand, trump)
  const hasKing = trumpCards.some(c => c.rank === 'KING')
  const hasQueen = trumpCards.some(c => c.rank === 'QUEEN')

  // Must have at least K+Q to form any marriage
  return hasKing && hasQueen
}

/**
 * Determine which cards can be legally played from a hand.
 *
 * Rules:
 * 1. If leading (first to play in trick): any card
 * 2. Must follow suit if possible
 * 3. If cannot follow suit: can trump (play trump) or discard
 * 4. If trump is led: must play trump AND must play higher if possible
 * 5. Exception: can under-trump to form a marriage at trump
 */
export const getValidCards = (hand: Card[], state: DealState): Card[] => {
  // Leading: any card is valid
  if (state.currentTrick.length === 0) {
    return [...hand]
  }

  const leadCard = state.currentTrick[0].card
  const ledSuit = leadCard.suit
  const trump = state.trump

  // Cards in the led suit
  const followCards = cardsOfSuit(hand, ledSuit)

  // Case: can follow suit
  if (followCards.length > 0) {
    // If trump was led, must play trump AND must go higher if possible
    if (ledSuit === trump) {
      return getValidTrumpResponses(hand, followCards, state)
    }
    // Non-trump led: must follow suit (any card of that suit)
    return followCards
  }

  // Cannot follow suit: can play anything (trump to cut, or discard)
  return [...hand]
}

/**
 * When trump is led, player must:
 * - Play trump
 * - Play higher than the current highest trump if possible
 * - Exception: can under-trump to form a marriage
 */
const getValidTrumpResponses = (
  hand: Card[],
  trumpInHand: Card[],
  state: DealState,
): Card[] => {
  const highestTrump = getHighestTrump(state.currentTrick, state.trump)

  if (!highestTrump) {
    // No trump played yet (shouldn't happen if trump is led, but defensive)
    return trumpInHand
  }

  const higherTrumps = trumpInHand.filter(c => isHigher(c, highestTrump))

  if (higherTrumps.length > 0) {
    // Must play higher... unless forming a marriage
    const marriageCards = trumpInHand.filter(
      c =>
        !isHigher(c, highestTrump) &&
        wouldFormTrumpMarriage(c, hand, state.trump),
    )
    return [...higherTrumps, ...marriageCards]
  }

  // Cannot go higher: any trump is valid (forced to play trump still)
  return trumpInHand
}

/**
 * Determine the winner of a completed trick.
 * Highest trump wins if any trump was played, otherwise highest in led suit.
 */
export const determineTrickWinner = (
  trick: PlayedCard[],
  trump: Suit,
): Seat => {
  const ledSuit = trick[0].card.suit

  // Check for trumps
  const trumpPlays = trick.filter(p => p.card.suit === trump)
  if (trumpPlays.length > 0) {
    const winner = trumpPlays.reduce((best, play) =>
      isHigher(play.card, best.card) ? play : best,
    )
    return winner.seat
  }

  // No trumps: highest in led suit wins
  const ledSuitPlays = trick.filter(p => p.card.suit === ledSuit)
  const winner = ledSuitPlays.reduce((best, play) =>
    isHigher(play.card, best.card) ? play : best,
  )
  return winner.seat
}

/** Check if a specific card is in a hand. */
export const hasCard = (hand: Card[], card: Card): boolean =>
  hand.some(c => c.suit === card.suit && c.rank === card.rank)

/** Remove a card from a hand (returns new array). */
export const removeCard = (hand: Card[], card: Card): Card[] =>
  hand.filter(c => !(c.suit === card.suit && c.rank === card.rank))

/** Check if a card play is valid given the current game state. */
export const isValidPlay = (
  card: Card,
  hand: Card[],
  state: DealState,
): boolean => {
  const validCards = getValidCards(hand, state)
  return validCards.some(c => c.suit === card.suit && c.rank === card.rank)
}
