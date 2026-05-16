/**
 * File: components/game/table.tsx
 * Description: Main game table — assembles all game UI components.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

'use client'

import type {
  Card,
  DeclaredMarriage,
  PlayedCard,
  PlayerInfo,
  Seat,
  Suit,
} from '@/lib/game/types'
import { GameControls } from './game-controls'
import { Hand } from './hand'
import { MarriageBanner } from './marriage-banner'
import { PlayerSlot } from './player-slot'
import { Scoreboard } from './scoreboard'
import { TrickArea } from './trick-area'
import { TrumpIndicator } from './trump-indicator'

interface GameTableProps {
  mySeat: Seat
  players: PlayerInfo[]
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
  canDehors: boolean
  tricksWonByPlayer: Record<number, number>
  onPlayCard: (card: Card) => void
  onAnnounceDehors: () => void
}

export const GameTable = ({
  mySeat,
  players,
  hand,
  validCards,
  isMyTurn,
  currentTrick,
  trump,
  currentPlayer,
  scoreTeamA,
  scoreTeamB,
  cochesTeamA,
  cochesTeamB,
  dealNumber,
  lastMarriage,
  canDehors,
  tricksWonByPlayer,
  onPlayCard,
  onAnnounceDehors,
}: GameTableProps) => {
  const getRelativePlayer = (offset: number): PlayerInfo | undefined => {
    const seat = ((mySeat + offset) % 4) as Seat
    return players.find(p => p.seat === seat)
  }

  const partnerPlayer = getRelativePlayer(2)
  const leftPlayer = getRelativePlayer(1)
  const rightPlayer = getRelativePlayer(3)

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-50">
      {/* Top — partner */}
      <div className="flex items-center justify-center py-3">
        {partnerPlayer && (
          <PlayerSlot
            displayName={partnerPlayer.displayName}
            team={partnerPlayer.team}
            isCurrentPlayer={currentPlayer === partnerPlayer.seat}
            tricksWon={tricksWonByPlayer[partnerPlayer.seat] ?? 0}
          />
        )}
      </div>

      {/* Middle row — left player, trick area + info, right player */}
      <div className="flex flex-1 items-center justify-between px-4">
        {/* Left player */}
        <div className="flex flex-col items-center">
          {leftPlayer && (
            <PlayerSlot
              displayName={leftPlayer.displayName}
              team={leftPlayer.team}
              isCurrentPlayer={currentPlayer === leftPlayer.seat}
              tricksWon={tricksWonByPlayer[leftPlayer.seat] ?? 0}
            />
          )}
        </div>

        {/* Center — trick + marriage + controls */}
        <div className="flex flex-col items-center gap-4">
          <TrumpIndicator suit={trump} />
          <TrickArea cards={currentTrick} mySeat={mySeat} />
          <MarriageBanner marriage={lastMarriage} />
          <GameControls
            canAnnounceDehors={canDehors}
            onAnnounceDehors={onAnnounceDehors}
            isMyTurn={isMyTurn}
          />
        </div>

        {/* Right player */}
        <div className="flex flex-col items-center">
          {rightPlayer && (
            <PlayerSlot
              displayName={rightPlayer.displayName}
              team={rightPlayer.team}
              isCurrentPlayer={currentPlayer === rightPlayer.seat}
              tricksWon={tricksWonByPlayer[rightPlayer.seat] ?? 0}
            />
          )}
        </div>
      </div>

      {/* Bottom — my hand + scoreboard */}
      <div className="flex flex-col items-center gap-3 pb-4">
        <Hand
          cards={hand}
          validCards={validCards}
          isMyTurn={isMyTurn}
          onPlayCard={onPlayCard}
        />
        <div className="flex items-center gap-4">
          <Scoreboard
            scoreTeamA={scoreTeamA}
            scoreTeamB={scoreTeamB}
            cochesTeamA={cochesTeamA}
            cochesTeamB={cochesTeamB}
            dealNumber={dealNumber}
          />
        </div>
      </div>
    </div>
  )
}
