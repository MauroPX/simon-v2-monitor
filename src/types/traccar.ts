// src/types/traccar.ts
// Interfaces TypeScript para la API de Traccar
// Fuente: https://www.traccar.org/api-reference/
// ADR-001 — tipado estricto, zero any

export interface TraccarSession {
  id: number
  name: string
  email: string
  phone?: string
  readonly: boolean
  administrator: boolean
  map?: string
  latitude: number
  longitude: number
  zoom: number
  token?: string
}

export interface TraccarDevice {
  id: number
  name: string
  uniqueId: string
  status: 'online' | 'offline' | 'unknown'
  disabled?: boolean
  lastUpdate?: string
  positionId?: number
  groupId?: number
  phone?: string
  model?: string
  contact?: string
  category?: string // truck | car | motorcycle | bus | person | boat
  attributes?: Record<string, unknown>
}

export interface TraccarPosition {
  id: number
  deviceId: number
  protocol?: string
  serverTime: string
  deviceTime: string
  fixTime: string
  outdated: boolean
  valid: boolean
  latitude: number
  longitude: number
  altitude: number
  speed: number        // en nudos — convertir a km/h multiplicando por 1.852
  course: number       // 0-360 grados, 0=Norte
  address?: string
  accuracy?: number
  network?: unknown
  attributes?: {
    batteryLevel?: number  // 0-100
    battery?: number
    fuel?: number
    odometer?: number
    rpm?: number
    temperature?: number
    ignition?: boolean
    motion?: boolean
    [key: string]: unknown
  }
}

// Tipos derivados para la UI
export interface VehicleStatus {
  device: TraccarDevice
  position: TraccarPosition | null
  speedKmh: number
  isOnline: boolean
  lastUpdateText: string
  batteryLevel: number | null
  heading: string
}

// Estados de la aplicación
export type AppState = 'idle' | 'authenticating' | 'loading-devices' | 'tracking' | 'error-auth' | 'error-devices' | 'error-tracking'

export interface TraccarError {
  message: string
  code?: number
  retryable: boolean
}
