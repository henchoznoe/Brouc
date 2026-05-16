/**
 * File: components/game/game-controls.tsx
 * Description: Game action buttons — Dehors announcement.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

'use client'

import { Button } from '@/components/ui/button'

interface GameControlsProps {
  canAnnounceDehors: boolean
  onAnnounceDehors: () => void
  isMyTurn: boolean
}

export const GameControls = ({
  canAnnounceDehors,
  onAnnounceDehors,
  isMyTurn,
}: GameControlsProps) => {
  return (
    <div className="flex items-center gap-3">
      {isMyTurn && (
        <span className="text-sm font-medium text-yellow-400">
          À votre tour
        </span>
      )}
      {canAnnounceDehors && (
        <Button
          onClick={onAnnounceDehors}
          className="bg-green-700 text-white hover:bg-green-600"
        >
          Dehors !
        </Button>
      )}
    </div>
  )
}
