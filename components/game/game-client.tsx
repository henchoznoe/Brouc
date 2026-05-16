/**
 * File: components/game/game-client.tsx
 * Description: Main game client — connects socket events to the game table UI.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

'use client'

import { useCallback, useEffect, useReducer } from 'react'
import { useSocketContext } from '@/components/providers/socket-provider'
import type {
  Card,
  DeclaredMarriage,
  MatchState,
  PlayedCard,
  PlayerInfo,
  Seat,
  Suit,
  Team,
} from '@/lib/game/types'
import { GameTable } from './table'

type GameUIState = {
  phase: 'WAITING' | 'PLAYING' | 'DEAL_RESULT' | 'GAME_OVER' | 'MATCH_OVER'
  players: PlayerInfo[]
  mySeat: Seat
  hand: Card[]
  validCards: Card[]
  isMyTurn: boolean
  currentTrick: PlayedCard[]
  trump: Suit
  currentPlayer: Seat
  scoreTeamA: number
  scoreTeamB: number
  cochesTeamA: number
  cochesTeamB: number
  dealNumber: number
  lastMarriage: DeclaredMarriage | null
  tricksWonByPlayer: Record<number, number>
  winnerTeam: Team | null
}

type GameAction =
  | { type: 'GAME_STARTED'; match: MatchState; mySeat: Seat }
  | {
      type: 'DEAL'
      hand: Card[]
      trump: Suit
      dealer: Seat
      dealNumber: number
    }
  | { type: 'YOUR_TURN'; validCards: Card[] }
  | { type: 'CARD_PLAYED'; seat: Seat; card: Card }
  | { type: 'TRICK_WON'; winnerSeat: Seat; points: number }
  | { type: 'MARRIAGE'; marriage: DeclaredMarriage }
  | { type: 'DEAL_RESULT'; ardoiseTeamA: number; ardoiseTeamB: number }
  | {
      type: 'GAME_OVER'
      winnerTeam: Team
      scoreTeamA: number
      scoreTeamB: number
    }
  | { type: 'MATCH_OVER'; winnerTeam: Team }

const initialState: GameUIState = {
  phase: 'WAITING',
  players: [],
  mySeat: 0 as Seat,
  hand: [],
  validCards: [],
  isMyTurn: false,
  currentTrick: [],
  trump: 'SPADES',
  currentPlayer: 0 as Seat,
  scoreTeamA: 0,
  scoreTeamB: 0,
  cochesTeamA: 0,
  cochesTeamB: 0,
  dealNumber: 0,
  lastMarriage: null,
  tricksWonByPlayer: {},
  winnerTeam: null,
}

const gameReducer = (state: GameUIState, action: GameAction): GameUIState => {
  switch (action.type) {
    case 'GAME_STARTED':
      return {
        ...state,
        phase: 'PLAYING',
        players: action.match.players,
        mySeat: action.mySeat,
        cochesTeamA: action.match.cochesTeamA,
        cochesTeamB: action.match.cochesTeamB,
      }

    case 'DEAL':
      return {
        ...state,
        phase: 'PLAYING',
        hand: action.hand,
        trump: action.trump,
        dealNumber: action.dealNumber,
        currentTrick: [],
        validCards: [],
        isMyTurn: false,
        lastMarriage: null,
        tricksWonByPlayer: {},
      }

    case 'YOUR_TURN':
      return { ...state, validCards: action.validCards, isMyTurn: true }

    case 'CARD_PLAYED': {
      const newTrick = [
        ...state.currentTrick,
        { seat: action.seat, card: action.card },
      ]
      const newHand =
        action.seat === state.mySeat
          ? state.hand.filter(
              c =>
                !(c.suit === action.card.suit && c.rank === action.card.rank),
            )
          : state.hand
      return {
        ...state,
        currentTrick: newTrick,
        hand: newHand,
        isMyTurn: false,
        validCards: [],
        currentPlayer: action.seat,
      }
    }

    case 'TRICK_WON': {
      const updated = { ...state.tricksWonByPlayer }
      updated[action.winnerSeat] = (updated[action.winnerSeat] ?? 0) + 1
      return {
        ...state,
        currentTrick: [],
        currentPlayer: action.winnerSeat,
        tricksWonByPlayer: updated,
      }
    }

    case 'MARRIAGE':
      return { ...state, lastMarriage: action.marriage }

    case 'DEAL_RESULT':
      return {
        ...state,
        phase: 'DEAL_RESULT',
        scoreTeamA: action.ardoiseTeamA,
        scoreTeamB: action.ardoiseTeamB,
      }

    case 'GAME_OVER':
      return {
        ...state,
        phase: 'GAME_OVER',
        scoreTeamA: action.scoreTeamA,
        scoreTeamB: action.scoreTeamB,
        winnerTeam: action.winnerTeam,
      }

    case 'MATCH_OVER':
      return { ...state, phase: 'MATCH_OVER', winnerTeam: action.winnerTeam }

    default:
      return state
  }
}

interface GameClientProps {
  userId: string
}

export const GameClient = ({ userId }: GameClientProps) => {
  const { socket } = useSocketContext()
  const [state, dispatch] = useReducer(gameReducer, initialState)

  useEffect(() => {
    if (!socket) return

    socket.on('game:started', ({ match }) => {
      const mySeat =
        match.players.find(p => p.userId === userId)?.seat ?? (0 as Seat)
      dispatch({ type: 'GAME_STARTED', match, mySeat })
    })

    socket.on('game:deal', data => {
      dispatch({ type: 'DEAL', ...data })
    })

    socket.on('game:your-turn', ({ validCards }) => {
      dispatch({ type: 'YOUR_TURN', validCards })
    })

    socket.on('game:card-played', ({ seat, card }) => {
      dispatch({ type: 'CARD_PLAYED', seat, card })
    })

    socket.on('game:trick-won', ({ winnerSeat, points }) => {
      dispatch({ type: 'TRICK_WON', winnerSeat, points })
    })

    socket.on('game:marriage', data => {
      dispatch({ type: 'MARRIAGE', marriage: data as DeclaredMarriage })
    })

    socket.on('game:deal-result', data => {
      dispatch({
        type: 'DEAL_RESULT',
        ardoiseTeamA: data.ardoiseTeamA,
        ardoiseTeamB: data.ardoiseTeamB,
      })
    })

    socket.on('game:over', ({ winnerTeam, scoreTeamA, scoreTeamB }) => {
      dispatch({ type: 'GAME_OVER', winnerTeam, scoreTeamA, scoreTeamB })
    })

    socket.on('game:match-over', ({ winnerTeam }) => {
      dispatch({ type: 'MATCH_OVER', winnerTeam })
    })

    return () => {
      socket.off('game:started')
      socket.off('game:deal')
      socket.off('game:your-turn')
      socket.off('game:card-played')
      socket.off('game:trick-won')
      socket.off('game:marriage')
      socket.off('game:deal-result')
      socket.off('game:over')
      socket.off('game:match-over')
    }
  }, [socket, userId])

  const handlePlayCard = useCallback(
    (card: Card) => {
      if (!socket) return
      socket.emit('game:play-card', { card }, response => {
        if (!response.success) {
          console.error('Play rejected:', response.error)
        }
      })
    },
    [socket],
  )

  const handleAnnounceDehors = useCallback(() => {
    if (!socket) return
    socket.emit('game:announce-dehors', response => {
      if (!response.success) {
        console.error('Dehors rejected:', response.error)
      }
    })
  }, [socket])

  if (state.phase === 'WAITING') {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        En attente du début de partie...
      </div>
    )
  }

  if (state.phase === 'MATCH_OVER') {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-zinc-950 text-zinc-50">
        <h1 className="text-3xl font-bold">Match terminé</h1>
        <p className="text-xl">
          {state.winnerTeam === 'NORTH_SOUTH' ? 'Nous' : 'Vous'} gagne !
        </p>
      </div>
    )
  }

  return (
    <GameTable
      mySeat={state.mySeat}
      players={state.players}
      hand={state.hand}
      validCards={state.validCards}
      isMyTurn={state.isMyTurn}
      currentTrick={state.currentTrick}
      trump={state.trump}
      currentPlayer={state.currentPlayer}
      scoreTeamA={state.scoreTeamA}
      scoreTeamB={state.scoreTeamB}
      cochesTeamA={state.cochesTeamA}
      cochesTeamB={state.cochesTeamB}
      dealNumber={state.dealNumber}
      lastMarriage={state.lastMarriage}
      canDehors={false}
      tricksWonByPlayer={state.tricksWonByPlayer}
      onPlayCard={handlePlayCard}
      onAnnounceDehors={handleAnnounceDehors}
    />
  )
}
