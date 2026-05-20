/**
 * File: lib/socket/rooms.ts
 * Description: Room management — create, join, leave, ready up.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import { ROOM_CODE } from '@/lib/config/constants'
import { TEAM_FOR_SEAT } from '@/lib/game/constants'
import type { Seat } from '@/lib/game/types'
import { stateStore } from './state-store'
import type { RoomPlayer, RoomState } from './types'

const generateRoomCode = (): string => {
  let code = ''
  for (let i = 0; i < ROOM_CODE.LENGTH; i++) {
    code += ROOM_CODE.CHARS[Math.floor(Math.random() * ROOM_CODE.CHARS.length)]
  }
  return code
}

export const createRoom = async (
  userId: string,
  displayName: string,
  name?: string,
): Promise<RoomState> => {
  let code = generateRoomCode()
  let existing = await stateStore.getRoom(code)
  let attempts = 0
  while (existing && attempts < ROOM_CODE.MAX_GENERATION_ATTEMPTS) {
    code = generateRoomCode()
    existing = await stateStore.getRoom(code)
    attempts++
  }
  if (existing) {
    throw new Error('Failed to generate unique room code')
  }

  const player: RoomPlayer = {
    userId,
    displayName,
    seat: 0 as Seat,
    team: TEAM_FOR_SEAT[0],
    isReady: false,
  }

  const room: RoomState = {
    code,
    name: name ?? null,
    status: 'WAITING',
    players: [player],
    createdBy: userId,
  }

  await stateStore.setRoom(code, room)
  return room
}

export const joinRoom = async (
  code: string,
  userId: string,
  displayName: string,
): Promise<{ room: RoomState; player: RoomPlayer }> => {
  const room = await stateStore.getRoom(code)
  if (!room) throw new Error('Room not found')
  if (room.status !== 'WAITING') throw new Error('Game already started')
  if (room.players.length >= 4) throw new Error('Room is full')
  if (room.players.some(p => p.userId === userId)) {
    throw new Error('Already in room')
  }

  const takenSeats = new Set(room.players.map(p => p.seat))
  let seat: Seat = 0 as Seat
  for (let s = 0; s < 4; s++) {
    if (!takenSeats.has(s as Seat)) {
      seat = s as Seat
      break
    }
  }

  const player: RoomPlayer = {
    userId,
    displayName,
    seat,
    team: TEAM_FOR_SEAT[seat],
    isReady: false,
  }

  room.players.push(player)
  await stateStore.setRoom(code, room)
  return { room, player }
}

export const leaveRoom = async (
  code: string,
  userId: string,
): Promise<RoomState | null> => {
  const room = await stateStore.getRoom(code)
  if (!room) return null

  room.players = room.players.filter(p => p.userId !== userId)

  if (room.players.length === 0) {
    await stateStore.deleteRoom(code)
    return null
  }

  // Transfer ownership if creator left
  if (room.createdBy === userId) {
    room.createdBy = room.players[0].userId
  }

  await stateStore.setRoom(code, room)
  return room
}

export const setPlayerReady = async (
  code: string,
  userId: string,
  isReady: boolean,
): Promise<RoomState> => {
  const room = await stateStore.getRoom(code)
  if (!room) throw new Error('Room not found')

  const player = room.players.find(p => p.userId === userId)
  if (!player) throw new Error('Player not in room')

  player.isReady = isReady
  await stateStore.setRoom(code, room)
  return room
}

export const areAllPlayersReady = (room: RoomState): boolean =>
  room.players.length === 4 && room.players.every(p => p.isReady)

export const kickPlayer = async (
  code: string,
  requesterId: string,
  targetId: string,
): Promise<RoomState> => {
  const room = await stateStore.getRoom(code)
  if (!room) throw new Error('Room not found')
  if (room.createdBy !== requesterId)
    throw new Error('Only room creator can kick')
  if (requesterId === targetId) throw new Error('Cannot kick yourself')

  room.players = room.players.filter(p => p.userId !== targetId)
  await stateStore.setRoom(code, room)
  return room
}
