/**
 * File: lib/socket/server.ts
 * Description: Socket.io server setup and event handler registration.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import type { Server } from 'socket.io'
import { GAME_STATE } from '@/lib/config/constants'
import { logger } from '@/lib/core/logger'
import { authMiddleware } from './auth-middleware'
import {
  handleAnnounceDehors,
  handleAnnounceMarriage,
  handlePlayCard,
  startGame,
} from './game-handler'
import {
  areAllPlayersReady,
  createRoom,
  joinRoom,
  kickPlayer,
  leaveRoom,
  setPlayerReady,
} from './rooms'
import { stateStore } from './state-store'
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from './types'

type AppServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>

export const setupSocketHandlers = (io: AppServer): void => {
  io.use(authMiddleware)

  io.on('connection', socket => {
    const { userId, displayName } = socket.data
    logger.info({ userId, displayName }, 'Socket connected')

    stateStore.setUserSocket(userId, socket.id)

    // ─── Room events ────────────────────────────────────────────

    socket.on('room:create', async (data, callback) => {
      try {
        const room = await createRoom(userId, displayName, data.name)
        socket.data.roomCode = room.code
        socket.join(room.code)
        socket.emit('room:state', room)
        callback({ code: room.code })
      } catch (err) {
        callback({
          error: err instanceof Error ? err.message : 'Failed to create room',
        })
      }
    })

    socket.on('room:join', async (data, callback) => {
      try {
        const { room, player } = await joinRoom(data.code, userId, displayName)
        socket.data.roomCode = room.code
        socket.join(room.code)
        socket.emit('room:state', room)
        socket.to(room.code).emit('room:player-joined', player)
        callback({ success: true })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to join'
        if (message === 'Already in room') {
          const existing = await stateStore.getRoom(data.code)
          if (existing) {
            socket.data.roomCode = data.code
            socket.join(data.code)
            socket.emit('room:state', existing)
            callback({ success: true })
            return
          }
        }
        callback({ success: false, error: message })
      }
    })

    socket.on('room:leave', async () => {
      const roomCode = socket.data.roomCode
      if (!roomCode) return

      const room = await leaveRoom(roomCode, userId)
      socket.leave(roomCode)
      socket.data.roomCode = null

      if (room) {
        io.to(roomCode).emit('room:player-left', { userId })
        io.to(roomCode).emit('room:state', room)
      }
    })

    socket.on('room:ready', async () => {
      const roomCode = socket.data.roomCode
      if (!roomCode) return

      try {
        const room = await setPlayerReady(roomCode, userId, true)
        io.to(roomCode).emit('room:player-ready', { userId, isReady: true })

        if (areAllPlayersReady(room)) {
          room.status = 'STARTING'
          await stateStore.setRoom(roomCode, room)
          io.to(roomCode).emit('room:countdown', {
            seconds: GAME_STATE.COUNTDOWN_SECONDS,
          })

          setTimeout(async () => {
            const currentRoom = await stateStore.getRoom(roomCode)
            if (
              currentRoom &&
              currentRoom.status === 'STARTING' &&
              areAllPlayersReady(currentRoom)
            ) {
              await startGame(io, currentRoom)
            }
          }, GAME_STATE.COUNTDOWN_MS)
        }
      } catch {
        // Player not in room
      }
    })

    socket.on('room:unready', async () => {
      const roomCode = socket.data.roomCode
      if (!roomCode) return

      try {
        const room = await setPlayerReady(roomCode, userId, false)
        io.to(roomCode).emit('room:player-ready', { userId, isReady: false })

        if (room.status === 'STARTING') {
          room.status = 'WAITING'
          await stateStore.setRoom(roomCode, room)
        }
      } catch {
        // Ignore
      }
    })

    socket.on('room:kick', async data => {
      const roomCode = socket.data.roomCode
      if (!roomCode) return

      try {
        const room = await kickPlayer(roomCode, userId, data.userId)
        io.to(roomCode).emit('room:player-left', { userId: data.userId })
        io.to(roomCode).emit('room:state', room)

        const kickedSocketId = await stateStore.getUserSocket(data.userId)
        if (kickedSocketId) {
          const kickedSocket = io.sockets.sockets.get(kickedSocketId)
          if (kickedSocket) {
            kickedSocket.data.roomCode = null
            kickedSocket.leave(roomCode)
            kickedSocket.emit('room:dissolved', { reason: 'You were kicked' })
          }
        }
      } catch {
        // Not authorized or room not found
      }
    })

    // ─── Game events ────────────────────────────────────────────

    socket.on('game:play-card', async (data, callback) => {
      const result = await handlePlayCard(io, socket, data.card)
      callback(result)
    })

    socket.on('game:announce-marriage', async (data, callback) => {
      const result = await handleAnnounceMarriage(
        io,
        socket,
        data.suit,
        data.type,
      )
      callback(result)
    })

    socket.on('game:announce-dehors', async callback => {
      const result = await handleAnnounceDehors(io, socket)
      callback(result)
    })

    // ─── Disconnect ─────────────────────────────────────────────

    socket.on('disconnect', async () => {
      logger.info({ userId }, 'Socket disconnected')
      await stateStore.deleteUserSocket(userId)

      const roomCode = socket.data.roomCode
      if (!roomCode) return

      const room = await stateStore.getRoom(roomCode)
      if (!room) return

      if (room.status === 'WAITING') {
        const updatedRoom = await leaveRoom(roomCode, userId)
        if (updatedRoom) {
          io.to(roomCode).emit('room:player-left', { userId })
          io.to(roomCode).emit('room:state', updatedRoom)
        }
      }
      // During game: keep player in room for reconnection
    })
  })
}
