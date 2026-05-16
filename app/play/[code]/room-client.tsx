/**
 * File: app/play/[code]/room-client.tsx
 * Description: Client component for game room — waiting room with player slots.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { GameClient } from '@/components/game/game-client'
import { useSocketContext } from '@/components/providers/socket-provider'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/config/routes'
import type { RoomPlayer, RoomState } from '@/lib/socket/types'

interface RoomClientProps {
  code: string
  user: {
    id: string
    name: string
    displayName?: string | null
  }
}

export const RoomClient = ({ code, user }: RoomClientProps) => {
  const { socket, isConnected } = useSocketContext()
  const router = useRouter()
  const [room, setRoom] = useState<RoomState | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [gameStarted, setGameStarted] = useState(false)

  const _isCreator = room?.createdBy === user.id
  const myPlayer = room?.players.find(p => p.userId === user.id)
  const isReady = myPlayer?.isReady ?? false

  useEffect(() => {
    if (!socket || !isConnected) return

    socket.on('room:state', setRoom)
    socket.on('room:player-joined', (player: RoomPlayer) => {
      setRoom(prev =>
        prev ? { ...prev, players: [...prev.players, player] } : null,
      )
    })
    socket.on('room:player-left', ({ userId }) => {
      setRoom(prev =>
        prev
          ? { ...prev, players: prev.players.filter(p => p.userId !== userId) }
          : null,
      )
    })
    socket.on('room:player-ready', ({ userId, isReady }) => {
      setRoom(prev => {
        if (!prev) return null
        return {
          ...prev,
          players: prev.players.map(p =>
            p.userId === userId ? { ...p, isReady } : p,
          ),
        }
      })
    })
    socket.on('room:countdown', ({ seconds }) => setCountdown(seconds))
    socket.on('room:dissolved', () => router.push(ROUTES.PLAY))
    socket.on('game:started', () => setGameStarted(true))

    // Join room if not already in it
    if (!room) {
      socket.emit('room:join', { code }, response => {
        if (!response.success) {
          router.push(ROUTES.PLAY)
        }
      })
    }

    return () => {
      socket.off('room:state')
      socket.off('room:player-joined')
      socket.off('room:player-left')
      socket.off('room:player-ready')
      socket.off('room:countdown')
      socket.off('room:dissolved')
      socket.off('game:started')
    }
  }, [socket, isConnected, code, room, router])

  const handleReady = useCallback(() => {
    if (!socket) return
    if (isReady) {
      socket.emit('room:unready')
    } else {
      socket.emit('room:ready')
    }
  }, [socket, isReady])

  const handleLeave = useCallback(() => {
    if (!socket) return
    socket.emit('room:leave')
    router.push(ROUTES.PLAY)
  }, [socket, router])

  if (gameStarted) {
    return <GameClient userId={user.id} />
  }

  if (!room) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Connexion à la room...
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-zinc-950 px-4 text-zinc-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Salle d&apos;attente</h1>
        <p className="mt-2 font-mono text-lg tracking-widest text-zinc-400">
          {room.code}
        </p>
        {room.name && <p className="text-sm text-zinc-500">{room.name}</p>}
      </div>

      {countdown !== null && (
        <div className="text-4xl font-bold text-green-400">{countdown}</div>
      )}

      <div className="grid w-full max-w-md grid-cols-2 gap-4">
        {[0, 1, 2, 3].map(seat => {
          const player = room.players.find(p => p.seat === seat)
          const teamLabel = seat === 0 || seat === 2 ? 'Nous' : 'Vous'
          return (
            <div
              key={`seat-${seat}`}
              className={`rounded-lg border p-4 text-center ${
                player
                  ? player.isReady
                    ? 'border-green-500/50 bg-green-500/10'
                    : 'border-zinc-600 bg-zinc-800'
                  : 'border-dashed border-zinc-700 bg-zinc-900/50'
              }`}
            >
              <p className="text-xs text-zinc-500">{teamLabel}</p>
              {player ? (
                <>
                  <p className="mt-1 truncate font-medium">
                    {player.displayName}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {player.isReady ? '✓ Prêt' : 'En attente'}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-zinc-600">Libre</p>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleReady}
          variant={isReady ? 'outline' : 'default'}
          className="h-10"
        >
          {isReady ? 'Annuler' : 'Prêt'}
        </Button>
        <Button
          onClick={handleLeave}
          variant="ghost"
          className="h-10 text-zinc-400"
        >
          Quitter
        </Button>
      </div>
    </div>
  )
}
