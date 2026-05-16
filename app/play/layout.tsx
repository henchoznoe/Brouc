/**
 * File: app/play/layout.tsx
 * Description: Layout for play routes — includes Socket.io provider.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

import { SocketProvider } from '@/components/providers/socket-provider'

interface PlayLayoutProps {
  children: React.ReactNode
}

const PlayLayout = ({ children }: PlayLayoutProps) => {
  return <SocketProvider>{children}</SocketProvider>
}

export default PlayLayout
