/**
 * File: app/(public)/rules/page.tsx
 * Description: Game rules page — displays the Brouc rules.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Règles du jeu',
}

const RulesPage = async () => {
  const rulesPath = join(process.cwd(), 'public/doc/rules.md')
  const content = await readFile(rulesPath, 'utf-8')

  const lines = content.split('\n')

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="prose prose-invert prose-zinc max-w-none">
        {lines.map((line, i) => {
          if (line.startsWith('### ')) {
            return (
              <h3
                key={`l-${i}`}
                className="mt-6 text-lg font-semibold text-zinc-200"
              >
                {line.slice(4)}
              </h3>
            )
          }
          if (line.startsWith('## ')) {
            return (
              <h2
                key={`l-${i}`}
                className="mt-8 text-xl font-bold text-zinc-100"
              >
                {line.slice(3)}
              </h2>
            )
          }
          if (line.startsWith('# ')) {
            return (
              <h1 key={`l-${i}`} className="text-2xl font-bold text-zinc-50">
                {line.slice(2)}
              </h1>
            )
          }
          if (line.startsWith('```')) return null
          if (line.trim() === '') return <br key={`l-${i}`} />
          if (line.startsWith('- ')) {
            return (
              <li key={`l-${i}`} className="text-zinc-300">
                {line.slice(2)}
              </li>
            )
          }
          return (
            <p key={`l-${i}`} className="text-zinc-300">
              {line}
            </p>
          )
        })}
      </div>
    </div>
  )
}

export default RulesPage
