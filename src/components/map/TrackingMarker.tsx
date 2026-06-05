'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import { LeafletTrackingMarker, type LeafletTrackingMarkerElement } from 'react-leaflet-tracking-marker'

interface Props {
  position:         [number, number]
  previousPosition: [number, number]
  course:           number
  status:           'online' | 'offline' | 'stale'
  vehicleName:      string
  category:         string
}

const STATUS_COLOR: Record<Props['status'], string> = {
  online:  '#00ffc2',   // Simon primary
  offline: '#888780',   // atenuado
  stale:   '#EF9F27',   // ámbar advertencia
}

const STATUS_OPACITY: Record<Props['status'], string> = {
  online:  '1',
  offline: '0.6',
  stale:   '0.9',
}

// SVG points north (0°) — rotationAngle prop handles course rotation externally.
// Same polygon shape as VehicleMap for visual consistency.
function createVehicleIcon(status: Props['status']): L.DivIcon {
  const fill    = STATUS_COLOR[status]
  const opacity = STATUS_OPACITY[status]

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" style="filter:drop-shadow(0 2px 6px rgba(0,0,0,0.45))">
    <polygon points="14,2 22,24 14,20 6,24" fill="${fill}" stroke="rgba(0,0,0,0.25)" stroke-width="1.5" opacity="${opacity}"/>
  </svg>`

  return L.divIcon({
    // 44×44px outer div = WCAG 2.2 touch target; 28×28px visual SVG centered inside
    html:       `<div style="width:44px;height:44px;display:flex;align-items:center;justify-content:center">${svg}</div>`,
    className:  '',
    iconSize:   [44, 44],
    iconAnchor: [22, 22],
  })
}

export function TrackingMarker({
  position,
  previousPosition,
  course,
  status,
  vehicleName,
  category: _category,   // reserved for future Tooltip or filter use
}: Props) {
  const markerRef = useRef<LeafletTrackingMarkerElement>(null)

  // Icon only recreates when status changes (color/opacity); course handled by rotationAngle
  const icon = useMemo(() => createVehicleIcon(status), [status])

  const setAriaLabel = useCallback(() => {
    const el = markerRef.current?.getElement()
    if (!el) return
    el.setAttribute('role', 'img')
    el.setAttribute('aria-label', `${vehicleName} — ${status}`)
  }, [vehicleName, status])

  // Initial aria-label on marker add to map
  const eventHandlers = useMemo(() => ({ add: setAriaLabel }), [setAriaLabel])

  // Keep aria-label in sync when vehicleName or status changes
  useEffect(() => { setAriaLabel() }, [setAriaLabel])

  return (
    <LeafletTrackingMarker
      ref={markerRef}
      position={position}
      previousPosition={previousPosition}
      rotationAngle={course}
      rotationOrigin="center"
      duration={1000}
      keepAtCenter={false}
      icon={icon}
      eventHandlers={eventHandlers}
    />
  )
}
