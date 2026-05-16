/**
 * File: lib/config/constants/cache.ts
 * Description: Cache tag names used with cacheTag() and revalidateTag().
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

/** Centralized cache tag names used with cacheTag() and revalidateTag(). */
export const CACHE_TAGS = {
  USERS: 'users',
  LEADERBOARD: 'leaderboard',
  MATCH_HISTORY: 'match-history',
} as const
