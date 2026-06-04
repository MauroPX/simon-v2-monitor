'use client'
import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useQueryClient } from '@tanstack/react-query'

export function StateTestPanel() {
  const [visible, setVisible] = useState(false)
  const [active, setActive] = useState('normal')
  const { selectDevice, devices, setAppState } = useAppStore()
  const qc = useQueryClient()

  useEffect(() => {
    if (typeof window !== 'undefined') setVisible(window.location.search.includes('demo=true'))
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
        if (devices[0]) selectDevice(devices[0].id)
        setAppState('loading-devices')
        break
      case 'error':
        if (devices[0]) selectDevice(devices[0].id)
        setAppState('error-network' as any, 'No pudimos conectar con el servidor.')
        break
      case 'empty':
        setAppState('idle')
        selectDevice(null as any)
        break
    }
  }

  const states = [
    { id:'normal',  label:'Normal',   icon:'check_circle'   },
    { id:'loading', label:'Skeleton', icon:'hourglass_empty'},
    { id:'error',   label:'Error',    icon:'error_outline'  },
    { id:'empty',   label:'Empty',    icon:'directions_car' },
  ]

  return (
    <div role="complementary" aria-label="Panel de demostración de estados"
      data-atomic="organism" data-component="StateTestPanel"
      style={{position:'fixed',bottom:16,left:'50%',transform:'translateX(-50%)',
        zIndex:150,background:'var(--color-surface-container-high)',
        border:'1px solid var(--color-accent)',borderRadius:40,
        padding:'4px 8px',display:'flex',alignItems:'center',gap:2,
        boxShadow:'0 4px 20px rgba(0,0,0,0.5)'}}>
      <span style={{fontSize:9,fontWeight:700,letterSpacing:'.06em',
        color:'var(--color-accent)',marginRight:4,whiteSpace:'nowrap'}}>DEMO</span>
      {states.map(s => (
        <button key={s.id} type="button" onClick={() => forceState(s.id)}
          aria-pressed={active===s.id} aria-label={s.label} title={s.label}
          style={{display:'flex',flexDirection:'column',alignItems:'center',
            padding:'4px 8px',gap:2,
            background:active===s.id?'var(--color-accent-dim)':'transparent',
            border:active===s.id?'1px solid var(--color-accent)':'1px solid transparent',
            borderRadius:20,cursor:'pointer',minHeight:48,minWidth:48,
            transition:'all 150ms'}}>
          <span className="material-symbols-outlined" aria-hidden="true"
            style={{fontSize:16,color:active===s.id?'var(--color-accent)':'var(--color-text-muted)'}}>
            {s.icon}
          </span>
          <span style={{fontSize:9,color:active===s.id?'var(--color-accent)':'var(--color-text-muted)',
            fontWeight:active===s.id?700:400,whiteSpace:'nowrap',lineHeight:1}}>
            {s.label}
          </span>
        </button>
      ))}
    </div>
  )
}
