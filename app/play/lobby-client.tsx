/**
 * File: app/play/lobby-client.tsx
 * Description: Client component for lobby — create/join rooms.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useSocketContext } from '@/components/providers/socket-provider'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/config/routes'

interface LobbyClientProps {
  user: {
    id: string
    name: string
    displayName?: string | null
  }
}

export const LobbyClient = ({ user }: LobbyClientProps) => {
  const { socket, isConnected } = useSocketContext()
  const router = useRouter()
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCreate = () => {
    if (!socket || !isConnected) return
    setIsLoading(true)
    setError(null)

    socket.emit('room:create', {}, response => {
      setIsLoading(false)
      if ('code' in response) {
        router.push(ROUTES.PLAY_ROOM(response.code))
      } else {
        setError(response.error)
      }
    })
  }

  const handleJoin = () => {
    if (!socket || !isConnected || !joinCode.trim()) return
    setIsLoading(true)
    setError(null)

    socket.emit(
      'room:join',
      { code: joinCode.trim().toUpperCase() },
      response => {
        setIsLoading(false)
        if (response.success) {
          router.push(ROUTES.PLAY_ROOM(joinCode.trim().toUpperCase()))
        } else {
          setError(response.error ?? 'Impossible de rejoindre')
        }
      },
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-zinc-950 px-4 text-zinc-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Jouer au Brouc</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Bienvenue, {user.displayName || user.name}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          {isConnected ? '● Connecté' : '○ Connexion...'}
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-4">
        <Button
          onClick={handleCreate}
          disabled={!isConnected || isLoading}
          className="h-12 text-base"
        >
          Créer une partie
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">ou</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value)}
            placeholder="Code de la room"
            maxLength={6}
            className="h-12 flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-4 text-center font-mono text-lg uppercase tracking-widest text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
          />
          <Button
            onClick={handleJoin}
            disabled={!isConnected || isLoading || joinCode.trim().length < 4}
            className="h-12"
          >
            Rejoindre
          </Button>
        </div>

        {error && <p className="text-center text-sm text-red-400">{error}</p>}
      </div>
    </div>
  )
}
