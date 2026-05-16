/**
 * File: components/game/trick-area.tsx
 * Description: Central trick display — shows 0-4 cards played in the current trick.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

'use client'

import type { PlayedCard, Seat } from '@/lib/game/types'
import { cn } from '@/lib/utils/cn'
import { PlayingCard } from './playing-card'

interface TrickAreaProps {
  cards: PlayedCard[]
  mySeat: Seat
}

const POSITION_CLASSES: Record<number, string> = {
  0: 'bottom-0 left-1/2 -translate-x-1/2',
  1: 'right-0 top-1/2 -translate-y-1/2',
  2: 'top-0 left-1/2 -translate-x-1/2',
  3: 'left-0 top-1/2 -translate-y-1/2',
}

export const TrickArea = ({ cards, mySeat }: TrickAreaProps) => {
  const getRelativePosition = (seat: Seat): number => {
    return ((seat - mySeat + 4) % 4) as number
  }

  return (
    <div className="relative h-48 w-48">
      {cards.map(({ seat, card }) => {
        const pos = getRelativePosition(seat)
        return (
          <div
            key={`${card.suit}-${card.rank}`}
            className={cn('absolute', POSITION_CLASSES[pos])}
          >
            <PlayingCard card={card} size="sm" disabled />
          </div>
        )
      })}
    </div>
  )
}
