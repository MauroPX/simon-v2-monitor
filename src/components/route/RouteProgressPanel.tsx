'use client'

import { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useAppStoreV2 } from '@/store/useAppStoreV2'
import { timeAgo } from '@/lib/utils'
import fleetData from '@/data/fleet-simulation.json'
import styles from './RouteProgressPanel.module.css'

type FleetEntry = (typeof fleetData)[number]

// ── Pure utilities ─────────────────────────────────────────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R  = 6371
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180
  const a  = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function computeRoute(entry: FleetEntry) {
  const points = [entry.origin, ...entry.waypoints, entry.destination]

  const segKm: number[] = []
  for (let i = 0; i < points.length - 1; i++) {
    segKm.push(haversineKm(
      points[i].lat, points[i].lng,
      points[i + 1].lat, points[i + 1].lng,
    ))
  }

  const totalHaversine = segKm.reduce((s, k) => s + k, 0)
  const scale = totalHaversine > 0 ? entry.totalRouteKm / totalHaversine : 1

  let acc = 0
  const cumKm = [0, ...segKm.map(k => { acc += k * scale; return acc })]

  // Waypoint positions as % of totalRouteKm — excludes origin (0%) and destination (100%)
  const tickPcts = cumKm.slice(1, -1).map(km => (km / entry.totalRouteKm) * 100)

  return { segKm: segKm.map(k => parseFloat((k * scale).toFixed(1))), cumKm, tickPcts }
}

function formatEta(isoString: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Bogota',
  }).format(new Date(isoString))
}

function etaCountdown(isoString: string): string {
  const diffMin = Math.round((new Date(isoString).getTime() - Date.now()) / 60_000)
  if (diffMin < 0)  return 'Retrasado'
  if (diffMin < 60) return `En ${diffMin} min`
  const h = Math.floor(diffMin / 60)
  const m = diffMin % 60
  return `En ${h}h${m > 0 ? ` ${m}min` : ''}`
}

// ── Component ──────────────────────────────────────────────────

export function RouteProgressPanel() {
  const selectedDeviceId = useAppStore(s => s.selectedDeviceId)
  const currentPosition  = useAppStore(s => s.currentPosition)
  const { connectionState } = useAppStoreV2()

  const entry = useMemo(() => {
    if (selectedDeviceId === null) return null
    return fleetData.find(d => d.deviceId === selectedDeviceId) ?? null
  }, [selectedDeviceId])

  const route = useMemo(() => (entry ? computeRoute(entry) : null), [entry])

  // ── Empty state ────────────────────────────────────────────

  if (!entry || !route) {
    return (
      <div className={styles.panel} role="region" aria-label="Panel de ruta">
        <div className={styles.empty}>
          <span className={styles.empty__icon} aria-hidden="true">
            <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>route</span>
          </span>
          <p className={styles.empty__title}>Sin ruta asignada</p>
          <p className={styles.empty__sub}>
            Selecciona un vehículo para ver su recorrido
          </p>
        </div>
      </div>
    )
  }

  // ── Data ────────────────────────────────────────────────────

  const isStale     = connectionState === 'stale'
  const filledPct   = Math.min(100, (entry.currentKm / entry.totalRouteKm) * 100)
  const remainingKm = Math.max(0, entry.totalRouteKm - entry.currentKm)

  return (
    <article
      className={`${styles.panel}${isStale ? ` ${styles['panel--stale']}` : ''}`}
      role="region"
      aria-label={`Ruta de ${entry.name}`}
    >
      {/* Stale badge */}
      {isStale && (
        <div className={styles.stale_badge} role="alert" aria-live="polite">
          <span aria-hidden="true">◌</span>
          <span>
            Última posición conocida
            {currentPosition !== null && ` · ${timeAgo(currentPosition.serverTime)}`}
          </span>
        </div>
      )}

      {/* Header: vehicle → origin → destination + ETA */}
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>{entry.name}</h2>
          <p className={styles.subtitle}>
            {entry.origin.label} → {entry.destination.label}
          </p>
        </div>
        <div
          className={styles.eta}
          aria-label={`Llegada estimada a las ${formatEta(entry.destination.eta)}`}
        >
          <span className={styles.eta__label} aria-hidden="true">ETA</span>
          <span className={styles.eta__time}>{formatEta(entry.destination.eta)}</span>
          <span className={styles.eta__countdown}>{etaCountdown(entry.destination.eta)}</span>
        </div>
      </header>

      {/* Progress bar — 3 segmentos: cumplido · actual · faltante */}
      <div className={styles.progress_wrap}>
        <div
          className={styles.track}
          role="progressbar"
          aria-label={`Recorrido: ${entry.currentKm.toFixed(1)} de ${entry.totalRouteKm} km`}
          aria-valuenow={Math.round(filledPct)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {/* Cumplido — verde */}
          <div className={styles.track__done} style={{ width: `${filledPct}%` }} />
          {/* Faltante — gris */}
          <div className={styles.track__remaining} />

          {/* Waypoint ticks — posicionados con Haversine */}
          {route.tickPcts.map((pct, i) => (
            <span
              key={i}
              className={styles.tick}
              style={{ left: `${pct}%` }}
              aria-hidden="true"
            />
          ))}

          {/* Actual — pulse dot en posición actual */}
          <span
            className={styles.track__dot}
            style={{ left: `${filledPct}%` }}
            aria-hidden="true"
          />
        </div>

        <div className={styles.km_row}>
          <span className={styles.km_done}>
            {entry.currentKm.toFixed(1)} km recorridos
          </span>
          <span className={styles.km_remaining}>
            {remainingKm.toFixed(1)} km restantes
          </span>
        </div>
      </div>

      {/* Driver */}
      <div
        className={styles.driver}
        aria-label={`Conductor: ${entry.driver.name}`}
      >
        <span
          className="material-symbols-outlined"
          aria-hidden="true"
          style={{ fontSize: 16 }}
        >
          person
        </span>
        <span className={styles.driver__name}>{entry.driver.name}</span>
        <span className={styles.driver__phone}>{entry.driver.phone}</span>
      </div>
    </article>
  )
}
