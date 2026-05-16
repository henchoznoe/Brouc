/**
 * File: lib/utils/role.ts
 * Description: Role helper utilities for authorization checks.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import { Role } from '@/prisma/generated/prisma'

const ROLE_VALUES = new Set(Object.values(Role))

export const isRoleValue = (value: unknown): value is Role =>
  typeof value === 'string' && ROLE_VALUES.has(value as Role)

export const hasAdminAccess = (role: Role): boolean =>
  role === Role.ADMIN || role === Role.SUPER_ADMIN

export const isSuperAdmin = (role: Role): boolean => role === Role.SUPER_ADMIN
