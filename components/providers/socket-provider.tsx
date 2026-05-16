/**
 * File: components/providers/socket-provider.tsx
 * Description: Socket.io context provider for sharing connection across components.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@/lib/socket/types'

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>

type SocketContextValue = {
  socket: AppSocket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
})

export const useSocketContext = () => useContext(SocketContext)

interface SocketProviderProps {
  children: React.ReactNode
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const socketRef = useRef<AppSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socket: AppSocket = io({
      transports: ['websocket', 'polling'],
      withCredentials: true,
    })

    socket.on('connect', () => setIsConnected(true))
    socket.on('disconnect', () => setIsConnected(false))

    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  return (
    <SocketContext value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext>
  )
}
