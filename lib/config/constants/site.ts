/**
 * File: lib/config/constants/site.ts
 * Description: Site identity, branding, legal, and third-party service constants.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

export const METADATA = {
  NAME: 'Brouc',
  DESCRIPTION: "Le jeu de cartes du Pays-d'Enhaut, en solo et multijoueur !",
  TEMPLATE_TITLE: '%s | Brouc',
} as const

export const DEFAULT_ASSETS = {
  LOGO: '/assets/logo-blue.png',
} as const

export const AUTHOR = {
  URL: 'https://henchoznoe.ch',
  NAME: 'Noé Henchoz',
  EMAIL: 'henchoznoe@gmail.com',
} as const

/** Suffix used to set date to noon UTC, avoiding timezone-induced day shifts. */
export const NOON_UTC_SUFFIX = 'T12:00:00.000Z'
