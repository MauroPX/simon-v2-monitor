'use client'
// src/components/ui/DeviceSelector.tsx
// Lista de vehículos accesible — role=listbox, aria-selected, keyboard nav
// WCAG 2.1.1 Teclado · 2.4.7 Foco visible · 1.3.1 Info y relaciones

import { useRef, useState, KeyboardEvent } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useDevices } from '@/hooks/useTraccar'
import type { TraccarDevice } from '@/types/traccar'
import { cn } from '@/lib/utils'

const CATEGORY_EMOJIS: Record<string, string> = {
  truck: '🚛', car: '🚗', motorcycle: '🏍️', bus: '🚌', person: '🚶', boat: '⛵', default: '🚙',
}
const CATEGORY_COLORS: Record<string, string> = {
  truck: '#ef4444', car: '#3b82f6', motorcycle: '#f59e0b', bus: '#10b981', person: '#ec4899', boat: '#06b6d4', default: '#6366f1',
}

function DeviceItem({ device, isSelected, onClick }: { device: TraccarDevice; isSelected: boolean; onClick: () => void }) {
  const emoji = CATEGORY_EMOJIS[device.category ?? 'default'] ?? CATEGORY_EMOJIS.default
  const color = CATEGORY_COLORS[device.category ?? 'default'] ?? CATEGORY_COLORS.default
  const isOnline = device.status === 'online'

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() }
  }

  return (
    <li
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKey}
      className={cn('device-item', isSelected && 'selected')}
      aria-label={`${device.name}, ${isOnline ? 'en línea' : 'desconectado'}`}
      data-atomic="molecule"
      data-component="DeviceItem"
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px',
        borderRadius: 'var(--md-sys-shape-corner-medium)',
        cursor: 'pointer',
        border: `1px solid ${isSelected ? 'var(--color-accent)' : 'transparent'}`,
        background: isSelected ? 'var(--color-accent-dim)' : 'transparent',
        transition: 'background 0.15s ease, border-color 0.15s ease',
        marginBottom: 2,
        outline: 'none', // :focus-visible lo maneja globals.css
      }}
    >
      {/* Ícono de categoría */}
      <div
        aria-hidden="true"
        style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${color}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, flexShrink: 0,
        }}
      >
        {emoji}
      </div>

      {/* Info del vehículo */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {device.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
          {device.category ?? 'Vehículo'} · {String(device.attributes?.driver ?? 'Sin conductor')}
        </div>
      </div>

      {/* Badge de estado */}
      <span
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          padding: '2px 7px',
          borderRadius: 'var(--md-sys-shape-corner-full)',
          fontSize: 10, fontWeight: 500,
          background: isOnline ? 'var(--color-online-dim)' : 'rgba(100,116,139,0.15)',
          color: isOnline ? 'var(--color-online)' : 'var(--color-offline)',
          flexShrink: 0,
        }}
      >
        {isOnline ? '● En línea' : '○ Offline'}
      </span>
    </li>
  )
}

export function DeviceSelector() {
  const { selectedDeviceId, selectDevice } = useAppStore()
  const { data: devices, isLoading, isError, error, refetch } = useDevices()
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = (devices ?? []).filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.category ?? '').toLowerCase().includes(search.toLowerCase())
  )

  // Loading skeleton
  if (isLoading) {
    return (
      <nav className="sidebar" aria-label="Lista de vehículos" aria-busy="true">
        <div style={{ padding: '12px 14px 8px' }}>
          <div className="shimmer" style={{ height: 10, width: '60%', borderRadius: 4, marginBottom: 10 }} />
          <div className="shimmer" style={{ height: 32, borderRadius: 8 }} />
        </div>
        <div style={{ padding: 8 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', marginBottom: 2 }}>
              <div className="shimmer" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="shimmer" style={{ height: 13, width: '70%', borderRadius: 4, marginBottom: 6 }} />
                <div className="shimmer" style={{ height: 10, width: '50%', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </nav>
    )
  }

  // Error state
  if (isError) {
    return (
      <nav className="sidebar" aria-label="Lista de vehículos">
        <div
          role="alert"
          aria-live="assertive"
          style={{ padding: 16, textAlign: 'center' }}
        >
          <div style={{ fontSize: 28, marginBottom: 10 }} aria-hidden="true">📡</div>
          <p style={{ fontSize: 13, color: 'var(--color-text)', marginBottom: 6 }}>
            No pudimos cargar los vehículos
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 14 }}>
            {error?.message}
          </p>
          <button
            onClick={() => refetch()}
            aria-label="Reintentar carga de la lista de vehículos"
            style={{
              background: 'var(--color-accent)', color: '#fff', border: 'none',
              padding: '7px 16px', borderRadius: 'var(--md-sys-shape-corner-full)',
              fontSize: 13, cursor: 'pointer',
            }}
          >
            🔄 Reintentar
          </button>
        </div>
      </nav>
    )
  }

  return (
    <nav className="sidebar" aria-label="Lista de vehículos de la flota">
      {/* Header */}
      <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid var(--color-border)' }}>
        <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: 8 }}>
          Flota activa ({devices?.length ?? 0})
        </p>

        {/* Barra de búsqueda — Ley de Hick: reduce tiempo de decisión */}
        <div style={{ position: 'relative' }}>
          <span aria-hidden="true" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: 14 }}>
            🔍
          </span>
          <input
            ref={searchRef}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar vehículo..."
            aria-label="Buscar vehículo en la flota"
            aria-controls="device-listbox"
            style={{
              width: '100%',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              padding: '6px 10px 6px 28px',
              borderRadius: 'var(--md-sys-shape-corner-medium)',
              fontSize: 13,
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Lista — role=listbox para a11y */}
      <ul
        id="device-listbox"
        role="listbox"
        aria-label="Vehículos de la flota"
        aria-multiselectable="false"
        style={{ flex: 1, overflowY: 'auto', padding: 8, margin: 0, listStyle: 'none' }}
      >
        {filtered.length === 0 ? (
          <li role="option" aria-selected="false" style={{ padding: '16px 12px', fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center' }}>
            Sin resultados para "{search}"
          </li>
        ) : (
          filtered.map((device) => (
            <DeviceItem
              key={device.id}
              device={device}
              isSelected={device.id === selectedDeviceId}
              onClick={() => selectDevice(device.id)}
            />
          ))
        )}
      </ul>
    </nav>
  )
}
