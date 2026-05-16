/**
 * File: app/layout.tsx
 * Description: Root layout for the application.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import { ScrollToTop } from '@/components/ui/scroll-to-top'
import { DEFAULT_ASSETS, METADATA } from '@/lib/config/constants'
import { env } from '@/lib/core/env'
import { cn } from '@/lib/utils/cn'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: METADATA.NAME,
    template: METADATA.TEMPLATE_TITLE,
  },
  description: METADATA.DESCRIPTION,
  icons: {
    icon: DEFAULT_ASSETS.LOGO,
    apple: DEFAULT_ASSETS.LOGO,
  },
  robots:
    env.VERCEL_ENV !== 'production'
      ? { index: false, follow: false }
      : undefined,
}

interface RootLayoutProps {
  children: React.ReactNode
}

const RootLayout = (props: Readonly<RootLayoutProps>) => {
  return (
    <html
      lang="fr-CH"
      className="dark scroll-smooth"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className={cn(inter.variable, 'bg-zinc-50 font-sans antialiased')}
        suppressHydrationWarning
      >
        <Suspense>
          <ScrollToTop />
        </Suspense>
        {props.children}
      </body>
    </html>
  )
}

export default RootLayout
