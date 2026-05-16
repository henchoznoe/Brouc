/**
 * File: app/admin/layout.tsx
 * Description: Admin layout with navigation sidebar.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/config/routes'
import { getSession } from '@/lib/services/auth'
import { hasAdminAccess } from '@/lib/utils/role'

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout = async ({ children }: AdminLayoutProps) => {
  const session = await getSession()
  if (!session?.user || !hasAdminAccess(session.user.role)) {
    redirect(ROUTES.HOME)
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-50">
      <aside className="w-56 border-r border-zinc-800 p-4">
        <h2 className="text-lg font-bold">Admin</h2>
        <nav className="mt-6 flex flex-col gap-2">
          <a
            href={ROUTES.ADMIN_DASHBOARD}
            className="rounded px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            Dashboard
          </a>
          <a
            href={ROUTES.ADMIN_USERS}
            className="rounded px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            Utilisateurs
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}

export default AdminLayout
