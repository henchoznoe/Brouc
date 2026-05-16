/**
 * File: components/game/trump-indicator.tsx
 * Description: Displays the current trump suit.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

'use client'

import type { Suit } from '@/lib/game/types'
import { cn } from '@/lib/utils/cn'

const SUIT_SYMBOLS: Record<Suit, string> = {
  SPADES: '♠',
  HEARTS: '♥',
  DIAMONDS: '♦',
  CLUBS: '♣',
}

const SUIT_NAMES: Record<Suit, string> = {
  SPADES: 'Pique',
  HEARTS: 'Cœur',
  DIAMONDS: 'Carreau',
  CLUBS: 'Trèfle',
}

const SUIT_COLORS: Record<Suit, string> = {
  SPADES: 'text-zinc-200',
  HEARTS: 'text-red-400',
  DIAMONDS: 'text-red-400',
  CLUBS: 'text-zinc-200',
}

interface TrumpIndicatorProps {
  suit: Suit
}

export const TrumpIndicator = ({ suit }: TrumpIndicatorProps) => {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-1.5">
      <span className="text-xs text-zinc-400">Atout</span>
      <span className={cn('text-xl', SUIT_COLORS[suit])}>
        {SUIT_SYMBOLS[suit]}
      </span>
      <span className={cn('text-sm font-medium', SUIT_COLORS[suit])}>
        {SUIT_NAMES[suit]}
      </span>
    </div>
  )
}
