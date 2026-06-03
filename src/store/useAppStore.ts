// src/store/useAppStore.ts
// Zustand store — estado global de simon-v2-monitor
// ADR-001 — Zustand elegido sobre Context por re-renders controlados
// Zero any — tipos estrictos de src/types/traccar.ts

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { TraccarDevice, TraccarPosition, TraccarSession, AppState } from '@/types/traccar'

interface AppStore {
  // ── Estado de autenticación
  session: TraccarSession | null
  isAuthenticated: boolean

  // ── Lista de dispositivos
  devices: TraccarDevice[]
  selectedDeviceId: number | null

  // ── Posición actual y anterior (para interpolación)
  currentPosition: TraccarPosition | null
  previousPosition: TraccarPosition | null

  // ── Estado de la app
  appState: AppState
  errorMessage: string | null

  // ── Tema
  theme: 'dark' | 'light'

  // ── Acciones
  setSession: (session: TraccarSession | null) => void
  setDevices: (devices: TraccarDevice[]) => void
  selectDevice: (deviceId: number | null) => void
  updatePosition: (position: TraccarPosition) => void
  setAppState: (state: AppState, error?: string) => void
  toggleTheme: () => void
  reset: () => void
}

const initialState = {
  session: null,
  isAuthenticated: false,
  devices: [],
  selectedDeviceId: null,
  currentPosition: null,
  previousPosition: null,
  appState: 'idle' as AppState,
  errorMessage: null,
  theme: 'dark' as const,
}

export const useAppStore = create<AppStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setSession: (session) =>
        set({ session, isAuthenticated: session !== null }, false, 'setSession'),

      setDevices: (devices) =>
        set({ devices }, false, 'setDevices'),

      selectDevice: (deviceId) =>
        set({
          selectedDeviceId: deviceId,
          currentPosition: null,
          previousPosition: null,
          appState: deviceId ? 'tracking' : 'idle',
          errorMessage: null,
        }, false, 'selectDevice'),

      updatePosition: (position) =>
        set((state) => ({
          previousPosition: state.currentPosition,
          currentPosition: position,
        }), false, 'updatePosition'),

      setAppState: (appState, error) =>
        set({ appState, errorMessage: error ?? null }, false, 'setAppState'),

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        document.documentElement.setAttribute('data-theme', next)
        document.documentElement.classList.toggle('dark', next === 'dark')
        set({ theme: next }, false, 'toggleTheme')
      },

      reset: () => set(initialState, false, 'reset'),
    }),
    { name: 'simon-v2-monitor' }
  )
)

// Selectores derivados (evitan re-renders innecesarios)
export const useSelectedDevice = () =>
  useAppStore((s) => s.devices.find((d) => d.id === s.selectedDeviceId) ?? null)

export const useIsTracking = () =>
  useAppStore((s) => s.appState === 'tracking')

export const useHasError = () =>
  useAppStore((s) => s.appState.startsWith('error'))
