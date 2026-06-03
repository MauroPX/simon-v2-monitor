'use client'
// src/components/map/VehicleMap.tsx
// NOTA: este componente solo se importa con dynamic(..., { ssr: false })
// porque Leaflet usa `window` en la importación — rompe el build en Next.js SSR
//
// DECISIONES DE ACCESIBILIDAD (para el video):
// 1. role="application": el mapa es una región interactiva compleja (WCAG 4.1.2)
// 2. aria-label en el marcador: anuncia nombre + velocidad + dirección (WCAG 1.1.1)
// 3. Smooth movement: rAF interpola entre posición anterior y nueva durante 5s
//    El operador no ve "saltos" — el marcador se desliza orgánicamente (ADR-008)

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAppStore, useSelectedDevice } from '@/store/useAppStore'
import { knotsToKmh, courseToCardinal, interpolatePosition, type LatLng } from '@/lib/utils'
import type { TraccarPosition } from '@/types/traccar'

// ── Colores por categoría de vehículo (M3 tokens de negocio)
const CATEGORY_COLORS: Record<string, string> = {
  truck: '#ef4444',
  car: '#3b82f6',
  motorcycle: '#f59e0b',
  bus: '#10b981',
  person: '#ec4899',
  boat: '#06b6d4',
  default: '#6366f1',
}

// ── SVG del marcador — triángulo orientable con `course`
function createVehicleSVG(color: string, isOffline: boolean): string {
  const fill = isOffline ? '#64748b' : color
  const opacity = isOffline ? '0.5' : '1'
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"
         style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4))">
      <polygon
        points="14,2 22,24 14,20 6,24"
        fill="${fill}"
        stroke="white"
        stroke-width="1.5"
        opacity="${opacity}"
      />
    </svg>
  `
}

// ── Componente interno — usa useMap() que solo funciona dentro de MapContainer
function MarkerController({
  position,
  prevPosition,
  device,
}: {
  position: TraccarPosition | null
  prevPosition: TraccarPosition | null
  device: ReturnType<typeof useSelectedDevice>
}) {
  const map = useMap()
  const markerRef = useRef<L.Marker | null>(null)
  const animRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const fromRef = useRef<LatLng | null>(null)
  const toRef = useRef<LatLng | null>(null)

  const POLLING_INTERVAL_MS = 5000 // debe coincidir con el polling de useTraccarPosition

  useEffect(() => {
    if (!position || !device) return

    const color = CATEGORY_COLORS[device.category ?? 'default'] ?? CATEGORY_COLORS.default
    const isOffline = device.status === 'offline'
    const svgHtml = createVehicleSVG(color, isOffline)

    const icon = L.divIcon({
      html: `<div style="transform: rotate(${position.course}deg); transition: transform 0.5s ease;">${svgHtml}</div>`,
      className: '', // reset class de Leaflet — usamos nuestro SVG
      iconSize: [28, 28],
      iconAnchor: [14, 14], // centrado en el punto GPS exacto
      popupAnchor: [0, -16],
    })

    // Primera posición — crear el marcador
    if (!markerRef.current) {
      const marker = L.marker([position.latitude, position.longitude], { icon })

      // WCAG 1.1.1 — el marcador tiene aria-label descriptivo
      marker.on('add', () => {
        const el = marker.getElement()
        if (el) {
          el.setAttribute('role', 'img')
          el.setAttribute(
            'aria-label',
            `Vehículo ${device.name}, velocidad ${knotsToKmh(position.speed).toFixed(0)} km/h, dirección ${courseToCardinal(position.course)}`
          )
        }
      })

      marker.addTo(map)
      markerRef.current = marker

      // Centrar el mapa en la primera posición
      map.flyTo([position.latitude, position.longitude], 15, { duration: 1.5 })
      return
    }

    // Actualización de posición — smooth movement con rAF
    // Cancela la animación anterior si todavía corre
    if (animRef.current) cancelAnimationFrame(animRef.current)

    fromRef.current = markerRef.current.getLatLng()
    toRef.current = { lat: position.latitude, lng: position.longitude }
    startTimeRef.current = performance.now()

    function animate(now: number) {
      if (!markerRef.current || !fromRef.current || !toRef.current) return

      const elapsed = now - startTimeRef.current
      // t va de 0 a 1 durante el intervalo de polling completo
      const t = Math.min(elapsed / POLLING_INTERVAL_MS, 1)

      // Easing suave: ease-in-out cubic
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t

      const interpolated = interpolatePosition(fromRef.current, toRef.current, eased)
      markerRef.current.setLatLng([interpolated.lat, interpolated.lng])

      // Actualizar rotación del icono con la dirección actual
      const el = markerRef.current.getElement()
      if (el) {
        const inner = el.querySelector('div')
        if (inner) {
          inner.style.transform = `rotate(${position.course}deg)`
        }
        // Actualizar aria-label con nueva velocidad
        el.setAttribute(
          'aria-label',
          `Vehículo ${device?.name ?? ''}, velocidad ${knotsToKmh(position.speed).toFixed(0)} km/h, dirección ${courseToCardinal(position.course)}`
        )
      }

      if (t < 1) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        // Animación completada — centrar si el marcador sale del viewport
        if (map && !map.getBounds().contains([position.latitude, position.longitude])) {
          map.flyTo([position.latitude, position.longitude], map.getZoom(), { duration: 1 })
        }
      }
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [position, device, map])

  // Limpiar marcador al desmontar o cambiar de vehículo
  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
    }
  }, [device?.id])

  return null
}

// ── Mapa completo exportable
export function VehicleMap() {
  const device = useSelectedDevice()
  const { currentPosition, previousPosition, appState } = useAppStore()
  const isError = appState === 'error-tracking'

  return (
    <div
      className="map-area"
      role="application"
      aria-label="Mapa interactivo de ubicación del vehículo"
      style={{ position: 'relative', height: '100%' }}
    >
      {/* Overlay de error — mapa visible pero en baja opacidad (última posición conocida) */}
      {isError && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-danger)',
            borderRadius: 'var(--md-sys-shape-corner-medium)',
            padding: '8px 16px',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <span aria-hidden="true">⚠️</span>
          <span>Conexión perdida — mostrando última ubicación conocida</span>
        </div>
      )}

      <MapContainer
        center={[19.4326, -99.1332]} // Ciudad de México como default
        zoom={13}
        style={{
          height: '100%',
          width: '100%',
          opacity: isError ? 0.6 : 1, // Grayscale visual cuando hay error
          filter: isError ? 'grayscale(0.6)' : 'none',
          transition: 'opacity 0.3s ease, filter 0.3s ease',
        }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Marcador con smooth movement — solo renderiza cuando hay vehículo y posición */}
        {device && (
          <MarkerController
            position={currentPosition}
            prevPosition={previousPosition}
            device={device}
          />
        )}
      </MapContainer>

      {/* Mensaje cuando no hay vehículo seleccionado */}
      {!device && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(2px)',
            zIndex: 500,
            color: '#fff',
            fontSize: 14,
            gap: 8,
          }}
        >
          <span aria-hidden="true">🗺️</span>
          <span>Selecciona un vehículo para ver su ubicación</span>
        </div>
      )}
    </div>
  )
}
