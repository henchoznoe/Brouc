/**
 * File: components/game/player-slot.tsx
 * Description: Player avatar/name display at their position around the table.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

'use client'

import type { Team } from '@/lib/game/types'
import { cn } from '@/lib/utils/cn'

interface PlayerSlotProps {
  displayName: string
  team: Team
  isCurrentPlayer: boolean
  tricksWon: number
}

export const PlayerSlot = ({
  displayName,
  team,
  isCurrentPlayer,
  tricksWon,
}: PlayerSlotProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1 rounded-lg px-3 py-2',
        isCurrentPlayer && 'bg-yellow-500/10 ring-1 ring-yellow-500/40',
      )}
    >
      <span
        className={cn(
          'truncate text-sm font-medium',
          team === 'NORTH_SOUTH' ? 'text-blue-400' : 'text-orange-400',
        )}
      >
        {displayName}
      </span>
      {tricksWon > 0 && (
        <span className="text-xs text-zinc-500">{tricksWon} plis</span>
      )}
    </div>
  )
}
