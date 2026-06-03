// src/hooks/useAuth.ts
// Hook de autenticación contra Traccar API via proxy Netlify
// ADR-004 — CORS proxy en /.netlify/functions/traccar
// WCAG 2.1: estados de error con aria-invalid y mensajes descriptivos

import { useMutation } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { traccarUrl } from '@/lib/utils'
import type { TraccarSession } from '@/types/traccar'

interface LoginCredentials {
  email: string
  password: string
}

interface LoginResult {
  session: TraccarSession
}

// ── Función de login — llama al proxy Netlify
async function loginToTraccar(credentials: LoginCredentials): Promise<LoginResult> {
  const body = new URLSearchParams({
    email: credentials.email,
    password: credentials.password,
  })

  const response = await fetch(traccarUrl('/api/session'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    credentials: 'include', // ← crítico para que JSESSIONID llegue al browser
  })

  if (response.status === 401) {
    throw new Error('Credenciales incorrectas. Verifica el email y la contraseña.')
  }

  if (!response.ok) {
    throw new Error('No pudimos conectar con el servidor. Intenta de nuevo en unos segundos.')
  }

  const session: TraccarSession = await response.json()
  return { session }
}

// ── Logout
async function logoutFromTraccar(): Promise<void> {
  await fetch(traccarUrl('/api/session'), {
    method: 'DELETE',
    credentials: 'include',
  })
}

// ── Hook principal
export function useAuth() {
  const { setSession, setAppState, reset } = useAppStore()

  const loginMutation = useMutation({
    mutationFn: loginToTraccar,

    onMutate: () => {
      setAppState('authenticating')
    },

    onSuccess: ({ session }) => {
      setSession(session)
      setAppState('loading-devices')
    },

    onError: (error: Error) => {
      setSession(null)
      setAppState('error-auth', error.message)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: logoutFromTraccar,
    onSettled: () => {
      reset()
    },
  })

  return {
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error?.message ?? null,
  }
}
