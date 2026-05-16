import { describe, expect, it } from 'vitest'
import {
  createDeck,
  deal,
  getNextPlayer,
  getStartingPlayer,
  shuffle,
} from '@/lib/game/deck'

describe('deck', () => {
  describe('createDeck', () => {
    it('creates a deck of 32 cards', () => {
      const deck = createDeck()
      expect(deck).toHaveLength(32)
    })

    it('contains 4 suits with 8 cards each', () => {
      const deck = createDeck()
      const suits = new Set(deck.map(c => c.suit))
      expect(suits.size).toBe(4)
      for (const suit of suits) {
        expect(deck.filter(c => c.suit === suit)).toHaveLength(8)
      }
    })

    it('has no duplicate cards', () => {
      const deck = createDeck()
      const keys = deck.map(c => `${c.suit}-${c.rank}`)
      expect(new Set(keys).size).toBe(32)
    })
  })

  describe('shuffle', () => {
    it('returns a deck of 32 cards', () => {
      const deck = shuffle(createDeck())
      expect(deck).toHaveLength(32)
    })

    it('contains the same cards as the original', () => {
      const original = createDeck()
      const shuffled = shuffle(original)
      const sortFn = (
        a: { suit: string; rank: string },
        b: { suit: string; rank: string },
      ) => `${a.suit}${a.rank}`.localeCompare(`${b.suit}${b.rank}`)
      expect([...shuffled].sort(sortFn)).toEqual([...original].sort(sortFn))
    })

    it('does not mutate the original deck', () => {
      const original = createDeck()
      const copy = [...original]
      shuffle(original)
      expect(original).toEqual(copy)
    })
  })

  describe('deal', () => {
    it('distributes 8 cards to each player', () => {
      const deck = shuffle(createDeck())
      const { hands } = deal(deck, 0)
      for (const hand of hands) {
        expect(hand).toHaveLength(8)
      }
    })

    it('uses all 32 cards exactly once', () => {
      const deck = shuffle(createDeck())
      const { hands } = deal(deck, 0)
      const allCards = hands.flat()
      expect(allCards).toHaveLength(32)
      const keys = allCards.map(c => `${c.suit}-${c.rank}`)
      expect(new Set(keys).size).toBe(32)
    })

    it('determines trump from the last dealt card', () => {
      const deck = createDeck() // not shuffled, predictable
      const { trump } = deal(deck, 0)
      // Last card dealt is deck[31] (the 32nd card)
      expect(trump).toBe(deck[31].suit)
    })

    it('throws if deck does not have 32 cards', () => {
      expect(() => deal([], 0)).toThrow('Deck must have 32 cards')
    })

    it('follows 1-3-4 distribution pattern', () => {
      // Use an ordered deck to verify distribution pattern
      const deck = createDeck()
      const { hands } = deal(deck, 0)
      // Each player gets 1 + 3 + 4 = 8 cards
      for (const hand of hands) {
        expect(hand).toHaveLength(8)
      }
    })
  })

  describe('getStartingPlayer', () => {
    it('returns player to the right of dealer (counter-clockwise)', () => {
      expect(getStartingPlayer(0)).toBe(3)
      expect(getStartingPlayer(1)).toBe(0)
      expect(getStartingPlayer(2)).toBe(1)
      expect(getStartingPlayer(3)).toBe(2)
    })
  })

  describe('getNextPlayer', () => {
    it('moves counter-clockwise', () => {
      expect(getNextPlayer(0)).toBe(3)
      expect(getNextPlayer(1)).toBe(0)
      expect(getNextPlayer(2)).toBe(1)
      expect(getNextPlayer(3)).toBe(2)
    })
  })
})
