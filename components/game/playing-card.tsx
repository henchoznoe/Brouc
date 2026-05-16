/**
 * File: components/game/playing-card.tsx
 * Description: Single playing card component with suit symbols and rank display.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

'use client'

import type { Card, Suit } from '@/lib/game/types'
import { cn } from '@/lib/utils/cn'

const SUIT_SYMBOLS: Record<Suit, string> = {
  SPADES: '♠',
  HEARTS: '♥',
  DIAMONDS: '♦',
  CLUBS: '♣',
}

const SUIT_COLORS: Record<Suit, string> = {
  SPADES: 'text-zinc-900',
  HEARTS: 'text-red-600',
  DIAMONDS: 'text-red-600',
  CLUBS: 'text-zinc-900',
}

const RANK_DISPLAY: Record<string, string> = {
  '7': '7',
  '8': '8',
  '9': '9',
  '10': '10',
  JACK: 'V',
  QUEEN: 'D',
  KING: 'R',
  ACE: 'A',
}

interface PlayingCardProps {
  card: Card
  onClick?: () => void
  disabled?: boolean
  highlighted?: boolean
  size?: 'sm' | 'md' | 'lg'
  faceDown?: boolean
}

export const PlayingCard = ({
  card,
  onClick,
  disabled = false,
  highlighted = false,
  size = 'md',
  faceDown = false,
}: PlayingCardProps) => {
  const sizeClasses = {
    sm: 'h-16 w-11 text-xs',
    md: 'h-24 w-16 text-sm',
    lg: 'h-32 w-22 text-base',
  }

  if (faceDown) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border-2 border-zinc-600 bg-gradient-to-br from-blue-900 to-blue-950',
          sizeClasses[size],
        )}
      >
        <div className="size-6 rounded-full border border-blue-700 bg-blue-800" />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative flex flex-col items-center justify-between rounded-lg border-2 bg-white p-1 shadow-md transition-all',
        sizeClasses[size],
        SUIT_COLORS[card.suit],
        highlighted &&
          'border-yellow-400 ring-2 ring-yellow-400/50 -translate-y-2',
        !highlighted && 'border-zinc-300',
        !disabled && 'cursor-pointer hover:-translate-y-1 hover:shadow-lg',
        disabled && 'cursor-default opacity-60',
      )}
    >
      <span className="self-start font-bold leading-none">
        {RANK_DISPLAY[card.rank]}
      </span>
      <span className="text-2xl leading-none">{SUIT_SYMBOLS[card.suit]}</span>
      <span className="self-end rotate-180 font-bold leading-none">
        {RANK_DISPLAY[card.rank]}
      </span>
    </button>
  )
}
