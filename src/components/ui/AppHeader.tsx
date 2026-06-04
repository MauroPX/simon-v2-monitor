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
  { id:1, label:'Capa 1', name:'Mock',   status:'live',    color:'#00ffc2', items:['DS v3.0 Simon','M3 surface containers','WCAG 2.2 AAA','4 vehículos mock','Leaflet + lerp()','Dark/Light mode'] },
  { id:2, label:'Capa 2', name:'Demo',   status:'next',    color:'#19b5ff', items:['Auth Traccar demo4','Estado connecting','Estado stale','Error HTTP + retry','ADR-009'] },
  { id:3, label:'Capa 3', name:'MVP',    status:'roadmap', color:'#ffb547', items:['WebSocket nativo','Alertas velocidad','Rastro SVG','Cluster marcadores','SPRINT 3'] },
  { id:4, label:'Capa 4', name:'Legacy', status:'future',  color:'#a7b4c2', items:['Adaptador simon.ts','Dual-source toggle','Feature flags','MIGRATION C4'] },
]
const STATUS: Record<string,string> = { live:'● LIVE', next:'◎ PRÓX', roadmap:'○ ROAD', future:'○ FUT' }

let _open = false
let _active: number|null = null

function RoadmapSplitButton() {
  const [, tick] = useState(0)
  const rerender = () => tick(n => n + 1)

  const toggle = () => { _open = !_open; rerender() }
  const close  = () => { _open = false;  rerender() }
  const setActive = (id: number) => { _active = _active === id ? null : id; rerender() }

  return (
    <div style={{position:'relative'}} data-atomic="molecule" data-component="RoadmapSplitButton">

      <div style={{display:'flex',alignItems:'center',border:'1px solid var(--color-outline)',borderRadius:40,background:'var(--color-surface-container-high)'}}>
        <button type="button" aria-label="Roadmap de capas evolutivas"
          style={{display:'flex',alignItems:'center',gap:6,padding:'0 12px 0 16px',height:40,background:'transparent',border:'none',borderRight:'1px solid var(--color-outline-variant)',cursor:'default',color:'var(--color-text)'}}>
          <span className="material-symbols-outlined" aria-hidden="true" style={{fontSize:16,color:'var(--color-accent)'}}>layers</span>
          <span style={{fontSize:12,fontWeight:500}}>Roadmap</span>
          <span style={{fontSize:9,fontWeight:700,padding:'2px 6px',background:'rgba(0,255,194,0.12)',color:'#00ffc2',borderRadius:20}}>C1 LIVE</span>
        </button>
        <button type="button" onClick={toggle}
          aria-expanded={_open} aria-haspopup="listbox" aria-label="Ver capas del roadmap"
          style={{display:'flex',alignItems:'center',justifyContent:'center',width:36,height:40,background:_open?'var(--color-accent-dim)':'transparent',border:'none',cursor:'pointer',borderRadius:'0 40px 40px 0',transition:'background 150ms'}}>
          <span className="material-symbols-outlined" aria-hidden="true" style={{fontSize:18,color:'var(--color-text-muted)'}}>
            {_open ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      </div>

      {_open && (
        <>
          <div role="listbox" aria-label="Capas evolutivas"
            style={{position:'fixed',top:50,right:16,zIndex:9999,width:288,background:'var(--color-surface-container-high)',border:'1px solid var(--color-outline-variant)',borderRadius:12,overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.6)'}}>
            <div style={{padding:'8px 12px 6px',borderBottom:'1px solid var(--color-outline-variant)'}}>
              <span style={{fontSize:10,fontWeight:700,letterSpacing:'.06em',color:'var(--color-text-muted)'}}>CAPAS EVOLUTIVAS</span>
            </div>
            {LAYERS.map(layer => (
              <div key={layer.id} role="option" aria-selected={_active===layer.id}>
                <button type="button" onClick={() => setActive(layer.id)}
                  aria-expanded={_active===layer.id}
                  style={{display:'flex',alignItems:'center',gap:8,padding:'10px 12px',width:'100%',background:_active===layer.id?'var(--color-surface-container-highest)':'transparent',border:'none',cursor:'pointer',borderBottom:'1px solid var(--color-outline-variant)',transition:'background 150ms'}}>
                  <span style={{width:8,height:8,borderRadius:'50%',background:layer.color,flexShrink:0}} aria-hidden="true"/>
                  <span style={{fontSize:10,fontWeight:700,color:'var(--color-text-muted)',minWidth:40}}>{layer.label}</span>
                  <span style={{fontSize:12,fontWeight:500,color:'var(--color-text)',flex:1,textAlign:'left'}}>{layer.name}</span>
                  <span style={{fontSize:10,fontWeight:700,color:layer.color}}>{STATUS[layer.status]}</span>
                  <span className="material-symbols-outlined" aria-hidden="true" style={{fontSize:14,color:'var(--color-text-muted)'}}>
                    {_active===layer.id ? 'expand_less' : 'chevron_right'}
                  </span>
                </button>
                {_active===layer.id && (
                  <div style={{padding:'6px 12px 10px 28px',borderBottom:'1px solid var(--color-outline-variant)'}}>
                    <ul style={{listStyle:'none',margin:0,padding:0,display:'flex',flexDirection:'column',gap:3}}>
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
          <div onClick={close} style={{position:'fixed',inset:0,zIndex:9998}} aria-hidden="true"/>
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
          aria-label="Abrir menú de vehículos" data-atomic="atom" className="app-header__menu-btn">
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
        <RoadmapSplitButton />
        <ThemeToggle />
      </div>
    </header>
  )
}
