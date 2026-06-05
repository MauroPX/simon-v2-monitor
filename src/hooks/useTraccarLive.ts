import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useAppStoreV2 } from '@/store/useAppStoreV2'
import type { TraccarDevice, TraccarPosition } from '@/types/traccar'
import fleetData from '@/data/fleet-simulation.json'

// ── Demo data — adapted from fleet-simulation.json to TraccarPosition / TraccarDevice

type FleetEntry = (typeof fleetData)[number]

function adaptToDevice(entry: FleetEntry): TraccarDevice {
  return {
    id: entry.deviceId,
    name: entry.name,
    uniqueId: entry.plate,
    status: entry.status as TraccarDevice['status'],
    category: entry.category,
    attributes: {
      driver: entry.driver.name,
      phone: entry.driver.phone,
      battery: entry.batteryLevel,
    },
  }
}

function adaptToPosition(entry: FleetEntry): TraccarPosition {
  return {
    id: entry.deviceId * 1000,
    deviceId: entry.deviceId,
    serverTime: new Date().toISOString(),
    deviceTime: new Date().toISOString(),
    fixTime: new Date().toISOString(),
    outdated: false,
    valid: true,
    latitude: entry.lat,
    longitude: entry.lng,
    altitude: 2600,
    speed: entry.speedKmh, // km/h — proxy also converts; consistent unit for consumers
    course: entry.course,
    attributes: {
      batteryLevel: entry.batteryLevel,
      ignition: entry.ignition,
      motion: entry.speedKmh > 0,
    },
  }
}

const DEMO_DEVICES: TraccarDevice[] = fleetData.map(adaptToDevice)
const DEMO_POSITIONS: Record<number, TraccarPosition> = Object.fromEntries(
  fleetData.map(e => [e.deviceId, adaptToPosition(e)])
)

// ── Live connection helpers

async function connectToLive(): Promise<TraccarDevice[]> {
  const directRes = await fetch('/api/traccar/devices', {
    signal: AbortSignal.timeout(8_000),
  })

  if (directRes.ok) return directRes.json() as Promise<TraccarDevice[]>

  if (directRes.status === 401) {
    const sessionRes = await fetch('/api/traccar/session', {
      method: 'POST',
      signal: AbortSignal.timeout(8_000),
    })
    if (!sessionRes.ok) throw new Error('auto-login-failed')

    const retryRes = await fetch('/api/traccar/devices', {
      signal: AbortSignal.timeout(8_000),
    })
    if (!retryRes.ok) throw new Error('devices-failed-after-login')
    return retryRes.json() as Promise<TraccarDevice[]>
  }

  throw new Error(`devices-failed:${directRes.status}`)
}

async function fetchLivePositions(): Promise<Record<number, TraccarPosition>> {
  const res = await fetch('/api/traccar/positions', {
    signal: AbortSignal.timeout(8_000),
  })
  if (!res.ok) throw new Error(`positions-failed:${res.status}`)

  const list = (await res.json()) as TraccarPosition[]
  return Object.fromEntries(list.map(p => [p.deviceId, p]))
}

// ── Hook

export function useTraccarLive() {
  const { connectionState, dataSource, setConnectionState, setDataSource } = useAppStoreV2()
  const lastSuccessRef = useRef<number>(Date.now())

  const devicesQuery = useQuery<TraccarDevice[], Error>({
    queryKey: ['live-devices'],
    queryFn: connectToLive,
    retry: 1,
    retryDelay: 2_000,
    staleTime: 30_000,
  })

  const positionsQuery = useQuery<Record<number, TraccarPosition>, Error>({
    queryKey: ['live-positions'],
    queryFn: fetchLivePositions,
    enabled: dataSource === 'live',
    refetchInterval: 5_000,
    refetchIntervalInBackground: false,
    placeholderData: prev => prev,
    retry: 2,
    retryDelay: attempt => Math.min(1_000 * 2 ** attempt, 8_000),
  })

  // Sync connection state from devices query
  useEffect(() => {
    if (devicesQuery.isLoading) {
      setConnectionState('connecting')
    } else if (devicesQuery.isSuccess) {
      setConnectionState('live')
      setDataSource('live')
      lastSuccessRef.current = Date.now()
    } else if (devicesQuery.isError) {
      setConnectionState('demo')
      setDataSource('demo')
    }
  }, [devicesQuery.isLoading, devicesQuery.isSuccess, devicesQuery.isError, setConnectionState, setDataSource])

  // Track last successful position update and recover from stale
  useEffect(() => {
    if (positionsQuery.dataUpdatedAt === 0) return
    lastSuccessRef.current = positionsQuery.dataUpdatedAt
    if (connectionState === 'stale') setConnectionState('live')
  }, [positionsQuery.dataUpdatedAt, connectionState, setConnectionState])

  // Stale detection: no update in +30s while live
  useEffect(() => {
    if (dataSource !== 'live') return
    const id = setInterval(() => {
      if (Date.now() - lastSuccessRef.current > 30_000) {
        setConnectionState('stale')
      }
    }, 5_000)
    return () => clearInterval(id)
  }, [dataSource, setConnectionState])

  const isDemo = dataSource === 'demo'

  return {
    devices: isDemo ? DEMO_DEVICES : (devicesQuery.data ?? []),
    positions: isDemo ? DEMO_POSITIONS : (positionsQuery.data ?? {}),
    dataSource,
    connectionState,
  }
}
