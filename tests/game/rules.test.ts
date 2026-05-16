import { describe, expect, it } from 'vitest'
import {
  determineTrickWinner,
  getValidCards,
  isValidPlay,
} from '@/lib/game/rules'
import type { Card, DealState, Seat, Suit } from '@/lib/game/types'

const card = (rank: Card['rank'], suit: Suit): Card => ({ rank, suit })

const emptyDealState = (
  trump: Suit,
  currentTrick: DealState['currentTrick'] = [],
): DealState => ({
  hands: [[], [], [], []],
  trump,
  dealer: 0 as Seat,
  currentTrick,
  trickNumber: 1,
  currentPlayer: 0 as Seat,
  tricks: [],
  marriages: [],
  leadSuit: currentTrick.length > 0 ? currentTrick[0].card.suit : null,
})

describe('rules', () => {
  describe('getValidCards — leading', () => {
    it('allows any card when leading', () => {
      const hand = [
        card('ACE', 'SPADES'),
        card('7', 'HEARTS'),
        card('KING', 'DIAMONDS'),
      ]
      const state = emptyDealState('CLUBS')
      const valid = getValidCards(hand, state)
      expect(valid).toHaveLength(3)
    })
  })

  describe('getValidCards — must follow suit', () => {
    it('forces following suit when possible', () => {
      const hand = [
        card('ACE', 'SPADES'),
        card('7', 'SPADES'),
        card('KING', 'HEARTS'),
        card('10', 'DIAMONDS'),
      ]
      const state = emptyDealState('CLUBS', [
        { seat: 1 as Seat, card: card('QUEEN', 'SPADES') },
      ])
      const valid = getValidCards(hand, state)
      expect(valid).toHaveLength(2)
      expect(valid.every(c => c.suit === 'SPADES')).toBe(true)
    })

    it('allows any card when void in led suit', () => {
      const hand = [
        card('ACE', 'HEARTS'),
        card('7', 'DIAMONDS'),
        card('KING', 'CLUBS'),
      ]
      const state = emptyDealState('CLUBS', [
        { seat: 1 as Seat, card: card('QUEEN', 'SPADES') },
      ])
      const valid = getValidCards(hand, state)
      expect(valid).toHaveLength(3)
    })
  })

  describe('getValidCards — trump led, must go higher', () => {
    it('forces playing higher trump when trump is led', () => {
      const hand = [
        card('ACE', 'HEARTS'), // trump, higher than 10
        card('9', 'HEARTS'), // trump, lower than 10
        card('KING', 'SPADES'),
      ]
      const state = emptyDealState('HEARTS', [
        { seat: 1 as Seat, card: card('10', 'HEARTS') },
      ])
      const valid = getValidCards(hand, state)
      // Must play ACE (higher trump). 9 is lower and can't form marriage.
      expect(valid).toHaveLength(1)
      expect(valid[0]).toEqual(card('ACE', 'HEARTS'))
    })

    it('allows any trump when cannot go higher', () => {
      const hand = [
        card('7', 'HEARTS'), // trump, lower
        card('8', 'HEARTS'), // trump, lower
        card('KING', 'SPADES'),
      ]
      const state = emptyDealState('HEARTS', [
        { seat: 1 as Seat, card: card('ACE', 'HEARTS') },
      ])
      const valid = getValidCards(hand, state)
      expect(valid).toHaveLength(2)
      expect(valid.every(c => c.suit === 'HEARTS')).toBe(true)
    })

    it('allows under-trump for marriage exception', () => {
      const hand = [
        card('ACE', 'HEARTS'), // higher
        card('KING', 'HEARTS'), // lower, but forms marriage
        card('QUEEN', 'HEARTS'), // lower, but forms marriage
        card('7', 'SPADES'),
      ]
      const state = emptyDealState('HEARTS', [
        { seat: 1 as Seat, card: card('10', 'HEARTS') },
      ])
      const valid = getValidCards(hand, state)
      // ACE is higher. KING and QUEEN can form marriage (under-trump exception).
      expect(valid).toHaveLength(3)
      expect(valid).toContainEqual(card('ACE', 'HEARTS'))
      expect(valid).toContainEqual(card('KING', 'HEARTS'))
      expect(valid).toContainEqual(card('QUEEN', 'HEARTS'))
    })
  })

  describe('determineTrickWinner', () => {
    it('highest card in led suit wins (no trump)', () => {
      const trick = [
        { seat: 0 as Seat, card: card('7', 'SPADES') },
        { seat: 3 as Seat, card: card('ACE', 'SPADES') },
        { seat: 2 as Seat, card: card('KING', 'SPADES') },
        { seat: 1 as Seat, card: card('9', 'HEARTS') }, // discard
      ]
      expect(determineTrickWinner(trick, 'CLUBS')).toBe(3)
    })

    it('trump beats non-trump', () => {
      const trick = [
        { seat: 0 as Seat, card: card('ACE', 'SPADES') },
        { seat: 3 as Seat, card: card('7', 'HEARTS') }, // trump
        { seat: 2 as Seat, card: card('10', 'SPADES') },
        { seat: 1 as Seat, card: card('KING', 'SPADES') },
      ]
      expect(determineTrickWinner(trick, 'HEARTS')).toBe(3)
    })

    it('highest trump wins when multiple trumps played', () => {
      const trick = [
        { seat: 0 as Seat, card: card('ACE', 'SPADES') },
        { seat: 3 as Seat, card: card('7', 'HEARTS') }, // trump low
        { seat: 2 as Seat, card: card('10', 'HEARTS') }, // trump high
        { seat: 1 as Seat, card: card('KING', 'SPADES') },
      ]
      expect(determineTrickWinner(trick, 'HEARTS')).toBe(2)
    })

    it('10 beats King in same suit (10 is higher in Brouc)', () => {
      const trick = [
        { seat: 0 as Seat, card: card('KING', 'SPADES') },
        { seat: 3 as Seat, card: card('10', 'SPADES') },
        { seat: 2 as Seat, card: card('7', 'SPADES') },
        { seat: 1 as Seat, card: card('8', 'SPADES') },
      ]
      expect(determineTrickWinner(trick, 'HEARTS')).toBe(3)
    })
  })

  describe('isValidPlay', () => {
    it('returns false for card not in hand', () => {
      const hand = [card('7', 'SPADES'), card('8', 'HEARTS')]
      const state = emptyDealState('CLUBS')
      expect(isValidPlay(card('ACE', 'DIAMONDS'), hand, state)).toBe(false)
    })

    it('returns true for valid leading card', () => {
      const hand = [card('7', 'SPADES'), card('8', 'HEARTS')]
      const state = emptyDealState('CLUBS')
      expect(isValidPlay(card('7', 'SPADES'), hand, state)).toBe(true)
    })
  })
})
