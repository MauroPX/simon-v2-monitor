'use client'

// Requires dynamic({ ssr: false }) at the consumer — same pattern as VehicleMap.
// Wire into DashboardLayout in the next session.

import { useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Polyline, ZoomControl } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAppStore } from '@/store/useAppStore'
import { useAppStoreV2, type ConnectionState } from '@/store/useAppStoreV2'

interface MapCapa2Props {
  onMarkerTap?: (deviceId: number) => void
}
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

export function MapCapa2({ onMarkerTap }: MapCapa2Props = {}) {
  const { devices, positions } = useTraccarLive()
  const selectedDeviceId        = useAppStore(s => s.selectedDeviceId)
  const selectDevice            = useAppStore(s => s.selectDevice)
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

  // Historical trail for the selected vehicle (last 30 points)
  const trailRef = useRef<Map<number, [number, number][]>>(new Map())

  useEffect(() => {
    if (selectedDeviceId === null) return
    const pos = positions[selectedDeviceId]
    if (!pos) return
    const point: [number, number] = [pos.latitude, pos.longitude]
    const trail = trailRef.current.get(selectedDeviceId) ?? []
    trail.push(point)
    if (trail.length > 30) trail.shift()
    trailRef.current.set(selectedDeviceId, trail)
  }, [positions, selectedDeviceId])

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
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='© CARTO'
        />

        {/* All fleet vehicles — clustered at low zoom levels */}
        <MarkerClusterGroup
          chunkedLoading
          disableClusteringAtZoom={14}
          spiderfyOnMaxZoom={true}
          iconCreateFunction={(cluster: { getChildCount(): number }) => {
            const count = cluster.getChildCount()
            return L.divIcon({
              html: `<div style="background:#00ffc2;color:#080808;border:2px solid #fff;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;" aria-label="Grupo de ${count} vehículos">${count}</div>`,
              className: '',
              iconSize: [44, 44],
            })
          }}
        >
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
                deviceId={device.id}
                onSelect={(id) => { selectDevice(id); onMarkerTap?.(id) }}
              />
            )
          })}
        </MarkerClusterGroup>

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

        {/* Historical trail — last 30 GPS points of selected vehicle */}
        {selectedDeviceId && (trailRef.current.get(selectedDeviceId)?.length ?? 0) > 1 && (
          <Polyline
            positions={trailRef.current.get(selectedDeviceId)!}
            pathOptions={{ color: '#00ffc2', weight: 2, opacity: 0.4, dashArray: '4 2' }}
            interactive={false}
          />
        )}
      </MapContainer>
    </div>
  )
}
