/**
 * File: lib/game/marriages.ts
 * Description: Marriage detection and scoring logic.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import { MARRIAGE_POINTS, TEAM_FOR_SEAT } from './constants'
import { cardsOfSuit } from './rules'
import type { Card, DeclaredMarriage, MarriageType, Seat, Suit } from './types'

/**
 * Detect possible marriages in a hand for a given suit.
 * - Simple marriage: King + Queen (20 ordinary, 40 trump)
 * - Extended marriage: King + Queen + Jack (30 ordinary, 60 trump)
 */
export const detectMarriageInHand = (
  hand: Card[],
  suit: Suit,
  _trump: Suit,
): MarriageType | null => {
  const suitCards = cardsOfSuit(hand, suit)
  const hasKing = suitCards.some(c => c.rank === 'KING')
  const hasQueen = suitCards.some(c => c.rank === 'QUEEN')
  const hasJack = suitCards.some(c => c.rank === 'JACK')

  if (!hasKing || !hasQueen) return null

  if (hasJack) return 'EXTENDED'
  return 'SIMPLE'
}

/** Get the point value of a marriage. */
export const getMarriagePoints = (
  type: MarriageType,
  suit: Suit,
  trump: Suit,
): number => {
  const isTrump = suit === trump
  if (type === 'EXTENDED') {
    return isTrump
      ? MARRIAGE_POINTS.EXTENDED_TRUMP
      : MARRIAGE_POINTS.EXTENDED_ORDINARY
  }
  return isTrump
    ? MARRIAGE_POINTS.SIMPLE_TRUMP
    : MARRIAGE_POINTS.SIMPLE_ORDINARY
}

/**
 * Create a declared marriage.
 * A player can declare a marriage after winning at least one trick.
 */
export const createMarriage = (
  seat: Seat,
  suit: Suit,
  type: MarriageType,
  trump: Suit,
): DeclaredMarriage => ({
  seat,
  team: TEAM_FOR_SEAT[seat],
  suit,
  type,
  points: getMarriagePoints(type, suit, trump),
})

/**
 * Validate that a player can declare a marriage.
 * Requirements:
 * - Player holds King + Queen of the suit (+ Jack for extended)
 * - Player's team has won at least one trick in this deal
 */
export const canDeclareMarriage = (
  hand: Card[],
  _seat: Seat,
  suit: Suit,
  type: MarriageType,
  _trump: Suit,
  teamHasWonTrick: boolean,
): boolean => {
  if (!teamHasWonTrick) return false

  const suitCards = cardsOfSuit(hand, suit)
  const hasKing = suitCards.some(c => c.rank === 'KING')
  const hasQueen = suitCards.some(c => c.rank === 'QUEEN')
  const hasJack = suitCards.some(c => c.rank === 'JACK')

  if (!hasKing || !hasQueen) return false
  if (type === 'EXTENDED' && !hasJack) return false

  return true
}

/**
 * Detect marriages formed in a trick.
 * When King and Queen (and optionally Jack) of the same suit fall in the same trick
 * played by the same team, it forms a marriage.
 */
export const detectMarriageInTrick = (
  trickCards: { seat: Seat; card: Card }[],
  trump: Suit,
): DeclaredMarriage[] => {
  const marriages: DeclaredMarriage[] = []

  for (const suit of ['SPADES', 'HEARTS', 'DIAMONDS', 'CLUBS'] as Suit[]) {
    const suitPlays = trickCards.filter(p => p.card.suit === suit)
    const kingPlay = suitPlays.find(p => p.card.rank === 'KING')
    const queenPlay = suitPlays.find(p => p.card.rank === 'QUEEN')

    if (!kingPlay || !queenPlay) continue

    // Both must be from the same team
    if (TEAM_FOR_SEAT[kingPlay.seat] !== TEAM_FOR_SEAT[queenPlay.seat]) continue

    const jackPlay = suitPlays.find(
      p =>
        p.card.rank === 'JACK' &&
        TEAM_FOR_SEAT[p.seat] === TEAM_FOR_SEAT[kingPlay.seat],
    )

    const type: MarriageType = jackPlay ? 'EXTENDED' : 'SIMPLE'
    marriages.push(createMarriage(kingPlay.seat, suit, type, trump))
  }

  return marriages
}
