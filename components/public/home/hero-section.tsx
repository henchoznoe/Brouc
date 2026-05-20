/**
 * File: components/public/home/hero-section.tsx
 * Description: Hero section with floating card decorations for the homepage.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { METADATA } from '@/lib/config/constants'
import { ROUTES } from '@/lib/config/routes'

interface HeroSectionProps {
  isAuthenticated: boolean
}

const FLOATING_CARDS = [
  {
    suit: '♠',
    color: 'text-zinc-300',
    rank: 'A',
    x: '10%',
    y: '20%',
    rotate: '-15deg',
  },
  {
    suit: '♥',
    color: 'text-red-500',
    rank: 'R',
    x: '80%',
    y: '15%',
    rotate: '12deg',
  },
  {
    suit: '♦',
    color: 'text-red-500',
    rank: 'D',
    x: '85%',
    y: '65%',
    rotate: '-8deg',
  },
  {
    suit: '♣',
    color: 'text-zinc-300',
    rank: 'V',
    x: '5%',
    y: '70%',
    rotate: '20deg',
  },
  {
    suit: '♥',
    color: 'text-red-500',
    rank: '10',
    x: '15%',
    y: '45%',
    rotate: '-25deg',
  },
  {
    suit: '♠',
    color: 'text-zinc-300',
    rank: '9',
    x: '75%',
    y: '40%',
    rotate: '18deg',
  },
] as const

export const HeroSection = ({ isAuthenticated }: HeroSectionProps) => {
  return (
    <section className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 py-20">
      {FLOATING_CARDS.map((card, i) => (
        <div
          key={i}
          className="pointer-events-none absolute select-none opacity-15"
          style={{
            left: card.x,
            top: card.y,
            transform: `rotate(${card.rotate})`,
          }}
        >
          <div className="flex h-24 w-16 flex-col items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 shadow-lg sm:h-32 sm:w-20">
            <span className={`text-lg font-bold sm:text-xl ${card.color}`}>
              {card.rank}
            </span>
            <span className={`text-2xl sm:text-3xl ${card.color}`}>
              {card.suit}
            </span>
          </div>
        </div>
      ))}

      <div className="relative z-10 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-zinc-50 sm:text-6xl md:text-7xl">
          Le <span className="text-red-500">B</span>rouc
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-zinc-400 sm:text-xl">
          {METADATA.DESCRIPTION}
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="h-12 px-8 text-base">
            <Link href={isAuthenticated ? ROUTES.PLAY : ROUTES.LOGIN}>
              {isAuthenticated ? 'Jouer' : 'Se connecter pour jouer'}
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 px-8 text-base"
          >
            <Link href={ROUTES.RULES}>Découvrir les règles</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
