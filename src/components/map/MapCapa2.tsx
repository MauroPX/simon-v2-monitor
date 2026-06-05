'use client'

// Requires dynamic({ ssr: false }) at the consumer — same pattern as VehicleMap.
// Wire into DashboardLayout in the next session.

import { useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useAppStore } from '@/store/useAppStore'
import { useAppStoreV2, type ConnectionState } from '@/store/useAppStoreV2'
import { useTraccarLive } from '@/hooks/useTraccarLive'
import { findCurrentIndex } from '@/lib/haversine'
import { TrackingMarker } from './TrackingMarker'
import { RoutePolyline } from './RoutePolyline'
import fleetData from '@/data/fleet-simulation.json'

const BOGOTA_CENTER: [number, number] = [4.7110, -74.0721]

function resolveMarkerStatus(
  deviceStatus: 'online' | 'offline' | 'unknown',
  connectionState: ConnectionState,
): 'online' | 'offline' | 'stale' {
  if (connectionState === 'stale') return 'stale'
  if (deviceStatus === 'offline') return 'offline'
  return 'online'
}

export function MapCapa2() {
  const { devices, positions } = useTraccarLive()
  const selectedDeviceId        = useAppStore(s => s.selectedDeviceId)
  const { connectionState }     = useAppStoreV2()

  // Tracks previous positions for TrackingMarker smooth animation (from → to)
  const prevPositionsRef = useRef<Record<number, [number, number]>>({})

  // Update previous positions AFTER each render so the next render gets the old values
  useEffect(() => {
    for (const device of devices) {
      const pos = positions[device.id]
      if (pos) {
        prevPositionsRef.current[device.id] = [pos.latitude, pos.longitude]
      }
    }
  }, [devices, positions])

  // Route data for the selected vehicle
  const selectedEntry = useMemo(() => {
    if (selectedDeviceId === null) return null
    return fleetData.find(e => e.deviceId === selectedDeviceId) ?? null
  }, [selectedDeviceId])

  const routeData = useMemo(() => {
    if (!selectedEntry) return null
    const points = [selectedEntry.origin, ...selectedEntry.waypoints, selectedEntry.destination]
    const currentIndex = findCurrentIndex(points, selectedEntry.currentKm, selectedEntry.totalRouteKm)
    return {
      points,
      currentIndex,
      origin:      selectedEntry.origin,
      destination: selectedEntry.destination,
      completedKm: selectedEntry.currentKm,
      remainingKm: Math.max(0, selectedEntry.totalRouteKm - selectedEntry.currentKm),
    }
  }, [selectedEntry])

  return (
    <div
      role="application"
      aria-label="Mapa de flota vehicular"
      style={{ height: '100%', width: '100%', position: 'relative' }}
    >
      <MapContainer
        center={BOGOTA_CENTER}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* All fleet vehicles as animated tracking markers */}
        {devices.map(device => {
          const pos = positions[device.id]
          if (!pos) return null

          const current:  [number, number] = [pos.latitude, pos.longitude]
          const previous: [number, number] = prevPositionsRef.current[device.id] ?? current

          return (
            <TrackingMarker
              key={device.id}
              position={current}
              previousPosition={previous}
              course={pos.course}
              status={resolveMarkerStatus(device.status, connectionState)}
              vehicleName={device.name}
              category={device.category ?? 'default'}
            />
          )
        })}

        {/* Route polyline — 3 segments — only for selected vehicle */}
        {routeData && (
          <RoutePolyline
            positions={routeData.points}
            currentIndex={routeData.currentIndex}
            origin={routeData.origin}
            destination={routeData.destination}
            completedKm={routeData.completedKm}
            remainingKm={routeData.remainingKm}
          />
        )}
      </MapContainer>
    </div>
  )
}
