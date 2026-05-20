/**
 * File: lib/validations/user.ts
 * Description: Zod schemas for user-related validation.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import { z } from 'zod'
import { VALIDATION_LIMITS } from '@/lib/config/constants'

export const updateDisplayNameSchema = z.object({
  displayName: z
    .string()
    .min(VALIDATION_LIMITS.DISPLAY_NAME_MIN, 'Minimum 2 caractères')
    .max(VALIDATION_LIMITS.DISPLAY_NAME_MAX, 'Maximum 32 caractères')
    .trim(),
})
