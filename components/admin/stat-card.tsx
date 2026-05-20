/**
 * File: components/admin/stat-card.tsx
 * Description: Stat display card for admin dashboard.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

export const StatCard = ({
  label,
  value,
}: {
  label: string
  value: number
}) => (
  <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
    <p className="text-sm text-zinc-400">{label}</p>
    <p className="mt-1 text-3xl font-bold">{value}</p>
  </div>
)
