/**
 * File: lib/config/constants/validation.ts
 * Description: Validation limits and shared Zod/input constraints.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

/** Shared validation limits used in Zod schemas and component maxLength attributes. */
export const VALIDATION_LIMITS = {
  DISPLAY_NAME_MIN: 2,
  DISPLAY_NAME_MAX: 32,
  ROOM_NAME_MAX: 50,
  SEARCH_QUERY_MAX: 100,
} as const
