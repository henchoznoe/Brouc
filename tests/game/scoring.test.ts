import { describe, expect, it } from 'vitest'
import {
  calculateCoches,
  calculateDealScore,
  calculateMarriageEffect,
  countCardPoints,
  detectCape,
  toArdoise,
} from '@/lib/game/scoring'
import type {
  Card,
  CompletedTrick,
  DeclaredMarriage,
  Rank,
  Seat,
  Suit,
} from '@/lib/game/types'

const card = (rank: Rank, suit: Suit): Card => ({ rank, suit })

describe('scoring', () => {
  describe('countCardPoints', () => {
    it('counts Ace=11, 10=10, King=4, Queen=3, Jack=2', () => {
      expect(countCardPoints([card('ACE', 'SPADES')])).toBe(11)
      expect(countCardPoints([card('10', 'SPADES')])).toBe(10)
      expect(countCardPoints([card('KING', 'SPADES')])).toBe(4)
      expect(countCardPoints([card('QUEEN', 'SPADES')])).toBe(3)
      expect(countCardPoints([card('JACK', 'SPADES')])).toBe(2)
    })

    it('counts 7, 8, 9 as 0', () => {
      expect(countCardPoints([card('7', 'SPADES')])).toBe(0)
      expect(countCardPoints([card('8', 'SPADES')])).toBe(0)
      expect(countCardPoints([card('9', 'SPADES')])).toBe(0)
    })

    it('sums multiple cards', () => {
      const cards = [
        card('ACE', 'SPADES'),
        card('10', 'HEARTS'),
        card('KING', 'DIAMONDS'),
      ]
      expect(countCardPoints(cards)).toBe(25)
    })

    it('full deck sums to 120', () => {
      const allValueCards = [
        ...Array(4)
          .fill(null)
          .map(() => card('ACE', 'SPADES')), // 44
        ...Array(4)
          .fill(null)
          .map(() => card('10', 'SPADES')), // 40
        ...Array(4)
          .fill(null)
          .map(() => card('KING', 'SPADES')), // 16
        ...Array(4)
          .fill(null)
          .map(() => card('QUEEN', 'SPADES')), // 12
        ...Array(4)
          .fill(null)
          .map(() => card('JACK', 'SPADES')), // 8
      ]
      expect(countCardPoints(allValueCards)).toBe(120)
    })
  })

  describe('toArdoise', () => {
    it('rounds normally', () => {
      expect(toArdoise(52)).toBe(5)
      expect(toArdoise(57)).toBe(6)
      expect(toArdoise(60)).toBe(6)
      expect(toArdoise(66)).toBe(7)
      expect(toArdoise(120)).toBe(12)
    })

    it('rounds up on .5 (sur le point)', () => {
      expect(toArdoise(75)).toBe(8)
      expect(toArdoise(55)).toBe(6)
      expect(toArdoise(45)).toBe(5)
      expect(toArdoise(65)).toBe(7)
      expect(toArdoise(85)).toBe(9)
    })

    it('handles edge cases', () => {
      expect(toArdoise(0)).toBe(0)
      expect(toArdoise(10)).toBe(1)
    })
  })

  describe('calculateMarriageEffect', () => {
    it('adds to owning team and subtracts from opponent', () => {
      const marriages: DeclaredMarriage[] = [
        {
          seat: 0 as Seat,
          team: 'NORTH_SOUTH',
          suit: 'SPADES',
          type: 'SIMPLE',
          points: 20,
        },
      ]
      const effect = calculateMarriageEffect(marriages)
      expect(effect.teamA).toBe(2)
      expect(effect.teamB).toBe(-2)
    })

    it('handles trump marriage (40 pts)', () => {
      const marriages: DeclaredMarriage[] = [
        {
          seat: 1 as Seat,
          team: 'EAST_WEST',
          suit: 'HEARTS',
          type: 'SIMPLE',
          points: 40,
        },
      ]
      const effect = calculateMarriageEffect(marriages)
      expect(effect.teamA).toBe(-4)
      expect(effect.teamB).toBe(4)
    })

    it('handles multiple marriages', () => {
      const marriages: DeclaredMarriage[] = [
        {
          seat: 0 as Seat,
          team: 'NORTH_SOUTH',
          suit: 'SPADES',
          type: 'SIMPLE',
          points: 20,
        },
        {
          seat: 1 as Seat,
          team: 'EAST_WEST',
          suit: 'HEARTS',
          type: 'EXTENDED',
          points: 60,
        },
      ]
      const effect = calculateMarriageEffect(marriages)
      expect(effect.teamA).toBe(2 - 6) // +2 from own, -6 from opponent's
      expect(effect.teamB).toBe(-2 + 6) // -2 from opponent's, +6 from own
    })
  })

  describe('detectCape', () => {
    it('detects cape when one team wins all 8 tricks', () => {
      const tricks: CompletedTrick[] = Array(8)
        .fill(null)
        .map((_, i) => ({
          trickNumber: i + 1,
          cards: [],
          winnerSeat: 0 as Seat, // always NORTH_SOUTH
          points: 15,
        }))
      const { isCape, capeTeam } = detectCape(tricks)
      expect(isCape).toBe(true)
      expect(capeTeam).toBe('NORTH_SOUTH')
    })

    it('detects no cape when tricks are split', () => {
      const tricks: CompletedTrick[] = Array(8)
        .fill(null)
        .map((_, i) => ({
          trickNumber: i + 1,
          cards: [],
          winnerSeat: (i % 2 === 0 ? 0 : 1) as Seat,
          points: 15,
        }))
      const { isCape, capeTeam } = detectCape(tricks)
      expect(isCape).toBe(false)
      expect(capeTeam).toBeNull()
    })

    it('returns false for incomplete deal', () => {
      const { isCape } = detectCape([])
      expect(isCape).toBe(false)
    })
  })

  describe('calculateCoches', () => {
    it('returns 1 for normal loss', () => {
      expect(calculateCoches(false, false, 20, 25)).toBe(1)
    })

    it('returns 2 when loser score < 15', () => {
      expect(calculateCoches(false, false, 14, 25)).toBe(2)
    })

    it('returns 2 for cape', () => {
      expect(calculateCoches(true, false, 20, 25)).toBe(2)
    })

    it('returns 3 for cape et dehors', () => {
      expect(calculateCoches(true, true, 16, 19)).toBe(3)
    })

    it('returns 4 for cape, dehors, pas dédoublé', () => {
      expect(calculateCoches(true, true, 14, 19)).toBe(4)
    })
  })

  describe('calculateDealScore', () => {
    it('calculates basic deal score', () => {
      // Team A wins 80 points, Team B wins 40
      const tricks: CompletedTrick[] = [
        { trickNumber: 1, cards: [], winnerSeat: 0 as Seat, points: 20 },
        { trickNumber: 2, cards: [], winnerSeat: 0 as Seat, points: 20 },
        { trickNumber: 3, cards: [], winnerSeat: 0 as Seat, points: 20 },
        { trickNumber: 4, cards: [], winnerSeat: 0 as Seat, points: 20 },
        { trickNumber: 5, cards: [], winnerSeat: 1 as Seat, points: 10 },
        { trickNumber: 6, cards: [], winnerSeat: 1 as Seat, points: 10 },
        { trickNumber: 7, cards: [], winnerSeat: 1 as Seat, points: 10 },
        { trickNumber: 8, cards: [], winnerSeat: 1 as Seat, points: 10 },
      ]
      const result = calculateDealScore(tricks, [], false)
      expect(result.rawA).toBe(80)
      expect(result.rawB).toBe(40)
      expect(result.ardoiseTeamA).toBe(8)
      expect(result.ardoiseTeamB).toBe(4)
    })

    it('cancels marriages on cape', () => {
      const tricks: CompletedTrick[] = Array(8)
        .fill(null)
        .map((_, i) => ({
          trickNumber: i + 1,
          cards: [],
          winnerSeat: 0 as Seat,
          points: 15,
        }))
      const marriages: DeclaredMarriage[] = [
        {
          seat: 0 as Seat,
          team: 'NORTH_SOUTH',
          suit: 'SPADES',
          type: 'SIMPLE',
          points: 20,
        },
      ]
      const result = calculateDealScore(tricks, marriages, true)
      // Marriage should be cancelled (isCape = true)
      expect(result.ardoiseTeamA).toBe(12) // 120/10 = 12, no marriage added
      expect(result.ardoiseTeamB).toBe(0)
    })

    it('applies marriage effects when no cape', () => {
      const tricks: CompletedTrick[] = [
        { trickNumber: 1, cards: [], winnerSeat: 0 as Seat, points: 30 },
        { trickNumber: 2, cards: [], winnerSeat: 0 as Seat, points: 30 },
        { trickNumber: 3, cards: [], winnerSeat: 2 as Seat, points: 30 },
        { trickNumber: 4, cards: [], winnerSeat: 2 as Seat, points: 10 },
        { trickNumber: 5, cards: [], winnerSeat: 1 as Seat, points: 5 },
        { trickNumber: 6, cards: [], winnerSeat: 1 as Seat, points: 5 },
        { trickNumber: 7, cards: [], winnerSeat: 3 as Seat, points: 5 },
        { trickNumber: 8, cards: [], winnerSeat: 3 as Seat, points: 5 },
      ]
      // TeamA (seats 0,2) = 100 pts, TeamB (seats 1,3) = 20 pts
      const marriages: DeclaredMarriage[] = [
        {
          seat: 0 as Seat,
          team: 'NORTH_SOUTH',
          suit: 'SPADES',
          type: 'SIMPLE',
          points: 20,
        },
      ]
      const result = calculateDealScore(tricks, marriages, false)
      expect(result.rawA).toBe(100)
      expect(result.rawB).toBe(20)
      // ardoise without marriage: 10, 2
      // marriage effect: +2 for A, -2 for B
      expect(result.ardoiseTeamA).toBe(12)
      expect(result.ardoiseTeamB).toBe(0)
    })
  })
})
