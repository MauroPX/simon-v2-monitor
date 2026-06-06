import type { TraccarDevice, TraccarPosition } from '@/types/traccar'

export type PriorityLevel = 'critical' | 'warning' | 'active' | 'offline'

export interface VehiclePriority {
  deviceId: number
  level: PriorityLevel
  score: number        // mayor score = más arriba
  badge: string | null // texto del badge: "92 km/h" | "Bat 8%" | "Encendido" | null
  badgeColor: string   // var(--color-danger) | var(--color-warning) | var(--color-primary)
}

export function getVehiclePriority(
  device: TraccarDevice,
  position?: TraccarPosition,
): VehiclePriority {
  // speed: simulation stores km/h directly in position.speed (matches VehicleListPanel behavior)
  const speedKmh = position ? Math.round(position.speed || 0) : 0

  // battery: position.attributes.batteryLevel is the canonical source in simulation;
  // device.attributes.battery is the fallback (different key used by adaptToDevice)
  const battery = (
    position?.attributes?.batteryLevel ??
    (device.attributes?.battery as number | undefined)
  ) ?? 100

  // ignition: position.attributes.ignition is the canonical source
  const ignition = (
    position?.attributes?.ignition ??
    (device.attributes?.ignition as boolean | undefined)
  ) ?? false

  const lastUpdateStr = position?.fixTime || position?.deviceTime
  const msSinceUpdate = lastUpdateStr
    ? Date.now() - new Date(lastUpdateStr).getTime()
    : Infinity

  const recentlyStarted = false // solo activo con Traccar real; demo timestamps son pasado fijo

  // CRITICAL: velocidad excesiva
  if (speedKmh > 80) return {
    deviceId: device.id,
    level: 'critical',
    score: 1000 + speedKmh,
    badge: `${speedKmh} km/h`,
    badgeColor: 'var(--color-danger)',
  }

  // WARNING: batería crítica (solo vehículos online)
  if (battery < 20 && device.status !== 'offline') return {
    deviceId: device.id,
    level: 'warning',
    score: 500 + (20 - battery),
    badge: `Bat ${battery}%`,
    badgeColor: 'var(--color-warning)',
  }

  // ACTIVE: recién encendido
  if (recentlyStarted) return {
    deviceId: device.id,
    level: 'active',
    score: 200,
    badge: 'Encendido',
    badgeColor: 'var(--color-primary)',
  }

  // ONLINE normal
  if (device.status === 'online') return {
    deviceId: device.id,
    level: 'active',
    score: 100,
    badge: null,
    badgeColor: '',
  }

  // OFFLINE — al fondo
  return {
    deviceId: device.id,
    level: 'offline',
    score: 0,
    badge: null,
    badgeColor: '',
  }
}

export function sortDevicesByPriority(
  devices: TraccarDevice[],
  positions: Record<number, TraccarPosition>,
): Array<TraccarDevice & { priority: VehiclePriority }> {
  return devices
    .map(d => ({ ...d, priority: getVehiclePriority(d, positions[d.id]) }))
    .sort((a, b) => b.priority.score - a.priority.score)
}
