/**
 * File: components/public/profile/display-name-form.tsx
 * Description: Inline form for editing the user's display name.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

'use client'

import { Pencil, X } from 'lucide-react'
import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import { type ActionResult, updateDisplayName } from '@/lib/actions/user'
import { VALIDATION_LIMITS } from '@/lib/config/constants'

interface DisplayNameFormProps {
  currentName: string
}

const initialState: ActionResult = { success: false }

export const DisplayNameForm = ({ currentName }: DisplayNameFormProps) => {
  const [editing, setEditing] = useState(false)
  const [state, formAction, pending] = useActionState(
    updateDisplayName,
    initialState,
  )

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">{currentName}</h1>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
        >
          <Pencil className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <div>
      <form action={formAction} className="flex items-center gap-2">
        <input
          name="displayName"
          defaultValue={currentName}
          minLength={VALIDATION_LIMITS.DISPLAY_NAME_MIN}
          maxLength={VALIDATION_LIMITS.DISPLAY_NAME_MAX}
          className="h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
        />
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? '...' : 'Sauver'}
        </Button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded p-1 text-zinc-500 hover:text-zinc-300"
        >
          <X className="size-4" />
        </button>
      </form>
      {state.errors?.displayName && (
        <p className="mt-1 text-xs text-red-400">
          {state.errors.displayName[0]}
        </p>
      )}
      {state.success && (
        <p className="mt-1 text-xs text-green-400">{state.message}</p>
      )}
    </div>
  )
}
