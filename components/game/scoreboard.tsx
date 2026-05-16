/**
 * File: components/game/scoreboard.tsx
 * Description: Ardoise — running scores and coches display.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

'use client'

import { cn } from '@/lib/utils/cn'

interface ScoreboardProps {
  scoreTeamA: number
  scoreTeamB: number
  cochesTeamA: number
  cochesTeamB: number
  dealNumber: number
}

export const Scoreboard = ({
  scoreTeamA,
  scoreTeamB,
  cochesTeamA,
  cochesTeamB,
  dealNumber,
}: ScoreboardProps) => {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-zinc-700 bg-zinc-900/80 p-3">
      <div className="text-center text-xs text-zinc-500">
        Donne {dealNumber}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-zinc-500">Nous</p>
          <p
            className={cn(
              'text-2xl font-bold',
              scoreTeamA >= 31 ? 'text-green-400' : 'text-blue-400',
            )}
          >
            {scoreTeamA}
          </p>
          <div className="mt-1 flex justify-center gap-0.5">
            {Array.from({ length: cochesTeamA }).map((_, i) => (
              <span key={`ca-${i}`} className="text-xs text-red-400">
                /
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <span className="text-zinc-600">|</span>
        </div>

        <div>
          <p className="text-xs text-zinc-500">Vous</p>
          <p
            className={cn(
              'text-2xl font-bold',
              scoreTeamB >= 31 ? 'text-green-400' : 'text-orange-400',
            )}
          >
            {scoreTeamB}
          </p>
          <div className="mt-1 flex justify-center gap-0.5">
            {Array.from({ length: cochesTeamB }).map((_, i) => (
              <span key={`cb-${i}`} className="text-xs text-red-400">
                /
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
