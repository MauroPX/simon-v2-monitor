'use client'
import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useQueryClient } from '@tanstack/react-query'

/**
 * StateTestPanel — organism (demo de estados para la prueba técnica)
 * Visible con ?demo=true. Posición: esquina inferior derecha sobre el status panel.
 * WCAG 2.1.1: botones nativos con aria-label y aria-pressed.
 */
export function StateTestPanel() {
  const [visible, setVisible] = useState(false)
  const [active, setActive] = useState('normal')
  const { selectDevice, devices, setAppState } = useAppStore()
  const qc = useQueryClient()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setVisible(window.location.search.includes('demo=true'))
    }
  }, [])

  if (!visible) return null

  const forceState = (id: string) => {
    setActive(id)
    switch(id) {
      case 'normal':
        setAppState('idle')
        if (devices[0]) selectDevice(devices[0].id)
        qc.invalidateQueries()
        break
      case 'loading':
        setAppState('loading-devices')
        selectDevice(null as any)
        break
      case 'error':
        setAppState('error-network' as any, 'No pudimos conectar con el servidor.')
        break
      case 'empty':
        setAppState('idle')
        selectDevice(null as any)
        break
    }
  }

  const states = [
    { id:'normal',  label:'Normal',       icon:'check_circle',    desc:'Datos activos' },
    { id:'loading', label:'Skeleton',      icon:'hourglass_empty', desc:'Carga inicial' },
    { id:'error',   label:'Error+Retry',   icon:'error_outline',   desc:'Fallo de red' },
    { id:'empty',   label:'Sin vehículo',  icon:'directions_car',  desc:'Empty state' },
  ]

  return (
    <aside
      role="complementary"
      aria-label="Panel de demostración de estados"
      data-atomic="organism"
      data-component="StateTestPanel"
      style={{
        position:'fixed',
        bottom:'16px',
        right:'160px',
        zIndex:150,
        background:'var(--color-surface-container-high)',
        border:'1px solid var(--color-accent)',
        borderRadius:'12px',
        padding:'8px',
        display:'flex',
        flexDirection:'row',
        gap:'4px',
        boxShadow:'0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      {states.map(s => (
        <button
          key={s.id}
          type="button"
          onClick={() => forceState(s.id)}
          aria-pressed={active === s.id}
          aria-label={`Estado: ${s.label}`}
          title={s.desc}
          style={{
            display:'flex', flexDirection:'column', alignItems:'center',
            padding:'6px 10px', gap:'3px',
            background: active===s.id ? 'var(--color-accent-dim)' : 'transparent',
            border: active===s.id ? '1px solid var(--color-accent)' : '1px solid transparent',
            borderRadius:'8px', cursor:'pointer',
            transition:'all 200ms',
          }}
        >
          <span className="material-symbols-outlined" aria-hidden="true"
            style={{fontSize:16,color:active===s.id?'var(--color-accent)':'var(--color-text-muted)'}}>
            {s.icon}
          </span>
          <span style={{fontSize:'9px',color:active===s.id?'var(--color-accent)':'var(--color-text-muted)',
            fontWeight:active===s.id?700:400,whiteSpace:'nowrap'}}>
            {s.label}
          </span>
        </button>
      ))}
    </aside>
  )
}
