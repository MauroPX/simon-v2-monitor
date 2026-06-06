'use client'

import { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useAppStoreV2 } from '@/store/useAppStoreV2'
import { useTraccarLive } from '@/hooks/useTraccarLive'
import { timeAgo } from '@/lib/utils'
import fleetData from '@/data/fleet-simulation.json'
import styles from './StatusCardV2.module.css'

function formatEta(isoString: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Bogota',
  }).format(new Date(isoString))
}

export function StatusCardV2() {
  const selectedDeviceId = useAppStore(s => s.selectedDeviceId)
  const { devices, positions } = useTraccarLive()
  const { connectionState }    = useAppStoreV2()

  const device = useMemo(
    () => selectedDeviceId !== null ? (devices.find(d => d.id === selectedDeviceId) ?? null) : null,
    [selectedDeviceId, devices],
  )

  const position = selectedDeviceId !== null ? (positions[selectedDeviceId] ?? null) : null

  const fleetEntry = useMemo(
    () => selectedDeviceId !== null ? (fleetData.find(e => e.deviceId === selectedDeviceId) ?? null) : null,
    [selectedDeviceId],
  )

  if (!device || !position) {
    return (
      <div className={styles.card}>
        <div className={styles.empty}>
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '2rem', opacity: 0.3 }}>
            directions_car
          </span>
          <p className={styles.empty__text}>Selecciona un vehículo</p>
        </div>
      </div>
    )
  }

  const isStale = connectionState === 'stale'

  // Telemetry values
  const speedKmh = position.speed
  const battery  = position.attributes?.batteryLevel
  const ignition = position.attributes?.ignition
  const rpm      = position.attributes?.rpm
  const satRaw   = position.attributes?.['sat']
  const sat      = typeof satRaw === 'number' ? satRaw : null

  // Driver: fleet entry (demo) → device attributes (live)
  const driverName =
    fleetEntry?.driver.name ??
    (typeof device.attributes?.driver === 'string' ? device.attributes.driver : null) ??
    '—'

  // Address: from Traccar API → fallback to coordinates
  const address = position.address ?? `${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}`

  return (
    <section
      className={`${styles.card}${isStale ? ` ${styles['card--stale']}` : ''}`}
      aria-label={`Telemetría de ${device.name}`}
    >
      {/* Vehicle header — plate + status + route + ETA */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 1, color: 'var(--color-text, #fff)' }}>
            {device.uniqueId}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4,
            background: device.status === 'offline' ? 'rgba(226,75,74,0.15)' : 'rgba(0,200,83,0.15)',
            color: device.status === 'offline' ? '#E24B4A' : '#00C853',
          }}>
            {device.status === 'offline' ? 'Offline' : 'En línea'}
          </span>
        </div>
        {fleetEntry && (
          <>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '4px 0 2px' }}>
              {fleetEntry.origin.label} → {fleetEntry.destination.label}
            </p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
              ETA {formatEta(fleetEntry.destination.eta)}
            </p>
          </>
        )}
      </div>

      <dl className={styles.grid}>

        <div className={styles.item}>
          <dt className={styles.label}>Vehículo</dt>
          <dd className={styles.value}>{device.name}</dd>
        </div>

        <div className={styles.item}>
          <dt className={styles.label}>Estado</dt>
          <dd key={device.status} className={styles.value} aria-live="polite">
            <span
              aria-hidden="true"
              style={{ color: device.status === 'offline' ? 'var(--color-offline)' : 'var(--color-online)' }}
            >● </span>
            {device.status === 'offline' ? 'Offline' : 'Online'}
          </dd>
        </div>

        <div className={styles.item}>
          <dt className={styles.label}>Velocidad</dt>
          <dd key={speedKmh.toFixed(0)} className={styles.value} aria-live="polite">
            {speedKmh.toFixed(0)} <span className={styles.unit}>km/h</span>
          </dd>
        </div>

        {battery !== undefined && (
          <div className={styles.item}>
            <dt className={styles.label}>Batería</dt>
            <dd key={battery} className={styles.value} aria-live="polite">
              {battery}%
            </dd>
          </div>
        )}

        <div className={styles.item}>
          <dt className={styles.label}>Conductor</dt>
          <dd className={styles.value}>{driverName}</dd>
        </div>

        <div className={styles.item}>
          <dt className={styles.label}>Dirección</dt>
          <dd
            key={address}
            className={`${styles.value} ${styles.value__address}`}
            aria-live="polite"
          >
            {address}
          </dd>
        </div>

        {ignition !== undefined && (
          <div className={styles.item}>
            <dt className={styles.label}>Ignición</dt>
            <dd key={String(ignition)} className={styles.value}>
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
                style={{ fontSize: 14, verticalAlign: 'middle', color: ignition ? 'var(--color-online)' : 'var(--color-offline)' }}
              >
                {ignition ? 'key' : 'key_off'}
              </span>
              {' '}{ignition ? 'Encendida' : 'Apagada'}
            </dd>
          </div>
        )}

        {rpm !== undefined && (
          <div className={styles.item}>
            <dt className={styles.label}>RPM</dt>
            <dd key={rpm} className={styles.value} aria-live="polite">
              {rpm.toLocaleString('es-CO')} <span className={styles.unit}>rpm</span>
            </dd>
          </div>
        )}

        {sat !== null && (
          <div className={styles.item}>
            <dt className={styles.label}>Satélites</dt>
            <dd key={sat} className={styles.value} aria-live="polite">{sat}</dd>
          </div>
        )}

        <div className={styles.item}>
          <dt className={styles.label}>Actualizado</dt>
          <dd key={position.serverTime} className={styles.value} aria-live="polite">
            {timeAgo(position.serverTime)}
          </dd>
        </div>

      </dl>
    </section>
  )
}
