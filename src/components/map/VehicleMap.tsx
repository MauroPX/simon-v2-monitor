'use client'
import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAppStore, useSelectedDevice } from '@/store/useAppStore'
import { knotsToKmh, courseToCardinal, interpolatePosition, type LatLng } from '@/lib/utils'
import type { TraccarPosition } from '@/types/traccar'

const CAT_COLOR: Record<string,string> = {
  truck:var(--color-cat-truck, #ef4444), car:var(--color-cat-car, #4EEAC4), motorcycle:var(--color-cat-motorcycle, #F59E0B),
  bus:var(--color-cat-bus, #2AB894), person:var(--color-cat-person, #ec4899), boat:var(--color-cat-boat, #06b6d4), default:var(--color-cat-default, #6366f1)
}

function MarkerController({ position, device }:
  { position: TraccarPosition | null; device: ReturnType<typeof useSelectedDevice> }) {
  const map = useMap()
  const markerRef = useRef<L.Marker | null>(null)
  const animRef = useRef<number | null>(null)
  const fromRef = useRef<LatLng | null>(null)
  const toRef = useRef<LatLng | null>(null)
  const startRef = useRef<number>(0)
  const POLL_MS = 5000

  useEffect(() => {
    if (!position || !device) return
    const color = CAT_COLOR[device.category ?? 'default'] ?? CAT_COLOR.default
    const isOffline = device.status === 'offline'
    const fill = isOffline ? var(--color-offline) : color
    const opacity = isOffline ? '0.5' : '1'
    const svgHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 28 28" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))">
      <polygon points="14,2 22,24 14,20 6,24" fill="${fill}" stroke="white" stroke-width="1.5" opacity="${opacity}"/>
    </svg>`
    const icon = L.divIcon({
      html: `<div style="transform:rotate(${position.course}deg);transition:transform 0.5s ease">${svgHtml}</div>`,
      className: '', iconSize:[26,26], iconAnchor:[13,13]
    })

    if (!markerRef.current) {
      const m = L.marker([position.latitude, position.longitude], { icon })
      m.on('add', () => {
        const el = m.getElement()
        if (el) {
          el.setAttribute('role','img')
          el.setAttribute('aria-label',
            `Vehículo ${device.name}, ${knotsToKmh(position.speed).toFixed(0)} km/h, rumbo ${courseToCardinal(position.course)}`)
        }
      })
      m.addTo(map)
      markerRef.current = m
      map.flyTo([position.latitude, position.longitude], 14, { duration:1.5 })
      return
    }

    if (animRef.current) cancelAnimationFrame(animRef.current)
    fromRef.current = markerRef.current.getLatLng()
    toRef.current = { lat: position.latitude, lng: position.longitude }
    startRef.current = performance.now()

    function animate(now: number) {
      if (!markerRef.current || !fromRef.current || !toRef.current) return
      const t = Math.min((now - startRef.current) / POLL_MS, 1)
      const eased = t < 0.5 ? 2*t*t : -1+(4-2*t)*t
      const pos = interpolatePosition(fromRef.current, toRef.current, eased)
      markerRef.current.setLatLng([pos.lat, pos.lng])
      const el = markerRef.current.getElement()
      if (el && position) {
        const inner = el.querySelector('div') as HTMLElement | null
        if (inner) inner.style.transform = `rotate(${position.course}deg)`
        el.setAttribute('aria-label',
          `Vehículo ${device?.name ?? ''}, ${knotsToKmh(position.speed).toFixed(0)} km/h, rumbo ${courseToCardinal(position.course)}`)
      }
      if (t < 1) animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [position, device, map])

  useEffect(() => () => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    if (markerRef.current) { markerRef.current.remove(); markerRef.current = null }
  }, [device?.id])

  return null
}

export function VehicleMap() {
  const device = useSelectedDevice()
  const { currentPosition, previousPosition, appState } = useAppStore()
  const isError = appState === 'error-tracking'

  return (
    <div role="application" aria-label="Mapa de ubicación del vehículo" data-atomic="organism" data-component="VehicleMap" className="vehicle-map"
      style={{ position:'relative', height:'100%' }}>
      {isError && (
        <div role="alert" aria-live="assertive"
          style={{ position:'absolute', top:10, left:'50%', transform:'translateX(-50%)',
            zIndex:1000, background:'var(--color-surface)',
            border:'1px solid var(--color-danger)', borderRadius:'var(--radius-md)',
            padding:'7px 14px', fontSize:12, display:'flex', alignItems:'center',
            gap:7, boxShadow:'0 4px 12px rgba(0,0,0,0.2)', whiteSpace:'nowrap' }}>
          <span aria-hidden="true">⚠️</span>
          <span>Conexión perdida — última ubicación conocida</span>
        </div>
      )}
      <MapContainer center={[4.7110, -74.0721]} zoom={12}
        style={{ height:'100%', width:'100%',
          opacity: isError ? 0.6 : 1,
          filter: isError ? 'grayscale(0.6)' : 'none',
          transition:'opacity 0.3s ease, filter 0.3s ease' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'/>
        {device && <MarkerController position={currentPosition} device={device}/>}
      </MapContainer>
      {!device && (
        <div style={{ position:'absolute', inset:0, display:'flex',
          alignItems:'center', justifyContent:'center',
          background:'rgba(0,0,0,0.35)', backdropFilter:'blur(2px)',
          zIndex:500, color:'var(--color-bg)', fontSize:13, gap:8 }}>
          <span aria-hidden="true">🗺️</span>
          <span>Selecciona un vehículo para ver su ubicación</span>
        </div>
      )}
    </div>
  )
}
