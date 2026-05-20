/**
 * File: lib/config/constants/room.ts
 * Description: Room code generation constants.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

export const ROOM_CODE = {
  CHARS: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
  LENGTH: 6,
  MAX_GENERATION_ATTEMPTS: 10,
} as const
