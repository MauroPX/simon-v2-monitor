'use client'
import React from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useDevices } from '@/hooks/useTraccar'
import type { TraccarDevice } from '@/types/traccar'

const CAT_EMOJI: Record<string,string> = {
  truck:'🚛', car:'🚗', motorcycle:'🏍️', bus:'🚌', person:'🚶', boat:'⛵', default:'🚙'
}

/**
 * CAT_COLOR — tokens de categoría M3
 * Valores alineados a --color-cat-* en globals.css.
 * No usar hex directamente en estilos — solo en JS donde var() no aplica.
 */
const CAT_COLOR: Record<string,string> = {
  truck:   '#ef4444',
  car:     '#00ffc2',
  motorcycle:'#ffb547',
  bus:     '#2ad67a',
  person:  '#ec4899',
  boat:    '#19b5ff',
  default: '#6366f1',
}

function getCategory(d: TraccarDevice): string {
  return (d.category??'default').toLowerCase()
}

/**
 * DeviceItem — molecule
 * @description Ítem de vehículo en la lista de flota.
 * @param device - Datos del dispositivo Traccar.
 * @param isSelected - Si el vehículo está actualmente seleccionado.
 * @param onSelect - Callback al seleccionar.
 * WCAG 2.1.1: Enter y Space activan la selección por teclado.
 * M3 tokens: surface-container-highest para estado selected.
 */
function DeviceItem({ device, isSelected, onSelect }:{
  device:TraccarDevice; isSelected:boolean; onSelect:()=>void
}) {
  const isOnline = device.status==='online'
  const cat      = getCategory(device)
  const color    = CAT_COLOR[cat]??CAT_COLOR.default
  return (
    <div role="option" aria-selected={isSelected}
      aria-label={`${device.name}, ${isOnline?'en línea':'desconectado'}`}
      tabIndex={0} onClick={onSelect}
      onKeyDown={e=>(e.key==='Enter'||e.key===' ')&&onSelect()}
      data-atomic="molecule" data-component="DeviceItem"
      data-state={isOnline?'online':'offline'}
      className={`device-item${isSelected?' device-item--selected':''} ${!isOnline?'device-item--offline':''}`}
    >
      <div className="device-item__icon" aria-hidden="true"
        style={{background:`${color}22`,border:`1px solid ${color}55`}}>
        <span className="device-item__emoji">{CAT_EMOJI[cat]??CAT_EMOJI.default}</span>
      </div>
      <div className="device-item__info">
        <span className="device-item__name">{device.name}</span>
        <span className="device-item__meta">{cat} · {device.contact??'Sin conductor'}</span>
      </div>
      <span className={`device-item__badge device-item__badge--${isOnline?'online':'offline'}`}
        aria-hidden="true">
        {isOnline?'● En línea':'○ Offline'}
      </span>
    </div>
  )
}

/**
 * DeviceSelector — organism
 * @description Panel lateral con lista filtrable de vehículos de la flota.
 * Estados: loading (skeleton) | error | lista de vehículos.
 * WCAG 1.3.1: role=listbox para lista de opciones seleccionables.
 * WCAG 2.1.1: navegación completa por teclado.
 * M3 tokens: surface-container para fondo, outline-variant para bordes.
 */
export function DeviceSelector() {
  const { selectedDeviceId, selectDevice, devices } = useAppStore()
  const { data: apiDevices, isLoading, isError } = useDevices()
  const [query, setQuery] = React.useState('')
  const allDevices = (apiDevices??[]).length > 0 ? (apiDevices??[]) : devices
  const online = allDevices.filter(d=>d.status==='online').length
  const filtered = allDevices.filter(d=>
    d.name.toLowerCase().includes(query.toLowerCase())
  )
  return (
    <nav aria-label="Lista de vehículos de la flota"
      data-atomic="organism" data-component="DeviceSelector"
      className="device-selector">
      <div className="device-selector__header">
        <span className="device-selector__count">FLOTA ACTIVA ({online})</span>
        <div className="device-selector__search-wrap">
          <span className="device-selector__search-icon" aria-hidden="true">🔍</span>
          <input type="search" placeholder="Buscar vehículo..."
            aria-label="Buscar vehículo en la flota"
            className="device-selector__search"
            value={query} onChange={e=>setQuery(e.target.value)}/>
        </div>
      </div>
      {isLoading&&(
        <div className="device-selector__list" aria-busy="true" aria-label="Cargando flota">
          {[1,2,3].map(i=>(
            <div key={i} className="device-item device-item--skeleton">
              <div className="device-item__icon shimmer"/>
              <div className="device-item__info">
                <div className="device-item__shimmer-name shimmer"/>
                <div className="device-item__shimmer-meta shimmer"/>
              </div>
            </div>
          ))}
        </div>
      )}
      {isError&&(
        <div role="alert" className="device-selector__error">
          Error al conectar con el servidor.
        </div>
      )}
      {!isLoading&&!isError&&(
        <div role="listbox" aria-label="Vehículos de la flota"
          className="device-selector__list">
          {filtered.length===0
            ? <p className="device-selector__empty">Sin resultados para "{query}"</p>
            : filtered.map(device=>(
                <DeviceItem key={device.id} device={device}
                  isSelected={device.id===selectedDeviceId}
                  onSelect={()=>selectDevice(device.id)}/>
              ))
          }
        </div>
      )}
    </nav>
  )
}
