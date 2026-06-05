'use client'
import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import type { TraccarDevice, TraccarPosition } from '@/types/traccar'

interface Toast {
  id: string
  deviceId: number
  name: string
  speed: number
}

interface SpeedAlertProps {
  devices: TraccarDevice[]
  positions: Record<number, TraccarPosition>
}

// speed arg is in km/h
export function getBadgeLevel(speedKmh: number): 'warning' | 'danger' | null {
  if (speedKmh > 80) return 'danger'
  if (speedKmh >= 60) return 'warning'
  return null
}

export function SpeedAlert({ devices, positions }: SpeedAlertProps) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const selectDevice = useAppStore(s => s.selectDevice)

  useEffect(() => {
    devices.forEach(device => {
      const pos = positions[device.id]
      const speedKmh = (pos?.speed ?? 0) * 1.852  // knots → km/h
      if (speedKmh <= 80) return
      setToasts(prev => {
        if (prev.find(t => t.deviceId === device.id)) return prev
        const next = [...prev, {
          id: `${device.id}-${Date.now()}`,
          deviceId: device.id,
          name: device.name,
          speed: Math.round(speedKmh),
        }]
        return next.slice(-3)
      })
    })
  }, [devices, positions])

  const dismiss = (id: string) =>
    setToasts(prev => prev.filter(t => t.id !== id))

  useEffect(() => {
    if (toasts.length === 0) return
    const timers = toasts.map(t =>
      setTimeout(() => dismiss(t.id), 5000)
    )
    return () => timers.forEach(clearTimeout)
  }, [toasts])

  if (toasts.length === 0) return null

  return (
    <div
      style={{
        position: 'fixed', top: 16, right: 16,
        zIndex: 9999, display: 'flex',
        flexDirection: 'column', gap: 8,
      }}
      aria-live="assertive"
      aria-atomic="true"
    >
      {toasts.map(t => (
        <div
          key={t.id}
          role="alert"
          aria-label={`Alerta velocidad: ${t.name} a ${t.speed} km/h`}
          onClick={() => selectDevice(t.deviceId)}
          style={{
            background: '#1a0a0a',
            borderLeft: '3px solid #E24B4A',
            borderRadius: 8,
            overflow: 'hidden',
            cursor: 'pointer',
            minWidth: 260,
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 14, color: '#fff' }}>
              ⚠ {t.name} · {t.speed} km/h — Velocidad excesiva
            </span>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); dismiss(t.id) }}
              aria-label="Cerrar alerta"
              style={{
                background: 'none', border: 'none',
                color: '#888', cursor: 'pointer',
                minWidth: 44, minHeight: 44,
                fontSize: 18, lineHeight: 1,
                flexShrink: 0,
              }}
            >×</button>
          </div>
          <div
            style={{
              height: 3,
              background: '#E24B4A',
              transformOrigin: 'left',
              animation: 'speed-alert-progress 5s linear forwards',
            }}
            aria-hidden="true"
          />
          <style>{`
            @keyframes speed-alert-progress {
              from { transform: scaleX(1); }
              to   { transform: scaleX(0); }
            }
            @media (prefers-reduced-motion: reduce) {
              [data-speed-alert-bar] { animation: none !important; }
            }
          `}</style>
        </div>
      ))}
    </div>
  )
}
