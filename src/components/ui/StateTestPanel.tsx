'use client'
import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useQueryClient } from '@tanstack/react-query'

/**
 * StateTestPanel — organism (demo de estados para la prueba técnica)
 * Fuerza estados de UI usando el store y React Query.
 * Visible con ?demo=true en la URL.
 * WCAG 2.1.1: todos los botones son nativos con aria-label.
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
        setAppState('error-network' as any, 'No pudimos conectar con el servidor de seguimiento. Verifica tu conexión.')
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
    { id:'error',   label:'Error + Retry', icon:'error_outline',   desc:'Fallo de red' },
    { id:'empty',   label:'Sin vehículo',  icon:'directions_car',  desc:'Empty state' },
  ]

  return (
    <aside
      role="complementary"
      aria-label="Panel de demostración de estados de UI"
      data-atomic="organism"
      data-component="StateTestPanel"
      style={{
        position:'fixed', top:'60px', left:'16px', zIndex:300,
        background:'var(--color-surface-container-high)',
        border:'1px solid var(--color-accent)',
        borderRadius:'12px', padding:'12px', width:'200px',
        boxShadow:'0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      <p style={{fontSize:'9px',fontWeight:700,letterSpacing:'.08em',
        color:'var(--color-accent)',marginBottom:'10px',textTransform:'uppercase'}}>
        Demo de estados · prueba técnica
      </p>
      {states.map(s => (
        <button
          key={s.id}
          type="button"
          onClick={() => forceState(s.id)}
          aria-pressed={active === s.id}
          aria-label={`Forzar estado ${s.label}: ${s.desc}`}
          style={{
            display:'flex', alignItems:'center', gap:'8px',
            width:'100%', padding:'8px 10px', marginBottom:'6px',
            background: active===s.id ? 'var(--color-accent-dim)' : 'transparent',
            border: active===s.id ? '1px solid var(--color-accent)' : '1px solid var(--color-outline-variant)',
            borderRadius:'8px', cursor:'pointer', textAlign:'left',
            transition:'all 200ms',
          }}
        >
          <span className="material-symbols-outlined" aria-hidden="true"
            style={{fontSize:16,color:active===s.id?'var(--color-accent)':'var(--color-text-muted)'}}>
            {s.icon}
          </span>
          <div>
            <div style={{fontSize:'12px',fontWeight:500,color:'var(--color-text)'}}>{s.label}</div>
            <div style={{fontSize:'10px',color:'var(--color-text-muted)'}}>{s.desc}</div>
          </div>
        </button>
      ))}
      <p style={{fontSize:'9px',color:'var(--color-text-muted)',marginTop:'6px',lineHeight:1.4}}>
        Visible solo con ?demo=true
      </p>
    </aside>
  )
}
