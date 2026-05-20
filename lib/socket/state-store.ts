/**
 * File: lib/socket/state-store.ts
 * Description: Redis-backed state store for rooms and active games.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import { GAME_STATE } from '@/lib/config/constants'
import redis from '@/lib/core/redis'
import type { MatchState } from '@/lib/game/types'
import type { RoomState } from './types'

const ROOM_PREFIX = 'room:'
const GAME_PREFIX = 'game:'
const USER_SOCKET_PREFIX = 'user:socket:'

export const stateStore = {
  // ─── Room state ─────────────────────────────────────────────────

  async getRoom(code: string): Promise<RoomState | null> {
    const data = await redis.get(`${ROOM_PREFIX}${code}`)
    if (!data) return null
    return JSON.parse(data)
  },

  async setRoom(code: string, state: RoomState): Promise<void> {
    await redis.set(
      `${ROOM_PREFIX}${code}`,
      JSON.stringify(state),
      'EX',
      GAME_STATE.ROOM_TTL_SECONDS,
    )
  },

  async deleteRoom(code: string): Promise<void> {
    await redis.del(`${ROOM_PREFIX}${code}`)
  },

  // ─── Game state ─────────────────────────────────────────────────

  async getGame(roomCode: string): Promise<MatchState | null> {
    const data = await redis.get(`${GAME_PREFIX}${roomCode}`)
    if (!data) return null
    return JSON.parse(data)
  },

  async setGame(roomCode: string, state: MatchState): Promise<void> {
    await redis.set(
      `${GAME_PREFIX}${roomCode}`,
      JSON.stringify(state),
      'EX',
      GAME_STATE.GAME_TTL_SECONDS,
    )
  },

  async deleteGame(roomCode: string): Promise<void> {
    await redis.del(`${GAME_PREFIX}${roomCode}`)
  },

  // ─── User socket mapping ────────────────────────────────────────

  async setUserSocket(userId: string, socketId: string): Promise<void> {
    await redis.set(
      `${USER_SOCKET_PREFIX}${userId}`,
      socketId,
      'EX',
      GAME_STATE.ROOM_TTL_SECONDS,
    )
  },

  async getUserSocket(userId: string): Promise<string | null> {
    return redis.get(`${USER_SOCKET_PREFIX}${userId}`)
  },

  async deleteUserSocket(userId: string): Promise<void> {
    await redis.del(`${USER_SOCKET_PREFIX}${userId}`)
  },
}
