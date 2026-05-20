/**
 * File: app/(public)/page.tsx
 * Description: Homepage — animated hero, feature highlights, and quick rules summary.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import Link from 'next/link'
import { FeaturesSection } from '@/components/public/home/features-section'
import { HeroSection } from '@/components/public/home/hero-section'
import { ROUTES } from '@/lib/config/routes'
import { getSession } from '@/lib/services/auth'

const HomePage = async () => {
  const session = await getSession()

  return (
    <div className="text-zinc-50">
      <HeroSection isAuthenticated={!!session} />
      <FeaturesSection />

      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-8">
          <h2 className="text-xl font-bold text-zinc-50">Le jeu en bref</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Le Brouc est un jeu de pli traditionnel suisse du
            Pays-d&apos;Enhaut, joué avec 32 cartes françaises par 4 joueurs en
            2 équipes. Distribution 1-3-4, atout déterminé par la dernière carte
            du donneur. Mariages (Roi + Dame) rapportent des points bonus.
            Première équipe à 31 points d&apos;ardoise gagne la partie. Première
            équipe adverse à 5 coches perd le match.
          </p>
          <Link
            href={ROUTES.RULES}
            className="mt-4 inline-block text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
          >
            Lire les règles complètes &rarr;
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage
