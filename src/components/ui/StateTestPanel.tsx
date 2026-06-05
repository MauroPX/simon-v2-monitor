'use client'
import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useQueryClient } from '@tanstack/react-query'

/**
 * StateTestPanel — organism
 * Demo de estados UI. Visible con ?demo=true.
 * M3 Segmented Buttons: https://m3.material.io/components/segmented-buttons/overview
 */
export function StateTestPanel() {
  const [visible, setVisible] = useState(false)
  const [active, setActive] = useState('normal')
  const { selectDevice, devices, setAppState } = useAppStore()
  const qc = useQueryClient()

  useEffect(() => {
    if (typeof window !== 'undefined')
      setVisible(window.location.search.includes('demo=true'))
  }, [])

  if (!visible) return null

  const forceState = (id: string) => {
    setActive(id)
    window.dispatchEvent(new CustomEvent('simon-demo-clear'))
    if (id === 'normal') {
      if (devices[0]) selectDevice(devices[0].id)
      setTimeout(() => setAppState('idle'), 10)
      qc.invalidateQueries()
    } else if (id === 'loading') {
      if (devices[0] && !useAppStore.getState().selectedDeviceId) selectDevice(devices[0].id)
      setTimeout(() => setAppState('loading-devices'), 50)
    } else if (id === 'error') {
      if (!useAppStore.getState().selectedDeviceId && devices[0]) selectDevice(devices[0].id)
      window.dispatchEvent(new CustomEvent('simon-demo-error'))
    } else if (id === 'empty') {
      selectDevice(null as any)
      setTimeout(() => setAppState('idle'), 10)
    }
  }

  const states = [
    { id: 'normal',  label: 'Normal',   icon: 'check_circle'    },
    { id: 'loading', label: 'Skeleton', icon: 'hourglass_empty' },
    { id: 'error',   label: 'Error',    icon: 'error_outline'   },
    { id: 'empty',   label: 'Empty',    icon: 'directions_car'  },
  ]

  return (
    <div
      role="group"
      aria-label="Demo de estados de UI"
      data-atomic="organism"
      data-component="StateTestPanel"
      style={{
        position: 'fixed', bottom: 16, left: '50%',
        transform: 'translateX(-50%)', zIndex: 150,
        display: 'flex', alignItems: 'center', gap: 0,
        background: 'var(--color-surface-container-high)',
        border: '1px solid var(--color-outline)',
        borderRadius: 40, padding: '4px 6px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}
    >
      <span style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '.06em',
        color: 'var(--color-accent)', padding: '0 8px 0 4px',
        whiteSpace: 'nowrap',
        borderRight: '1px solid var(--color-outline-variant)',
        marginRight: 4,
      }}>DEMO</span>

      {states.map((s, i) => {
        const isActive = active === s.id
        const isFirst = i === 0
        const isLast = i === states.length - 1
        return (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={s.label}
            onClick={() => forceState(s.id)}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 2, padding: '6px 12px',
              minHeight: 48, minWidth: 56,
              background: isActive ? 'var(--color-accent-dim)' : 'transparent',
              border: 'none',
              borderLeft: i > 0 ? '1px solid var(--color-outline-variant)' : 'none',
              borderRadius: isFirst ? '36px 0 0 36px' : isLast ? '0 36px 36px 0' : 0,
              cursor: 'pointer', transition: 'background 150ms',
            }}
          >
            {isActive && (
              <span className="material-symbols-outlined" aria-hidden="true"
                style={{ fontSize: 10, color: 'var(--color-accent)', marginBottom: -2 }}>
                check
              </span>
            )}
            <span className="material-symbols-outlined" aria-hidden="true"
              style={{ fontSize: 16, color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
              {s.icon}
            </span>
            <span style={{
              fontSize: 9, whiteSpace: 'nowrap', lineHeight: 1,
              color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
              fontWeight: isActive ? 700 : 400,
            }}>
              {s.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
