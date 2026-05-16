/**
 * File: lib/config/constants/auth.ts
 * Description: Authentication, session, rate limiting, and search configuration.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import { SECONDS_PER_DAY, SECONDS_PER_MINUTE } from './timing'

/** Session and rate limit configuration values. */
export const AUTH_CONFIG = {
  SESSION_EXPIRES_IN: SECONDS_PER_DAY * 7, // 7 days
  SESSION_UPDATE_AGE: SECONDS_PER_DAY, // 24 hours
  COOKIE_CACHE_MAX_AGE: SECONDS_PER_MINUTE * 5, // 5 minutes
  RATE_LIMIT_WINDOW: SECONDS_PER_MINUTE, // 1 minute window
  RATE_LIMIT_MAX: 30, // 30 requests per window
} as const
