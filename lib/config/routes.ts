/**
 * File: lib/config/routes.ts
 * Description: Global route definitions and admin access-control configuration.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import { Role } from '@/prisma/generated/prisma'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  UNAUTHORIZED: '/unauthorized',
  RULES: '/rules',
  LEADERBOARD: '/leaderboard',
  PROFILE: '/profile',
  PLAY: '/play',
  PLAY_ROOM: (code: string) => `/play/${code}` as const,
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_DETAIL: (id: string) => `/admin/users/${id}` as const,
} as const

/**
 * Minimum role required for each admin route prefix.
 * The proxy and nav use this to enforce access control dynamically.
 */
export const ADMIN_ROUTE_ROLES = {
  [ROUTES.ADMIN_DASHBOARD]: Role.ADMIN,
  [ROUTES.ADMIN_USERS]: Role.ADMIN,
} as const
