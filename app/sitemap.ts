/**
 * File: app/sitemap.ts
 * Description: Dynamic sitemap generation for search engine indexation.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import type { MetadataRoute } from 'next'
import { env } from '@/lib/core/env'

const sitemap = (): MetadataRoute.Sitemap => {
  const baseUrl = env.NEXT_PUBLIC_APP_URL

  return [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/rules`, changeFrequency: 'monthly', priority: 0.7 },
    {
      url: `${baseUrl}/leaderboard`,
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]
}

export default sitemap
