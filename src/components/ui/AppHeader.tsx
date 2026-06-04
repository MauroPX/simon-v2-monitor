'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppStore()
  const isDark = theme === 'dark'
  return (
    <button type="button" onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-pressed={isDark} data-atomic="atom" data-component="ThemeToggle"
      className="theme-toggle">
      <span className="material-symbols-outlined" aria-hidden="true" style={{fontSize:16}}>
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
      <span className="theme-toggle__label">{isDark ? 'Claro' : 'Oscuro'}</span>
    </button>
  )
}

const LAYERS = [
  { id:1, label:'Capa 1', name:'Mock',   status:'live',    color:'#00ffc2', items:['DS v3.0','M3 tokens','WCAG AAA','Mock data','Leaflet','Dark/Light'] },
  { id:2, label:'Capa 2', name:'Demo',   status:'next',    color:'#19b5ff', items:['Auth Traccar','Connecting','Stale','Error HTTP','ADR-009'] },
  { id:3, label:'Capa 3', name:'MVP',    status:'roadmap', color:'#ffb547', items:['WebSocket','Alertas','Rastro SVG','Cluster','SPRINT 3'] },
  { id:4, label:'Capa 4', name:'Legacy', status:'future',  color:'#a7b4c2', items:['Adaptador Simon','Feature flags','MIGRATION C4'] },
]

function RoadmapDropdown() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<number|null>(null)
  return (
    <div style={{position:'relative'}} data-atomic="molecule" data-component="RoadmapDropdown">
      <button type="button" onClick={() => setOpen(o => !o)}
        aria-expanded={open} aria-haspopup="true"
        aria-label="Ver roadmap de capas evolutivas"
        className="theme-toggle" style={{gap:6}}>
        <span className="material-symbols-outlined" aria-hidden="true" style={{fontSize:16}}>map</span>
        <span className="theme-toggle__label">Roadmap</span>
        <span className="material-symbols-outlined" aria-hidden="true" style={{fontSize:14}}>
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)}
            style={{position:'fixed',inset:0,zIndex:98}} aria-hidden="true"/>
          <div role="dialog" aria-label="Capas evolutivas del producto"
            style={{position:'absolute',top:'calc(100% + 8px)',right:0,zIndex:99,
              background:'var(--color-surface-container-high)',
              border:'1px solid var(--color-outline-variant)',
              borderRadius:12,width:300,overflow:'hidden',
              boxShadow:'0 8px 24px rgba(0,0,0,0.5)'}}>
            <div style={{padding:'8px 12px 6px',borderBottom:'1px solid var(--color-outline-variant)'}}>
              <span style={{fontSize:10,fontWeight:700,letterSpacing:'.06em',color:'var(--color-text-muted)'}}>
                CAPAS EVOLUTIVAS
              </span>
            </div>
            {LAYERS.map(layer => (
              <div key={layer.id} data-atomic="molecule">
                <button type="button"
                  onClick={() => setActive(active === layer.id ? null : layer.id)}
                  aria-expanded={active === layer.id}
                  style={{display:'flex',alignItems:'center',gap:8,padding:'10px 12px',
                    width:'100%',background:active===layer.id?'var(--color-surface-container-highest)':'none',
                    border:'none',cursor:'pointer',
                    borderBottom:'1px solid var(--color-outline-variant)',
                    transition:'background 200ms'}}>
                  <span style={{width:8,height:8,borderRadius:'50%',background:layer.color,flexShrink:0}} aria-hidden="true"/>
                  <span style={{fontSize:10,fontWeight:700,color:'var(--color-text-muted)',letterSpacing:'.04em'}}>{layer.label}</span>
                  <span style={{fontSize:12,fontWeight:500,color:'var(--color-text)',flex:1,textAlign:'left'}}>{layer.name}</span>
                  <span style={{fontSize:10,fontWeight:700,color:layer.color}}>
                    {layer.status==='live'?'● LIVE':layer.status==='next'?'◎ PRÓX':layer.status==='roadmap'?'○ ROAD':'○ FUT'}
                  </span>
                  <span className="material-symbols-outlined" aria-hidden="true" style={{fontSize:14,color:'var(--color-text-muted)'}}>
                    {active===layer.id ? 'expand_less' : 'chevron_right'}
                  </span>
                </button>
                {active === layer.id && (
                  <div style={{padding:'8px 12px 10px 28px',borderBottom:'1px solid var(--color-outline-variant)'}}>
                    <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:4}}>
                      {layer.items.map((item,i) => (
                        <li key={i} style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:'var(--color-text-muted)'}}>
                          <span style={{width:4,height:4,borderRadius:'50%',background:layer.color,flexShrink:0}} aria-hidden="true"/>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function AppHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header role="banner" data-atomic="organism" data-component="AppHeader" className="app-header">
      <div className="app-header__left" data-atomic="molecule">
        <button type="button" onClick={onMenuClick}
          aria-label="Abrir menú de vehículos" data-atomic="atom"
          className="app-header__menu-btn">
          <span className="material-symbols-outlined" aria-hidden="true">menu</span>
        </button>
        <div aria-hidden="true" data-atomic="atom" className="app-header__logo">
          <span className="material-symbols-outlined" style={{fontSize:16,color:'var(--color-bg)'}}>location_on</span>
        </div>
        <span data-atomic="molecule" className="app-header__brand">
          FleetControl<span className="app-header__brand-sub"> — Monitor en Tiempo Real</span>
        </span>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:8}} data-atomic="molecule">
        <RoadmapDropdown />
        <ThemeToggle />
      </div>
    </header>
  )
}
