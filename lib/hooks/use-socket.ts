/**
 * File: lib/hooks/use-socket.ts
 * Description: React hook for Socket.io client connection.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@/lib/socket/types'

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>

export const useSocket = () => {
  const socketRef = useRef<AppSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socket: AppSocket = io({
      transports: ['websocket', 'polling'],
      withCredentials: true,
    })

    socket.on('connect', () => {
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  return { socket: socketRef.current, isConnected }
}
