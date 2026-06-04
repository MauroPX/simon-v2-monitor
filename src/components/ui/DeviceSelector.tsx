/**
 * DeviceSelector — Organismo de selección de vehículo.
 * role=listbox con role=option por item (WCAG 4.1.2).
 * Búsqueda en tiempo real — Ley de Hick: reduce tiempo de decisión.
 * 4 estados: loading | error | empty-search | populated.
 * @see ATOMIC_SPEC.json
 */
'use client'
import { useState, KeyboardEvent } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useDevices } from '@/hooks/useTraccar'
import type { TraccarDevice } from '@/types/traccar'

const CAT_EMOJI: Record<string,string> = {
  truck:'🚛', car:'🚗', motorcycle:'🏍️', bus:'🚌', person:'🚶', boat:'⛵', default:'🚙'
}
const CAT_COLOR: Record<string,string> = {
  truck: '#ef4444', car: '#00ffc2', motorcycle: '#ffb547',
  bus: '#2ad67a', person: '#ec4899', boat: '#19b5ff', default: '#6366f1',
}

function DeviceItem({ device, isSelected, onClick }:
  { device: TraccarDevice; isSelected: boolean; onClick: () => void }) {
  const emoji = CAT_EMOJI[device.category ?? 'default'] ?? CAT_EMOJI.default
  const color = CAT_COLOR[device.category ?? 'default'] ?? CAT_COLOR.default
  const isOnline = device.status === 'online'

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() }
  }

  return (
    <li role="option" aria-selected={isSelected} tabIndex={0}
      onClick={onClick} onKeyDown={handleKey}
      aria-label={`${device.name}, ${isOnline ? 'en línea' : 'desconectado'}`} data-atomic="molecule" data-component="DeviceItem"
      style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 10px',
        borderRadius:'var(--radius-md)', cursor:'pointer', listStyle:'none',
        border:`1px solid ${isSelected ? 'var(--color-accent)' : 'transparent'}`,
        background: isSelected ? 'var(--color-accent-dim)' : 'transparent',
        transition:'background 0.15s, border-color 0.15s', marginBottom:2, outline:'none' }}>
      <div aria-hidden="true" style={{ width:34, height:34, borderRadius:9,
        background:`${color}22`, display:'flex', alignItems:'center',
        justifyContent:'center', fontSize:17, flexShrink:0 }}>{emoji}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:12.5, fontWeight:500, color:'var(--color-text)',
          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {device.name}
        </div>
        <div style={{ fontSize:11, color:'var(--color-text-muted)', marginTop:1 }}>
          {device.category ?? 'Vehículo'} · {String(device.attributes?.driver ?? 'Sin conductor')}
        </div>
      </div>
      <span style={{ fontSize:10, fontWeight:500, padding:'2px 7px',
        borderRadius:'var(--radius-full)', flexShrink:0,
        background: isOnline ? 'var(--color-online-dim)' : 'var(--color-offline-dim)',
        color: isOnline ? 'var(--color-online)' : 'var(--color-offline)' }}>
        {isOnline ? '● En línea' : '○ Offline'}
      </span>
    </li>
  )
}

export function DeviceSelector() {
  const { selectedDeviceId, selectDevice } = useAppStore()
  const { data: devices, isLoading, isError, error, refetch } = useDevices()
  const [search, setSearch] = useState('')

  const filtered = (devices ?? []).filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.category ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const sidebarStyle = { background:'var(--color-surface)',
    borderRight:'1px solid var(--color-border)',
    display:'flex', flexDirection:'column' as const, overflow:'hidden' }

  if (isLoading) return (
    <nav style={sidebarStyle} aria-label="Lista de vehículos" aria-busy="true">
      <div style={{ padding:'10px 12px 8px', borderBottom:'1px solid var(--color-border)' }}>
        <div className="shimmer" style={{ height:10, width:'60%', borderRadius:4, marginBottom:8 }}/>
        <div className="shimmer" style={{ height:32, borderRadius:8 }}/>
      </div>
      <div style={{ padding:8 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ display:'flex', gap:10, padding:'9px 10px', marginBottom:2 }}>
            <div className="shimmer" style={{ width:34, height:34, borderRadius:9, flexShrink:0 }}/>
            <div style={{ flex:1 }}>
              <div className="shimmer" style={{ height:12, width:'70%', borderRadius:4, marginBottom:6 }}/>
              <div className="shimmer" style={{ height:10, width:'50%', borderRadius:4 }}/>
            </div>
          </div>
        ))}
      </div>
    </nav>
  )

  if (isError) return (
    <nav style={sidebarStyle} aria-label="Lista de vehículos">
      <div role="alert" aria-live="assertive"
        style={{ padding:20, textAlign:'center', display:'flex',
          flexDirection:'column', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:32 }} aria-hidden="true">📡</span>
        <p style={{ fontSize:13, color:'var(--color-text)', margin:0 }}>
          No pudimos cargar los vehículos
        </p>
        <p style={{ fontSize:11, color:'var(--color-text-muted)', margin:0 }}>
          {error?.message}
        </p>
        <button onClick={() => refetch()}
          aria-label="Reintentar carga de la lista de vehículos"
          style={{ background:'var(--color-accent)', color:'var(--color-bg)',
            border:'none', padding:'7px 16px', borderRadius:'var(--radius-full)',
            fontSize:12, fontWeight:500, cursor:'pointer', marginTop:4 }}>
          🔄 Reintentar
        </button>
      </div>
    </nav>
  )

  return (
    <nav style={sidebarStyle} aria-label="Lista de vehículos de la flota" data-atomic="organism" data-component="DeviceSelector">
      <div style={{ padding:'10px 12px 8px', borderBottom:'1px solid var(--color-border)' }}>
        <p style={{ fontSize:10, fontWeight:500, textTransform:'uppercase',
          letterSpacing:'.07em', color:'var(--color-text-muted)', margin:'0 0 7px' }}>
          Flota activa ({devices?.length ?? 0})
        </p>
        <div style={{ position:'relative' }}>
          <span aria-hidden="true" style={{ position:'absolute', left:8, top:'50%',
            transform:'translateY(-50%)', color:'var(--color-text-muted)', fontSize:13 }}>🔍</span>
          <input type="search" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar vehículo..."
            aria-label="Buscar vehículo en la flota"
            aria-controls="device-listbox"
            style={{ width:'100%', background:'var(--color-surface-2)',
              border:'1px solid var(--color-border)', color:'var(--color-text)',
              padding:'6px 10px 6px 28px', borderRadius:'var(--radius-md)',
              fontSize:12.5, outline:'none' }}/>
        </div>
      </div>
      <ul id="device-listbox" role="listbox" aria-label="Vehículos de la flota"
        aria-multiselectable="false"
        style={{ flex:1, overflowY:'auto', padding:6, margin:0 }}>
        {filtered.length === 0 ? (
          <li role="option" aria-selected="false"
            style={{ padding:'14px 10px', fontSize:12,
              color:'var(--color-text-muted)', textAlign:'center', listStyle:'none' }}>
            Sin resultados para "{search}"
          </li>
        ) : filtered.map(device => (
          <DeviceItem key={device.id} device={device}
            isSelected={device.id === selectedDeviceId}
            onClick={() => selectDevice(device.id)} />
        ))}
      </ul>
    </nav>
  )
}
