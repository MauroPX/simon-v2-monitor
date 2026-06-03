// src/hooks/useTraccar.ts
// Hooks de datos: dispositivos y posición en tiempo real
// ADR-008 — Polling 5s con requestAnimationFrame para marker smoothing
// Fallback a MOCK_FLEET cuando NEXT_PUBLIC_USE_MOCK=true

import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { traccarUrl } from '@/lib/utils'
import type { TraccarDevice, TraccarPosition } from '@/types/traccar'

// ── Datos mock — activados con NEXT_PUBLIC_USE_MOCK=true
// Usados cuando demo4.traccar.org no responde
const MOCK_FLEET: TraccarDevice[] = [
  {
    id: 101, name: 'Alpha-01', uniqueId: 'TRK-001',
    status: 'online', category: 'truck',
    attributes: { driver: 'Carlos Mendoza', fuel: 78, battery: 95 },
  },
  {
    id: 102, name: 'Sedán Ejec-05', uniqueId: 'CAR-005',
    status: 'online', category: 'car',
    attributes: { driver: 'Ana Rodríguez', fuel: 45, battery: 88 },
  },
  {
    id: 103, name: 'Moto Sur-12', uniqueId: 'MOTO-012',
    status: 'offline', category: 'motorcycle',
    attributes: { driver: 'Luis García', fuel: 20, battery: 15 },
  },
  {
    id: 104, name: 'Bus Ruta-7', uniqueId: 'BUS-007',
    status: 'online', category: 'bus',
    attributes: { driver: 'María Torres', fuel: 60, battery: 92 },
  },
]

// Posiciones mock con movimiento simulado
function getMockPosition(deviceId: number): TraccarPosition {
  const base = { 101: [19.4326, -99.1332], 102: [19.4280, -99.1450], 103: [19.4400, -99.1200], 104: [19.4350, -99.1380] }
  const [lat, lng] = base[deviceId as keyof typeof base] ?? [19.43, -99.13]
  const jitter = () => (Math.random() - 0.5) * 0.002
  return {
    id: Math.random(),
    deviceId,
    serverTime: new Date().toISOString(),
    deviceTime: new Date().toISOString(),
    fixTime: new Date().toISOString(),
    outdated: false,
    valid: true,
    latitude: lat + jitter(),
    longitude: lng + jitter(),
    altitude: 2240,
    speed: Math.random() * 60,      // nudos
    course: Math.random() * 360,
    attributes: {
      batteryLevel: deviceId === 103 ? 15 : Math.floor(70 + Math.random() * 30),
      ignition: deviceId !== 103,
      motion: deviceId !== 103,
    },
  }
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

// ============================================================
// useDevices — obtiene la lista de dispositivos
// ============================================================
export function useDevices() {
  const { isAuthenticated, setDevices, setAppState } = useAppStore()

  const query = useQuery<TraccarDevice[], Error>({
    queryKey: ['devices'],
    enabled: isAuthenticated || USE_MOCK,

    queryFn: async () => {
      if (USE_MOCK) return MOCK_FLEET

      const res = await fetch(traccarUrl('/api/devices'), {
        credentials: 'include',
      })

      if (res.status === 401) {
        setAppState('error-auth', 'Sesión expirada. Inicia sesión de nuevo.')
        throw new Error('Sesión expirada')
      }

      if (!res.ok) {
        throw new Error('No pudimos cargar los vehículos. Verifica tu conexión.')
      }

      return res.json() as Promise<TraccarDevice[]>
    },

    retry: 2,
    retryDelay: 3000,
    staleTime: 30_000, // 30s — la lista de dispositivos no cambia frecuentemente
  })

  // Sincronizar con el store cuando llegan datos
  useEffect(() => {
    if (query.data) {
      setDevices(query.data)
      setAppState('idle')
    }
  }, [query.data, setDevices, setAppState])

  useEffect(() => {
    if (query.error) {
      setAppState('error-devices', query.error.message)
    }
  }, [query.error, setAppState])

  return query
}

// ============================================================
// useTraccarPosition — polling de posición con marker smoothing
// ADR-008 — Polling 5s + requestAnimationFrame para interpolación
// ============================================================
export function useTraccarPosition() {
  const { selectedDeviceId, updatePosition, setAppState, appState } = useAppStore()
  const animFrameRef = useRef<number | null>(null)

  const query = useQuery<TraccarPosition, Error>({
    queryKey: ['position', selectedDeviceId],
    enabled: selectedDeviceId !== null && (appState === 'tracking' || USE_MOCK),

    queryFn: async () => {
      if (USE_MOCK && selectedDeviceId) {
        return getMockPosition(selectedDeviceId)
      }

      if (!selectedDeviceId) throw new Error('No hay vehículo seleccionado')

      const res = await fetch(
        traccarUrl('/api/positions', { deviceId: selectedDeviceId, limit: 1 }),
        { credentials: 'include' }
      )

      if (!res.ok) {
        throw new Error('No pudimos obtener la posición. Mostrando última ubicación conocida.')
      }

      const positions: TraccarPosition[] = await res.json()
      if (!positions.length) throw new Error('Sin datos de posición para este vehículo.')

      return positions[0]
    },

    // ── Polling cada 5 segundos
    refetchInterval: 5_000,
    refetchIntervalInBackground: false,

    // ── En caso de error: mantener el último dato conocido
    placeholderData: (prev) => prev,

    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  })

  // Sincronizar posición con el store y animar el marcador
  useEffect(() => {
    if (query.data) {
      setAppState('tracking')
      updatePosition(query.data)
    }
  }, [query.data, updatePosition, setAppState])

  // Error en polling → mostrar última posición conocida en gris
  useEffect(() => {
    if (query.error && !query.data) {
      setAppState('error-tracking', query.error.message)
    }
  }, [query.error, query.data, setAppState])

  // Limpiar animaciones al desmontar
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  return {
    position: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error?.message ?? null,
    // La posición "stale" existe si hay error pero había datos previos
    isStale: query.isError && query.data !== undefined,
    lastSuccessTime: query.dataUpdatedAt,
  }
}
