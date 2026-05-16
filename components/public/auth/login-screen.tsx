/**
 * File: components/public/auth/login-screen.tsx
 * Description: Login screen with Google OAuth button.
 * Author: Noé Henchoz
 * License: MIT
 * Copyright (c) 2026 Noé Henchoz
 */

'use client'

import { LogIn } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { METADATA } from '@/lib/config/constants'
import { authClient } from '@/lib/core/auth-client'

interface LoginScreenProps {
  redirectTo: string
}

export const LoginScreen = ({ redirectTo }: LoginScreenProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: redirectTo,
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-zinc-950 px-4 text-zinc-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">{METADATA.NAME}</h1>
        <p className="mt-2 text-sm text-zinc-400">{METADATA.DESCRIPTION}</p>
      </div>
      <Button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="h-12 gap-3 px-6 text-base"
      >
        <LogIn className="size-5" />
        {isLoading ? 'Connexion...' : 'Se connecter avec Google'}
      </Button>
    </div>
  )
}
