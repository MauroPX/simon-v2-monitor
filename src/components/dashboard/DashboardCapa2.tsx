'use client'

import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { useAppStoreV2 } from '@/store/useAppStoreV2'
import { useTraccarLive } from '@/hooks/useTraccarLive'
import { DashboardLayout } from './DashboardLayout'
import { SpeedAlert } from '@/components/ui/SpeedAlert'
import { ConnectionBadge } from './ConnectionBadge'
import { StatusCardV2 } from '@/components/status/StatusCardV2'
import { RouteProgressPanel } from '@/components/route/RouteProgressPanel'
import { AppHeader } from '@/components/ui/AppHeader'
import { timeAgo } from '@/lib/utils'
import { sortDevicesByPriority, type VehiclePriority } from '@/lib/vehiclePriority'
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
          ? `Si no hay respuesta, cargamos datos demo en ${secs}s`
          : 'Cargando datos de demostración...'}
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

function GroupLabel({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div style={{
      padding: '4px 12px',
      fontSize: 10, fontWeight: 700,
      letterSpacing: '0.08em',
      color,
      borderBottom: '1px solid var(--color-border)',
      background: 'var(--color-surface-2)',
      display: 'flex', justifyContent: 'space-between',
    }}>
      <span>{label}</span>
      <span style={{ opacity: 0.7 }}>{count}</span>
    </div>
  )
}

function VehicleListPanel({ onSelect }: { onSelect?: (id: number) => void }) {
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

  const sorted   = sortDevicesByPriority(devices, positions)
  const critical = sorted.filter(d => d.priority.level === 'critical')
  const warning  = sorted.filter(d => d.priority.level === 'warning')
  const active   = sorted.filter(d => d.priority.level === 'active')
  const offline  = sorted.filter(d => d.priority.level === 'offline')

  const renderItem = (device: (typeof sorted)[number]) => {
    const pos        = positions[device.id]
    const battery    = pos?.attributes?.batteryLevel
    const speed      = pos?.speed ?? 0
    const lastSeen   = pos ? timeAgo(pos.serverTime) : '—'
    const isSelected = device.id === selectedDeviceId
    const isOffline  = device.status === 'offline'
    const priority: VehiclePriority = device.priority

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
        onClick={() => {
          selectDevice(isSelected ? null : device.id)
          if (!isSelected) onSelect?.(device.id)
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            selectDevice(isSelected ? null : device.id)
            if (!isSelected) onSelect?.(device.id)
          }
        }}
        aria-label={`${device.name}, ${device.status}, ${speed.toFixed(0)} km/h`}
      >
        <div className={styles.vehicle_item__icon}>
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 16 }}>
            {categoryIcon(device.category)}
          </span>
        </div>

        <div className={styles.vehicle_item__info}>
          <div className={styles.vehicle_item__row}>
            <span className={styles.vehicle_item__name}>{device.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              {priority.badge && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  color: priority.badgeColor,
                  border: `1px solid ${priority.badgeColor}`,
                  borderRadius: 4,
                  padding: '1px 5px',
                  flexShrink: 0,
                  opacity: 0.9,
                }}>
                  {priority.badge}
                </span>
              )}
              <span
                className={styles.vehicle_item__status}
                aria-hidden="true"
                style={{ color: isOffline ? 'var(--color-offline)' : 'var(--color-online)' }}
              >
                ●
              </span>
            </div>
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
  }

  return (
    <div className={styles.vehicle_list} role="listbox" aria-label="Flota de vehículos">
      {critical.length > 0 && (
        <>
          <GroupLabel label="ATENCIÓN" count={critical.length} color="var(--color-danger)" />
          {critical.map(renderItem)}
        </>
      )}
      {warning.length > 0 && (
        <>
          <GroupLabel label="ALERTA" count={warning.length} color="var(--color-warning)" />
          {warning.map(renderItem)}
        </>
      )}
      {active.length > 0 && (
        <>
          <GroupLabel label="EN RUTA" count={active.length} color="var(--color-primary)" />
          {active.map(renderItem)}
        </>
      )}
      {offline.length > 0 && (
        <>
          <GroupLabel label="OFFLINE" count={offline.length} color="var(--color-text-muted)" />
          {offline.map(renderItem)}
        </>
      )}
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
  const { devices, positions } = useTraccarLive()

  const { connectionState, dataSource, setConnectionState } = useAppStoreV2()
  const queryClient = useQueryClient()

  const selectDevice     = useAppStore(s => s.selectDevice)
  const selectedDeviceId = useAppStore(s => s.selectedDeviceId)

  const [mobileView, setMobileView] = useState<'list' | 'map' | 'detail'>('map')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 767)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Auto-select first online device
  useEffect(() => {
    if (selectedDeviceId || devices.length === 0) return
    const first = devices.find(d => d.status === 'online') ?? devices[0]
    if (first) selectDevice(first.id)
  }, [devices])

  const handleRetry = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['live-devices'] })
    queryClient.invalidateQueries({ queryKey: ['live-positions'] })
    setConnectionState('connecting')
  }, [queryClient, setConnectionState])

  const handleSelectFromList = useCallback((deviceId: number) => {
    selectDevice(deviceId)
    if (isMobile) setMobileView('map')
  }, [isMobile, selectDevice])

  const selectedDevice = devices.find(d => d.id === selectedDeviceId) ?? null

  if (connectionState === 'connecting' && dataSource !== 'demo') return <GlobalConnectingState />
  if (connectionState === 'error') return <ErrorOverlay onRetry={handleRetry} />

  // ── Mobile layout — 3 vistas con bottom nav ──
  if (isMobile) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        height: '100dvh', overflow: 'hidden',
        background: 'var(--color-bg)',
        position: 'relative',
      }}>
        <AppHeader onMenuClick={() => {}} />

        {/* Chip de vehículo activo — solo visible en vista mapa */}
        {mobileView === 'map' && selectedDevice && (
          <button
            onClick={() => setMobileView('detail')}
            aria-label={`Ver detalle de ${selectedDevice.name}`}
            style={{
              position: 'absolute',
              top: 56, left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 500,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 20,
              padding: '6px 16px',
              color: 'var(--color-text)',
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              minHeight: 44, whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--color-primary)',
              flexShrink: 0,
            }} />
            {selectedDevice.name} · {selectedDevice.uniqueId}
            <span style={{ color: 'var(--color-primary)', fontSize: 12 }}>Info →</span>
          </button>
        )}

        {/* Contenido de la vista activa */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', minHeight: 0 }}>

          {/* VISTA LISTA */}
          {mobileView === 'list' && (
            <div style={{ height: '100%', overflowY: 'auto', paddingBottom: 64 }}>
              <VehicleListPanel onSelect={handleSelectFromList} />
            </div>
          )}

          {/* VISTA MAPA */}
          {mobileView === 'map' && (
            <div style={{ height: '100%' }}>
              <MapCapa2 />
            </div>
          )}

          {/* VISTA DETALLE */}
          {mobileView === 'detail' && (
            <div style={{ height: '100%', overflowY: 'auto', paddingBottom: 64 }}>
              <button
                onClick={() => setMobileView('map')}
                aria-label="Volver al mapa"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 16px',
                  background: 'none', border: 'none',
                  color: 'var(--color-primary)',
                  fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', minHeight: 44,
                  width: '100%',
                }}
              >
                ← Volver al mapa
              </button>
              {selectedDevice
                ? <><StatusCardV2 /><RouteProgressPanel /></>
                : (
                  <div style={{
                    padding: 32, textAlign: 'center',
                    color: 'var(--color-text-muted)', fontSize: 14,
                  }}>
                    Selecciona un vehículo en la lista para ver su detalle
                  </div>
                )
              }
            </div>
          )}
        </div>

        {/* Bottom navigation */}
        <nav
          role="tablist"
          aria-label="Vistas del dashboard"
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            height: 56,
            display: 'flex',
            background: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
            zIndex: 200,
          }}
        >
          {([
            { view: 'list'   as const, label: 'Lista',   icon: '≡' },
            { view: 'map'    as const, label: 'Mapa',    icon: '◎' },
            { view: 'detail' as const, label: 'Detalle', icon: '▤' },
          ]).map(({ view, label, icon }) => (
            <button
              key={view}
              role="tab"
              aria-selected={mobileView === view}
              aria-label={label}
              onClick={() => setMobileView(view)}
              style={{
                flex: 1, border: 'none',
                background: 'none',
                color: mobileView === view
                  ? 'var(--color-primary)'
                  : 'var(--color-text-muted)',
                fontSize: 11,
                fontWeight: mobileView === view ? 700 : 400,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 3, minHeight: 44, cursor: 'pointer',
                borderTop: mobileView === view
                  ? '2px solid var(--color-primary)'
                  : '2px solid transparent',
                transition: 'color 200ms, border-top-color 200ms',
              }}
            >
              <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {/* SpeedAlert encima del bottom nav */}
        <SpeedAlert devices={devices} positions={positions} isMobile={isMobile} />
      </div>
    )
  }

  // ── Desktop layout ──
  return (
    <>
      <SpeedAlert devices={devices} positions={positions} />
      <DashboardLayout
        sidebar={<VehicleListPanel />}
        map={<MapCapa2 />}
        panel={<RightPanel />}
      />
    </>
  )
}
