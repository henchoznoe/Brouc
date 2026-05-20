/**
 * File: components/public/layout/header.tsx
 * Description: Public site header with navigation, auth state, and mobile menu.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

'use client'

import { Menu } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/config/routes'
import type { AuthSession } from '@/lib/types/auth'
import { cn } from '@/lib/utils/cn'
import { MobileMenu } from './mobile-menu'
import { UserMenu } from './user-menu'

const NAV_LINKS = [
  { href: ROUTES.HOME, label: 'Accueil' },
  { href: ROUTES.PLAY, label: 'Jouer' },
  { href: ROUTES.LEADERBOARD, label: 'Classement' },
  { href: ROUTES.RULES, label: 'Règles' },
] as const

interface HeaderProps {
  session: AuthSession | null
}

export const Header = ({ session }: HeaderProps) => {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href={ROUTES.HOME} className="flex items-center gap-2">
          <Image
            src="/assets/logo-blue.png"
            alt="Brouc"
            width={28}
            height={28}
          />
          <span className="text-lg font-bold text-zinc-50">Brouc</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-zinc-800 text-zinc-50'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-50',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <UserMenu
              displayName={session.user.displayName ?? session.user.name}
              role={session.user.role}
              image={session.user.image}
            />
          ) : (
            <Button asChild variant="secondary" size="sm">
              <Link href={ROUTES.LOGIN}>Connexion</Link>
            </Button>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="ml-1 rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50 md:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        pathname={pathname}
      />
    </header>
  )
}
