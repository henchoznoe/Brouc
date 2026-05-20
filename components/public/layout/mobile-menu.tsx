/**
 * File: components/public/layout/mobile-menu.tsx
 * Description: Mobile navigation slide-out menu.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

'use client'

import { X } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/config/routes'
import { cn } from '@/lib/utils/cn'

const NAV_LINKS = [
  { href: ROUTES.HOME, label: 'Accueil' },
  { href: ROUTES.PLAY, label: 'Jouer' },
  { href: ROUTES.LEADERBOARD, label: 'Classement' },
  { href: ROUTES.RULES, label: 'Règles' },
] as const

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  pathname: string
}

export const MobileMenu = ({ open, onClose, pathname }: MobileMenuProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
        aria-label="Fermer le menu"
      />
      <nav className="absolute right-0 top-0 flex h-full w-64 flex-col bg-zinc-900 p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="mb-8 self-end text-zinc-400 hover:text-zinc-50"
        >
          <X className="size-6" />
        </button>
        {NAV_LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={cn(
              'rounded-md px-3 py-2.5 text-base font-medium transition-colors',
              pathname === link.href
                ? 'bg-zinc-800 text-zinc-50'
                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-50',
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
