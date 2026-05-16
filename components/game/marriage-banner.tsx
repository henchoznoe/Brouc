/**
 * File: components/game/marriage-banner.tsx
 * Description: Marriage announcement banner with animation.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

'use client'

import { useEffect, useState } from 'react'
import type { DeclaredMarriage, Suit } from '@/lib/game/types'
import { cn } from '@/lib/utils/cn'

const SUIT_SYMBOLS: Record<Suit, string> = {
  SPADES: '♠',
  HEARTS: '♥',
  DIAMONDS: '♦',
  CLUBS: '♣',
}

interface MarriageBannerProps {
  marriage: DeclaredMarriage | null
}

export const MarriageBanner = ({ marriage }: MarriageBannerProps) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (marriage) {
      setVisible(true)
      const timer = setTimeout(() => setVisible(false), 3000)
      return () => clearTimeout(timer)
    }
    setVisible(false)
  }, [marriage])

  if (!visible || !marriage) return null

  const label = marriage.type === 'EXTENDED' ? 'Mariage étendu' : 'Mariage'
  const isTrump = marriage.points >= 40

  return (
    <div
      className={cn(
        'animate-bounce rounded-lg border px-4 py-2 text-center',
        isTrump
          ? 'border-yellow-500/50 bg-yellow-500/20 text-yellow-300'
          : 'border-zinc-600 bg-zinc-800 text-zinc-200',
      )}
    >
      <p className="text-lg font-bold">
        {label} {SUIT_SYMBOLS[marriage.suit]}
      </p>
      <p className="text-sm">
        {marriage.points} points —{' '}
        {marriage.team === 'NORTH_SOUTH' ? 'Nous' : 'Vous'}
      </p>
    </div>
  )
}
