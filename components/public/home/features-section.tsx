/**
 * File: components/public/home/features-section.tsx
 * Description: Feature highlights grid with card suit decorations.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

const FEATURES = [
  {
    suit: '♠',
    suitColor: 'text-zinc-300',
    title: 'Multijoueur temps réel',
    description:
      '4 joueurs, 2 équipes. Affrontez vos amis en ligne avec une connexion instantanée.',
    accent: 'border-zinc-600',
  },
  {
    suit: '♥',
    suitColor: 'text-red-500',
    title: 'Classement ELO',
    description:
      'Grimpez dans le classement et prouvez que vous êtes le meilleur joueur de Brouc.',
    accent: 'border-red-800',
  },
  {
    suit: '♣',
    suitColor: 'text-zinc-300',
    title: "Fidèle aux règles de L'Étivaz",
    description:
      "Mariages, capes, ardoise, coches — le vrai Brouc du Pays-d'Enhaut.",
    accent: 'border-zinc-600',
  },
] as const

export const FeaturesSection = () => {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(feature => (
          <div
            key={feature.title}
            className={`group rounded-xl border ${feature.accent} bg-zinc-900/50 p-6 transition-colors hover:bg-zinc-900`}
          >
            <span className={`text-3xl ${feature.suitColor}`}>
              {feature.suit}
            </span>
            <h3 className="mt-3 text-lg font-semibold text-zinc-50">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm text-zinc-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
