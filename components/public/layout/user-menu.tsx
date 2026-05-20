/**
 * File: components/public/layout/user-menu.tsx
 * Description: Authenticated user dropdown menu in the header.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

'use client'

import { LogOut, Shield, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ROUTES } from '@/lib/config/routes'
import { authClient } from '@/lib/core/auth-client'
import { cn } from '@/lib/utils/cn'
import { hasAdminAccess } from '@/lib/utils/role'
import type { Role } from '@/prisma/generated/prisma'

interface UserMenuProps {
  displayName: string
  role: Role
  image?: string | null
}

export const UserMenu = ({ displayName, role, image }: UserMenuProps) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push(ROUTES.HOME)
    router.refresh()
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-50"
      >
        {image ? (
          <img src={image} alt="" className="size-7 rounded-full" />
        ) : (
          <div className="flex size-7 items-center justify-center rounded-full bg-zinc-700">
            <User className="size-4" />
          </div>
        )}
        <span className="hidden sm:inline">{displayName}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-zinc-700 bg-zinc-900 py-1 shadow-lg">
          <Link
            href={ROUTES.PROFILE}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50"
          >
            <User className="size-4" />
            Profil
          </Link>
          {hasAdminAccess(role) && (
            <Link
              href={ROUTES.ADMIN_DASHBOARD}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50"
            >
              <Shield className="size-4" />
              Administration
            </Link>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className={cn(
              'flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50',
            )}
          >
            <LogOut className="size-4" />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  )
}
