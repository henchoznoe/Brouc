/**
 * File: lib/config/constants/game-state.ts
 * Description: Game state TTLs, countdown timing, and pagination limits.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

export const GAME_STATE = {
  ROOM_TTL_SECONDS: 3600,
  GAME_TTL_SECONDS: 7200,
  COUNTDOWN_SECONDS: 3,
  COUNTDOWN_MS: 3000,
  REDIS_MAX_RETRIES: 3,
  LEADERBOARD_DEFAULT_LIMIT: 50,
  ADMIN_USERS_DEFAULT_LIMIT: 100,
} as const
