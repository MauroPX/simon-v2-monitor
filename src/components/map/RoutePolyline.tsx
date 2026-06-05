'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import { Polyline, CircleMarker, Tooltip, useMap } from 'react-leaflet'
import styles from './RoutePolyline.module.css'

interface LatLngLabel {
  lat:   number
  lng:   number
  label: string
}

interface Props {
  positions:    { lat: number; lng: number }[]
  currentIndex: number
  origin:       LatLngLabel
  destination:  LatLngLabel
  completedKm:  number
  remainingKm:  number
}

export function RoutePolyline({
  positions,
  currentIndex,
  origin,
  destination,
  completedKm,
  remainingKm,
}: Props) {
  const map = useMap()
  const currentMarkerRef = useRef<L.CircleMarker>(null)

  // Aria-label on the overlay pane — describes the full route status
  useEffect(() => {
    if (positions.length < 2) return
    const pane = map.getPane('overlayPane')
    if (pane) {
      pane.setAttribute(
        'aria-label',
        `Ruta: ${completedKm.toFixed(1)} km cumplidos, ${remainingKm.toFixed(1)} km restantes`,
      )
    }
  }, [map, completedKm, remainingKm, positions.length])

  // Aria-label on the current-position CircleMarker
  const setCurrentAria = useCallback(() => {
    const el = currentMarkerRef.current?.getElement()
    if (!el) return
    el.setAttribute('role', 'img')
    el.setAttribute('aria-label', `Posición actual — ${completedKm.toFixed(1)} km recorridos`)
  }, [completedKm])

  const currentHandlers = useMemo(() => ({ add: setCurrentAria }), [setCurrentAria])
  useEffect(() => { setCurrentAria() }, [setCurrentAria])

  // Empty state guard — must be after all hook calls
  if (positions.length < 2) return null

  const clamped  = Math.max(0, Math.min(currentIndex, positions.length - 1))
  const donePath = positions.slice(0, clamped + 1)
  const restPath = positions.slice(clamped)
  const current  = positions[clamped]

  return (
    <>
      {/* Segmento 1 — CUMPLIDO: verde sólido */}
      {donePath.length >= 2 && (
        <Polyline
          positions={donePath.map(p => [p.lat, p.lng] as [number, number])}
          color="#00ffc2"
          weight={4}
          opacity={0.9}
        />
      )}

      {/* Segmento 3 — FALTANTE: gris punteado */}
      {restPath.length >= 2 && (
        <Polyline
          positions={restPath.map(p => [p.lat, p.lng] as [number, number])}
          color="#444441"
          weight={3}
          opacity={0.5}
          dashArray="6 4"
        />
      )}

      {/* Segmento 2 — ACTUAL: pulse dot en posición actual */}
      <CircleMarker
        ref={currentMarkerRef}
        center={[current.lat, current.lng]}
        radius={8}
        color="#00ffc2"
        fillColor="#00ffc2"
        fillOpacity={0.9}
        className={styles.pulseDot}
        eventHandlers={currentHandlers}
      />

      {/* Marker ORIGEN — relleno, tooltip permanente */}
      <CircleMarker
        center={[origin.lat, origin.lng]}
        radius={6}
        color="#00ffc2"
        fillColor="#00ffc2"
        fillOpacity={1}
      >
        <Tooltip permanent direction="top" offset={[0, -8]}>
          {origin.label}
        </Tooltip>
      </CircleMarker>

      {/* Marker DESTINO — blanco con borde, tooltip permanente con km restantes */}
      <CircleMarker
        center={[destination.lat, destination.lng]}
        radius={6}
        color="#00ffc2"
        fillColor="white"
        fillOpacity={1}
      >
        <Tooltip permanent direction="top" offset={[0, -8]}>
          {destination.label} · {remainingKm.toFixed(1)} km
        </Tooltip>
      </CircleMarker>
    </>
  )
}
