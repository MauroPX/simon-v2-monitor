'use client'

import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { useAppStoreV2 } from '@/store/useAppStoreV2'
import { useTraccarLive } from '@/hooks/useTraccarLive'
import { DashboardLayout } from './DashboardLayout'
import { ConnectionBadge } from './ConnectionBadge'
import { StatusCardV2 } from '@/components/status/StatusCardV2'
import { RouteProgressPanel } from '@/components/route/RouteProgressPanel'
import { timeAgo } from '@/lib/utils'
import styles from './DashboardCapa2.module.css'

// MapCapa2 requires browser/Leaflet — load without SSR
const MapCapa2 = dynamic(
  () => import('@/components/map/MapCapa2').then(m => m.MapCapa2),
  {
    ssr: false,
    loading: () => (
      <div className="shimmer" style={{ width: '100%', height: '100%', minHeight: 200 }} />
    ),
  }
)

// ── Category icons ────────────────────────────────────────────

const CATEGORY_ICON: Record<string, string> = {
  truck:      'local_shipping',
  car:        'directions_car',
  motorcycle: 'two_wheeler',
  bus:        'directions_bus',
  person:     'person',
  boat:       'sailing',
}

function categoryIcon(cat?: string): string {
  return CATEGORY_ICON[cat ?? ''] ?? 'radio_button_unchecked'
}

// ── Global connecting skeleton ────────────────────────────────

const FALLBACK_SECS = 10

function GlobalConnectingState() {
  const [secs, setSecs] = useState(FALLBACK_SECS)

  useEffect(() => {
    if (secs <= 0) return
    const id = setTimeout(() => setSecs(s => s - 1), 1_000)
    return () => clearTimeout(id)
  }, [secs])

  return (
    <div className={styles.connecting} role="status" aria-label="Conectando con la flota" aria-busy="true">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className={`${styles.skeleton_item} shimmer`} aria-hidden="true" />
      ))}
      <p className={styles.connecting__label}>Conectando con la flota…</p>
      <p className={styles.connecting__sub} aria-live="polite">
        {secs > 0
          ? <></>
          : <></>}
        {secs > 0 ? `Si no hay respuesta, cargamos datos demo en ${secs}s` : 'Cargando datos de demostracion...'}
      </p>
    </div>
  )
}

// ── Error overlay ─────────────────────────────────────────────

function ErrorOverlay({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className={styles.error_state}
      role="alert"
      aria-live="assertive"
      style={{ height: '100dvh', background: 'var(--color-bg)' }}
    >
      <span
        className="material-symbols-outlined"
        aria-hidden="true"
        style={{ fontSize: 48, color: 'var(--color-danger)' }}
      >
        wifi_off
      </span>
      <p className={styles.error_state__title}>No pudimos conectar con el servidor.</p>
      <p className={styles.error_state__sub}>Verifica tu conexión e intenta de nuevo.</p>
      <button
        type="button"
        className={styles.error_state__btn}
        onClick={onRetry}
        aria-label="Reintentar conexión"
      >
        Reintentar
      </button>
    </div>
  )
}

// ── Vehicle list panel ────────────────────────────────────────

function VehicleListPanel() {
  const { devices, positions } = useTraccarLive()
  const selectedDeviceId = useAppStore(s => s.selectedDeviceId)
  const selectDevice     = useAppStore(s => s.selectDevice)

  if (devices.length === 0) {
    return (
      <div className={styles.vehicle_list} role="status">
        <div className={styles.vehicle_empty}>
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 32, opacity: 0.3 }}>
            directions_car
          </span>
          <p>Sin vehículos disponibles</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.vehicle_list} role="listbox" aria-label="Flota de vehículos">
      {devices.map(device => {
        const pos      = positions[device.id]
        const battery  = pos?.attributes?.batteryLevel
        const speed    = pos?.speed ?? 0
        const lastSeen = pos ? timeAgo(pos.serverTime) : '—'
        const isSelected = device.id === selectedDeviceId
        const isOffline  = device.status === 'offline'

        return (
          <div
            key={device.id}
            role="option"
            aria-selected={isSelected}
            tabIndex={0}
            className={[
              styles.vehicle_item,
              isSelected ? styles['vehicle_item--selected'] : '',
              isOffline  ? styles['vehicle_item--offline']  : '',
            ].filter(Boolean).join(' ')}
            onClick={() => selectDevice(isSelected ? null : device.id)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                selectDevice(isSelected ? null : device.id)
              }
            }}
            aria-label={`${device.name}, ${device.status}, ${speed.toFixed(0)} km/h`}
          >
            {/* Category icon */}
            <div className={styles.vehicle_item__icon}>
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 16 }}>
                {categoryIcon(device.category)}
              </span>
            </div>

            {/* Info rows */}
            <div className={styles.vehicle_item__info}>
              <div className={styles.vehicle_item__row}>
                <span className={styles.vehicle_item__name}>{device.name}</span>
                <span
                  className={styles.vehicle_item__status}
                  aria-hidden="true"
                  style={{ color: isOffline ? 'var(--color-offline)' : 'var(--color-online)' }}
                >
                  ●
                </span>
              </div>

              <div className={styles.vehicle_item__row}>
                <span className={styles.vehicle_item__plate}>{device.uniqueId}</span>
                <span className={styles.vehicle_item__speed}>{speed.toFixed(0)} km/h</span>
              </div>

              {battery !== undefined && (
                <div
                  className={styles.vehicle_item__battery}
                  role="progressbar"
                  aria-label={`Batería ${battery}%`}
                  aria-valuenow={battery}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={styles.vehicle_item__battery_fill}
                    style={{
                      width: `${battery}%`,
                      background: battery < 20
                        ? 'var(--color-danger)'
                        : battery < 40
                          ? 'var(--color-warning)'
                          : 'var(--color-success)',
                    }}
                  />
                </div>
              )}

              <span className={styles.vehicle_item__time}>{lastSeen}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Panel reorder controls (WCAG 2.5.7) ──────────────────────

function PanelReorderControls() {
  const { layerOrder, reorderLayer } = useAppStoreV2()
  const panels = layerOrder.filter(k => k !== 'map')

  return (
    <div className={styles.reorder} role="group" aria-label="Orden de paneles">
      {panels.map((key, i) => (
        <div key={key} className={styles.reorder__item}>
          <span className={styles.reorder__label}>
            {key === 'vehicle-list' ? 'Lista' : 'Info'}
          </span>
          <button
            type="button"
            className={styles.reorder__btn}
            onClick={() => reorderLayer(i, i - 1)}
            disabled={i === 0}
            aria-label={`Subir panel ${key === 'vehicle-list' ? 'lista' : 'información'}`}
          >↑</button>
          <button
            type="button"
            className={styles.reorder__btn}
            onClick={() => reorderLayer(i, i + 1)}
            disabled={i === panels.length - 1}
            aria-label={`Bajar panel ${key === 'vehicle-list' ? 'lista' : 'información'}`}
          >↓</button>
        </div>
      ))}
    </div>
  )
}

// ── Right panel ───────────────────────────────────────────────

function RightPanel() {
  return (
    <div className={styles.right_panel}>
      <div className={styles.right_panel__header}>
        <ConnectionBadge />
        <PanelReorderControls />
      </div>
      <div className={styles.right_panel__scroll}>
        <StatusCardV2 />
        <RouteProgressPanel />
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────

export function DashboardCapa2() {
  // Bootstraps data fetching even during connecting skeleton (children aren't mounted yet)
  useTraccarLive()

  const { connectionState, dataSource, setConnectionState } = useAppStoreV2()
  const queryClient = useQueryClient()

  const handleRetry = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['live-devices'] })
    queryClient.invalidateQueries({ queryKey: ['live-positions'] })
    setConnectionState('connecting')
  }, [queryClient, setConnectionState])

  if (connectionState === 'connecting' && dataSource !== 'demo') return <GlobalConnectingState />

  if (connectionState === 'error') return <ErrorOverlay onRetry={handleRetry} />

  return (
    <DashboardLayout
      sidebar={<VehicleListPanel />}
      map={<MapCapa2 />}
      panel={<RightPanel />}
    />
  )
}

