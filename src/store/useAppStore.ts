'use client'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { TraccarDevice, TraccarPosition, TraccarSession, AppState } from '@/types/traccar'

interface AppStore {
  session: TraccarSession | null
  isAuthenticated: boolean
  devices: TraccarDevice[]
  selectedDeviceId: number | null
  currentPosition: TraccarPosition | null
  previousPosition: TraccarPosition | null
  appState: AppState
  errorMessage: string | null
  theme: 'dark' | 'light'
  setSession: (session: TraccarSession | null) => void
  setDevices: (devices: TraccarDevice[]) => void
  selectDevice: (deviceId: number | null) => void
  updatePosition: (position: TraccarPosition) => void
  setAppState: (state: AppState, error?: string) => void
  toggleTheme: () => void
  reset: () => void
}

const getSavedTheme = (): 'dark' | 'light' => {
  if (typeof window === 'undefined') return 'dark'
  return (localStorage.getItem('fleet-theme') as 'dark' | 'light') ?? 'dark'
}

const initialState = {
  session: null, isAuthenticated: false, devices: [],
  selectedDeviceId: null, currentPosition: null, previousPosition: null,
  appState: 'idle' as AppState, errorMessage: null, theme: 'dark' as const,
}

export const useAppStore = create<AppStore>()(
  devtools((set, get) => ({
    ...initialState,
    setSession: (session) => set({ session, isAuthenticated: session !== null }),
    setDevices: (devices) => set({ devices }),
    selectDevice: (deviceId) => set({
      selectedDeviceId: deviceId, currentPosition: null, previousPosition: null,
      appState: deviceId ? 'tracking' : 'idle', errorMessage: null,
    }),
    updatePosition: (position) => set(state => ({
      previousPosition: state.currentPosition, currentPosition: position,
    })),
    setAppState: (appState, error) => set({ appState, errorMessage: error ?? null }),
    toggleTheme: () => {
      const next = get().theme === 'dark' ? 'light' : 'dark'
      if (typeof window !== 'undefined') {
        document.documentElement.setAttribute('data-theme', next)
        document.documentElement.classList.toggle('dark', next === 'dark')
        localStorage.setItem('fleet-theme', next)
      }
      set({ theme: next })
    },
    reset: () => set(initialState),
  }), { name: 'simon-v2-monitor' })
)

export const useSelectedDevice = () =>
  useAppStore(s => s.devices.find(d => d.id === s.selectedDeviceId) ?? null)
export const useIsTracking = () =>
  useAppStore(s => s.appState === 'tracking')
export const useHasError = () =>
  useAppStore(s => s.appState.startsWith('error'))
