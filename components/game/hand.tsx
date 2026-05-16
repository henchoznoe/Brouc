/**
 * File: components/game/hand.tsx
 * Description: Player's hand — displays 0-8 cards with valid card highlighting.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

'use client'

import type { Card } from '@/lib/game/types'
import { PlayingCard } from './playing-card'

interface HandProps {
  cards: Card[]
  validCards: Card[]
  isMyTurn: boolean
  onPlayCard: (card: Card) => void
}

const isCardValid = (card: Card, validCards: Card[]): boolean =>
  validCards.some(v => v.suit === card.suit && v.rank === card.rank)

export const Hand = ({
  cards,
  validCards,
  isMyTurn,
  onPlayCard,
}: HandProps) => {
  return (
    <div className="flex items-end justify-center gap-1">
      {cards.map(card => {
        const valid = isMyTurn && isCardValid(card, validCards)
        return (
          <PlayingCard
            key={`${card.suit}-${card.rank}`}
            card={card}
            highlighted={valid}
            disabled={!valid}
            onClick={valid ? () => onPlayCard(card) : undefined}
            size="md"
          />
        )
      })}
    </div>
  )
}
