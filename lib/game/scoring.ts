/**
 * File: lib/game/scoring.ts
 * Description: Point counting, rounding to ardoise, and deal scoring.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import { CARD_VALUES, POINTS_PER_DEAL, TEAM_FOR_SEAT } from './constants'
import type { Card, CompletedTrick, DeclaredMarriage, Team } from './types'

/** Count the point value of a set of cards. */
export const countCardPoints = (cards: Card[]): number =>
  cards.reduce((sum, card) => sum + CARD_VALUES[card.rank], 0)

/** Count points won by each team from completed tricks. */
export const countTrickPoints = (
  tricks: CompletedTrick[],
): { teamA: number; teamB: number } => {
  let teamA = 0
  let teamB = 0

  for (const trick of tricks) {
    if (TEAM_FOR_SEAT[trick.winnerSeat] === 'NORTH_SOUTH') {
      teamA += trick.points
    } else {
      teamB += trick.points
    }
  }

  return { teamA, teamB }
}

/**
 * Round raw points to ardoise value.
 *
 * Rules:
 * - Divide by 10
 * - Round to nearest integer
 * - "Sur le point": if raw points end in 5, round UP (not to nearest)
 *   e.g. 75 → 8 (not 7.5 rounded to 8, which is the same, but 55 → 6, 45 → 5)
 *
 * Actually the rule is: standard rounding where .5 always rounds up.
 * 52 → 5, 66 → 7, 75 → 8, 55 → 6
 */
export const roundToArdoise = (rawPoints: number): number => {
  return Math.ceil(rawPoints / 10 - 0.4999)
  // This gives: 52→5, 55→6, 57→6, 60→6, 65→7, 75→8
  // Wait — let's be precise:
  // Standard: Math.round(x/10) but with .5 rounding up
  // Math.ceil(rawPoints / 10 - 0.5) doesn't work for exact .5
  // Actually: Math.floor(rawPoints / 10 + 0.5) rounds .5 up
}

/**
 * Round raw points to ardoise score.
 * "Sur le point": if the units digit is 5, round up.
 * Otherwise normal rounding (≥5 rounds up, <5 rounds down).
 *
 * Examples: 52→5, 55→6, 57→6, 60→6, 65→7, 66→7, 75→8, 120→12
 */
export const toArdoise = (rawPoints: number): number => {
  return Math.floor(rawPoints / 10 + 0.5)
}

/**
 * Calculate total marriage points for a team.
 * Marriage points are added to owning team AND subtracted from opponent.
 */
export const calculateMarriageEffect = (
  marriages: DeclaredMarriage[],
): { teamA: number; teamB: number } => {
  let teamA = 0
  let teamB = 0

  for (const marriage of marriages) {
    const ardoisePoints = marriage.points / 10
    if (marriage.team === 'NORTH_SOUTH') {
      teamA += ardoisePoints
      teamB -= ardoisePoints
    } else {
      teamB += ardoisePoints
      teamA -= ardoisePoints
    }
  }

  return { teamA, teamB }
}

/**
 * Calculate the final ardoise scores for a deal.
 *
 * Steps:
 * 1. Count raw points from tricks for each team
 * 2. Round each team's raw points to ardoise
 * 3. "Sur le point" adds 1 to the total deal value if applicable
 * 4. Compute: other team = total deal ardoise - this team's ardoise
 * 5. Add marriage effects (add to owner, subtract from opponent)
 * 6. If cape (one team won all 8 tricks): marriages are cancelled
 */
export const calculateDealScore = (
  tricks: CompletedTrick[],
  marriages: DeclaredMarriage[],
  isCape: boolean,
): {
  ardoiseTeamA: number
  ardoiseTeamB: number
  rawA: number
  rawB: number
} => {
  const { teamA: rawA, teamB: rawB } = countTrickPoints(tricks)

  // Verify total
  const total = rawA + rawB
  if (total !== POINTS_PER_DEAL) {
    throw new Error(
      `Points don't sum to ${POINTS_PER_DEAL}: teamA=${rawA}, teamB=${rawB}`,
    )
  }

  // Round to ardoise
  let ardoiseA = toArdoise(rawA)
  let ardoiseB = toArdoise(rawB)

  // "Sur le point": if either raw total ends in 5, the deal total increases by 1
  // The team with the .5 gets the round-up, the other team's score = total - theirs
  const dealTotal = ardoiseA + ardoiseB

  // Recompute: ensure sum is consistent (12 normally, 13 if "sur le point")
  // Actually: each team is independently rounded. The sum may be 12 or 13.
  // The rules say: "Le score de l'autre équipe = total donne − score adverse"
  // So if one team has 75 (→8), the other has 45 (→5), total would be 13
  // But total raw is always 120, so total ardoise should be 12.
  // The "sur le point" rule means the total becomes 13 when there's a .5.
  // Let's verify: 75+45=120. toArdoise(75)=8, toArdoise(45)=5, sum=13.
  // The rules say total increases by 1. This is correct.

  // Apply marriage effects (cancelled if cape)
  if (!isCape && marriages.length > 0) {
    const marriageEffect = calculateMarriageEffect(marriages)
    ardoiseA += marriageEffect.teamA
    ardoiseB += marriageEffect.teamB
  }

  return { ardoiseTeamA: ardoiseA, ardoiseTeamB: ardoiseB, rawA, rawB }
}

/** Check if a cape occurred (one team won all 8 tricks). */
export const detectCape = (
  tricks: CompletedTrick[],
): { isCape: boolean; capeTeam: Team | null } => {
  if (tricks.length !== 8) return { isCape: false, capeTeam: null }

  const firstWinnerTeam = TEAM_FOR_SEAT[tricks[0].winnerSeat]
  const allSameTeam = tricks.every(
    t => TEAM_FOR_SEAT[t.winnerSeat] === firstWinnerTeam,
  )

  if (allSameTeam) {
    return { isCape: true, capeTeam: firstWinnerTeam }
  }
  return { isCape: false, capeTeam: null }
}

/**
 * Determine how many coches the loser gets.
 *
 * - 1 coche: normal loss
 * - 2 coches: score < 15 on ardoise OR cape
 * - 3 coches: cape et dehors (cape + opponent had ≥19 on ardoise before this deal)
 * - 4 coches: cape, dehors, et pas dédoublé (cape + opponent ≥19 + loser ≤14)
 */
export const calculateCoches = (
  isCape: boolean,
  isDehors: boolean,
  loserArdoiseBeforeDeal: number,
  winnerArdoiseBeforeDeal: number,
): number => {
  if (isCape && isDehors) {
    // "Cape et dehors": winner had ≥19 and made cape
    if (loserArdoiseBeforeDeal <= 14) {
      return 4 // "cape, dehors et pas dédoublé"
    }
    return 3
  }

  if (isCape) {
    return 2
  }

  if (loserArdoiseBeforeDeal < 15) {
    return 2
  }

  return 1
}
