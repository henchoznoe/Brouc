import { describe, expect, it } from 'vitest'
import {
  canAnnounceDehors,
  completeGame,
  createGameState,
  createMatchState,
  getGameWinner,
  playCard,
  startDeal,
  startNewGame,
} from '@/lib/game/engine'
import { getValidCards } from '@/lib/game/rules'
import type { Card, GameState, PlayerInfo, Seat, Suit } from '@/lib/game/types'

const _card = (rank: Card['rank'], suit: Suit): Card => ({ rank, suit })

describe('engine', () => {
  describe('createGameState', () => {
    it('creates initial game state', () => {
      const state = createGameState(0 as Seat)
      expect(state.scoreTeamA).toBe(0)
      expect(state.scoreTeamB).toBe(0)
      expect(state.phase).toBe('WAITING_FOR_DEAL')
      expect(state.currentDeal).toBeNull()
      expect(state.dealNumber).toBe(0)
    })
  })

  describe('startDeal', () => {
    it('deals 8 cards to each player', () => {
      const game = createGameState(0 as Seat)
      const dealt = startDeal(game)
      expect(dealt.phase).toBe('PLAYING')
      expect(dealt.currentDeal).not.toBeNull()
      for (let i = 0; i < 4; i++) {
        expect(dealt.currentDeal?.hands[i]).toHaveLength(8)
      }
    })

    it('sets trump', () => {
      const game = createGameState(0 as Seat)
      const dealt = startDeal(game)
      expect(['SPADES', 'HEARTS', 'DIAMONDS', 'CLUBS']).toContain(
        dealt.currentDeal?.trump,
      )
    })

    it('sets starting player to right of dealer', () => {
      const game = createGameState(2 as Seat)
      const dealt = startDeal(game)
      expect(dealt.currentDeal?.currentPlayer).toBe(1) // right of 2 in counter-clockwise
    })

    it('increments deal number', () => {
      const game = createGameState(0 as Seat)
      const dealt = startDeal(game)
      expect(dealt.dealNumber).toBe(1)
    })
  })

  describe('playCard', () => {
    it('removes card from hand after play', () => {
      const game = startDeal(createGameState(0 as Seat))
      const deal = game.currentDeal!
      const seat = deal.currentPlayer
      const cardToPlay = deal.hands[seat][0]

      const after = playCard(game, seat, cardToPlay)
      expect(after.currentDeal?.hands[seat]).toHaveLength(7)
      expect(after.currentDeal?.hands[seat]).not.toContainEqual(cardToPlay)
    })

    it('adds card to current trick', () => {
      const game = startDeal(createGameState(0 as Seat))
      const deal = game.currentDeal!
      const seat = deal.currentPlayer
      const cardToPlay = deal.hands[seat][0]

      const after = playCard(game, seat, cardToPlay)
      expect(after.currentDeal?.currentTrick).toHaveLength(1)
      expect(after.currentDeal?.currentTrick[0]).toEqual({
        seat,
        card: cardToPlay,
      })
    })

    it('throws if wrong player tries to play', () => {
      const game = startDeal(createGameState(0 as Seat))
      const deal = game.currentDeal!
      const wrongSeat = ((deal.currentPlayer + 1) % 4) as Seat
      const card = deal.hands[wrongSeat][0]

      expect(() => playCard(game, wrongSeat, card)).toThrow('Not seat')
    })

    it('throws if card not in hand', () => {
      const game = startDeal(createGameState(0 as Seat))
      const deal = game.currentDeal!
      const seat = deal.currentPlayer
      // Find a card not in this player's hand
      const otherSeat = ((seat + 1) % 4) as Seat
      const otherCard = deal.hands[otherSeat][0]

      expect(() => playCard(game, seat, otherCard)).toThrow()
    })

    it('completes a full trick after 4 plays', () => {
      let game = startDeal(createGameState(0 as Seat))

      // Play 4 valid cards
      for (let i = 0; i < 4; i++) {
        const deal = game.currentDeal!
        const seat = deal.currentPlayer
        const hand = deal.hands[seat]
        const validCards = getValidCards(hand, deal)
        game = playCard(game, seat, validCards[0])
      }

      // After 4 plays, trick should be complete
      expect(game.currentDeal?.tricks).toHaveLength(1)
      expect(game.currentDeal?.currentTrick).toHaveLength(0)
      expect(game.currentDeal?.trickNumber).toBe(2)
    })
  })

  describe('full deal simulation', () => {
    it('completes 8 tricks and ends the deal', () => {
      let game = startDeal(createGameState(0 as Seat))

      // Play all 8 tricks (32 cards total)
      for (let trick = 0; trick < 8; trick++) {
        for (let play = 0; play < 4; play++) {
          const deal = game.currentDeal!
          const seat = deal.currentPlayer
          const hand = deal.hands[seat]
          const validCards = getValidCards(hand, deal)
          game = playCard(game, seat, validCards[0])
        }
      }

      // Deal should be complete
      expect(game.phase === 'DEAL_COMPLETE' || game.phase === 'GAME_OVER').toBe(
        true,
      )
      expect(game.currentDeal?.tricks).toHaveLength(8)
    })
  })

  describe('createMatchState', () => {
    it('creates initial match state', () => {
      const players: PlayerInfo[] = [
        { userId: '1', displayName: 'A', seat: 0 as Seat, team: 'NORTH_SOUTH' },
        { userId: '2', displayName: 'B', seat: 1 as Seat, team: 'EAST_WEST' },
        { userId: '3', displayName: 'C', seat: 2 as Seat, team: 'NORTH_SOUTH' },
        { userId: '4', displayName: 'D', seat: 3 as Seat, team: 'EAST_WEST' },
      ]
      const match = createMatchState('ABC123', players)
      expect(match.cochesTeamA).toBe(0)
      expect(match.cochesTeamB).toBe(0)
      expect(match.matchPhase).toBe('PLAYING')
      expect(match.gameNumber).toBe(0)
    })
  })

  describe('startNewGame', () => {
    it('starts a new game in the match', () => {
      const players: PlayerInfo[] = [
        { userId: '1', displayName: 'A', seat: 0 as Seat, team: 'NORTH_SOUTH' },
        { userId: '2', displayName: 'B', seat: 1 as Seat, team: 'EAST_WEST' },
        { userId: '3', displayName: 'C', seat: 2 as Seat, team: 'NORTH_SOUTH' },
        { userId: '4', displayName: 'D', seat: 3 as Seat, team: 'EAST_WEST' },
      ]
      const match = createMatchState('ABC123', players)
      const started = startNewGame(match, 0 as Seat)
      expect(started.gameNumber).toBe(1)
      expect(started.currentGame).not.toBeNull()
      expect(started.currentGame?.phase).toBe('WAITING_FOR_DEAL')
    })

    it('throws if match is finished', () => {
      const players: PlayerInfo[] = [
        { userId: '1', displayName: 'A', seat: 0 as Seat, team: 'NORTH_SOUTH' },
        { userId: '2', displayName: 'B', seat: 1 as Seat, team: 'EAST_WEST' },
        { userId: '3', displayName: 'C', seat: 2 as Seat, team: 'NORTH_SOUTH' },
        { userId: '4', displayName: 'D', seat: 3 as Seat, team: 'EAST_WEST' },
      ]
      const match = createMatchState('ABC123', players)
      match.matchPhase = 'FINISHED'
      expect(() => startNewGame(match, 0 as Seat)).toThrow(
        'Match is already finished',
      )
    })
  })

  describe('getGameWinner', () => {
    it('returns null if game not over', () => {
      const game = createGameState(0 as Seat)
      expect(getGameWinner(game)).toBeNull()
    })

    it('returns winning team when score >= 31', () => {
      const game: GameState = {
        ...createGameState(0 as Seat),
        scoreTeamA: 31,
        scoreTeamB: 20,
        phase: 'GAME_OVER',
      }
      expect(getGameWinner(game)).toBe('NORTH_SOUTH')
    })
  })

  describe('canAnnounceDehors', () => {
    it('returns false when no active deal', () => {
      const game = createGameState(0 as Seat)
      expect(canAnnounceDehors(game, 'NORTH_SOUTH')).toBe(false)
    })

    it('returns false when score too low', () => {
      const game = startDeal(createGameState(0 as Seat))
      expect(canAnnounceDehors(game, 'NORTH_SOUTH')).toBe(false)
    })

    it('returns true when ardoise score reaches 31', () => {
      let game = startDeal(createGameState(0 as Seat))
      game = { ...game, scoreTeamA: 30 }
      const deal = game.currentDeal!
      deal.tricks = [
        {
          trickNumber: 1,
          cards: [],
          winnerSeat: 0 as Seat,
          points: 11,
        },
      ]
      expect(canAnnounceDehors(game, 'NORTH_SOUTH')).toBe(true)
    })
  })

  describe('completeGame', () => {
    const players: PlayerInfo[] = [
      { userId: '1', displayName: 'A', seat: 0 as Seat, team: 'NORTH_SOUTH' },
      { userId: '2', displayName: 'B', seat: 1 as Seat, team: 'EAST_WEST' },
      { userId: '3', displayName: 'C', seat: 2 as Seat, team: 'NORTH_SOUTH' },
      { userId: '4', displayName: 'D', seat: 3 as Seat, team: 'EAST_WEST' },
    ]

    it('assigns coches to losing team', () => {
      const match = createMatchState('TEST', players)
      match.currentGame = {
        ...createGameState(0 as Seat),
        scoreTeamA: 31,
        scoreTeamB: 20,
        phase: 'GAME_OVER',
        currentDeal: {
          hands: [[], [], [], []],
          trump: 'SPADES',
          dealer: 0 as Seat,
          currentTrick: [],
          trickNumber: 8,
          currentPlayer: 0 as Seat,
          tricks: Array.from({ length: 8 }, (_, i) => ({
            trickNumber: i + 1,
            cards: [],
            winnerSeat: (i % 2 === 0 ? 0 : 1) as Seat,
            points: 15,
          })),
          marriages: [],
          leadSuit: null,
        },
      }
      const result = completeGame(match, false, false)
      expect(result.cochesTeamB).toBeGreaterThanOrEqual(1)
      expect(result.cochesTeamA).toBe(0)
    })

    it('assigns 2 coches for cape', () => {
      const match = createMatchState('TEST', players)
      match.currentGame = {
        ...createGameState(0 as Seat),
        scoreTeamA: 31,
        scoreTeamB: 0,
        phase: 'GAME_OVER',
        currentDeal: {
          hands: [[], [], [], []],
          trump: 'SPADES',
          dealer: 0 as Seat,
          currentTrick: [],
          trickNumber: 8,
          currentPlayer: 0 as Seat,
          tricks: Array.from({ length: 8 }, (_, i) => ({
            trickNumber: i + 1,
            cards: [],
            winnerSeat: 0 as Seat,
            points: 15,
          })),
          marriages: [],
          leadSuit: null,
        },
      }
      const result = completeGame(match, true, false)
      expect(result.cochesTeamB).toBeGreaterThanOrEqual(2)
    })

    it('finishes match at 5 coches', () => {
      const match = createMatchState('TEST', players)
      match.cochesTeamB = 4
      match.currentGame = {
        ...createGameState(0 as Seat),
        scoreTeamA: 31,
        scoreTeamB: 20,
        phase: 'GAME_OVER',
        currentDeal: {
          hands: [[], [], [], []],
          trump: 'SPADES',
          dealer: 0 as Seat,
          currentTrick: [],
          trickNumber: 8,
          currentPlayer: 0 as Seat,
          tricks: Array.from({ length: 8 }, (_, i) => ({
            trickNumber: i + 1,
            cards: [],
            winnerSeat: (i % 2 === 0 ? 0 : 1) as Seat,
            points: 15,
          })),
          marriages: [],
          leadSuit: null,
        },
      }
      const result = completeGame(match, false, false)
      expect(result.matchPhase).toBe('FINISHED')
      expect(result.winnerTeam).toBe('NORTH_SOUTH')
    })
  })

  describe('dehorsAnnounced field', () => {
    it('initializes to null', () => {
      const game = createGameState(0 as Seat)
      expect(game.dehorsAnnounced).toBeNull()
    })
  })
})
