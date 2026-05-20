/**
 * File: lib/actions/user.ts
 * Description: Server actions for user profile management.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/core/prisma'
import { getSession } from '@/lib/services/auth'
import { updateDisplayNameSchema } from '@/lib/validations/user'

export type ActionResult = {
  success: boolean
  message?: string
  errors?: Record<string, string[]>
}

export const updateDisplayName = async (
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> => {
  const session = await getSession()
  if (!session?.user) {
    return { success: false, message: 'Non authentifié' }
  }

  const parsed = updateDisplayNameSchema.safeParse({
    displayName: formData.get('displayName'),
  })

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { displayName: parsed.data.displayName },
  })

  revalidatePath('/profile')
  revalidatePath('/leaderboard')

  return { success: true, message: 'Nom mis à jour' }
}
