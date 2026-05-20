/**
 * File: components/public/layout/footer.tsx
 * Description: Public site footer with copyright and navigation links.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import Link from 'next/link'
import { ROUTES } from '@/lib/config/routes'

export const Footer = () => {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 py-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 text-sm text-zinc-500 sm:flex-row sm:justify-between">
        <p>&copy; 2026 Noé Henchoz</p>
        <nav className="flex gap-4">
          <Link
            href={ROUTES.RULES}
            className="transition-colors hover:text-zinc-300"
          >
            Règles
          </Link>
          <a
            href="https://github.com/henchoznoe/Brouc"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-zinc-300"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  )
}
