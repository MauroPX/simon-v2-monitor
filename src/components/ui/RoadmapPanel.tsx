'use client'
import { useState } from 'react'

const LAYERS = [
  {
    id: 1,
    name: 'Capa 1 — Mock',
    status: 'done',
    label: 'LIVE',
    color: '#00ffc2',
    items: [
      'UI completa con tokens Simon Movilidad',
      'WCAG 2.1 AA — dl/dt/dd + aria-live + focus-visible',
      'Dark/Light mode con paleta #050505 → #4EEAC4',
      'Estados: Loading skeleton · Error empático · Tracking',
      'Marcador SVG rotante con requestAnimationFrame',
      'Deploy en Netlify con proxy CORS activo',
      '4 vehículos simulados con movimiento cada 5s',
      'Batería crítica <20% con Von Restorff visual',
      'prefers-reduced-motion implementado',
    ],
  },
  {
    id: 2,
    name: 'Capa 2 — Demo',
    status: 'next',
    label: 'PRÓXIMO',
    color: '#19b5ff',
    items: [
      'Login real contra Traccar demo4.traccar.org',
      'Lista de dispositivos reales (20-50 vehículos)',
      'Posiciones GPS reales con polling 5s',
      'Cookie JSESSIONID manejada por proxy Netlify',
      'Error state cuando demo4 cae (frecuente)',
      'Fallback automático a última posición conocida',
    ],
  },
  {
    id: 3,
    name: 'Capa 3 — MVP',
    status: 'roadmap',
    label: 'ROADMAP',
    color: '#ffb547',
    items: [
      'Servidor Traccar propio de Simon Movilidad',
      'WebSocket /api/socket en lugar de polling',
      'Múltiples vehículos simultáneos en el mapa',
      'Alertas: speeding · geofence · batería baja',
      'Shift summary al login — contexto del turno',
      'Atajos de teclado: Esc · / para búsqueda',
      'Heatmap de velocidad en replay de ruta',
      'Tests E2E con Playwright',
    ],
  },
  {
    id: 4,
    name: 'Capa 4 — Legacy/C',
    status: 'roadmap',
    label: 'FUTURO',
    color: '#a7b4c2',
    items: [
      'Adaptador simon.ts — mapeo de contrato API propio',
      'API propia Simon Movilidad (no Traccar)',
      'Sin cambios en componentes UI — solo el adaptador',
      'Migración gradual campo por campo con feature flags',
      'MIGRATION_DOCUMENT por cada campo migrado',
      'Rollback automático si el adaptador falla',
    ],
  },
]

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  done:    { bg: 'rgba(78,234,196,0.15)', text: '#00ffc2' },
  next:    { bg: 'rgba(59,130,246,0.15)', text: '#19b5ff' },
  roadmap: { bg: 'rgba(245,158,11,0.15)', text: '#ffb547' },
}

export function RoadmapPanel() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(1)

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 2000,
      fontFamily: 'var(--font-sans)',
    }}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Cerrar roadmap' : 'Ver roadmap del producto'}
        aria-expanded={open}
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-accent)',
          color: 'var(--color-accent)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          fontSize: 11, fontWeight: 500,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: '0 2px 12px rgba(78,234,196,0.2)',
          marginLeft: 'auto',
        }}>
        <span aria-hidden="true">{open ? '✕' : '🗺️'}</span>
        {open ? 'Cerrar' : 'Roadmap & Docs'}
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Roadmap del producto — 4 capas evolutivas"
          style={{
            position: 'absolute', bottom: 40, right: 0,
            width: 340,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border-2)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            animation: 'fade-in 0.2s ease forwards',
          }}>
          {/* Header */}
          <div style={{
            padding: '12px 14px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--color-text)' }}>
                Roadmap del Producto
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>
                4 capas evolutivas — simon-v2-monitor
              </div>
            </div>
            {/* Progress bar */}
            <div style={{ display: 'flex', gap: 3 }}>
              {LAYERS.map(l => (
                <div key={l.id} style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: l.status === 'done' ? '#00ffc2'
                    : l.status === 'next' ? '#19b5ff' : 'var(--color-border-2)',
                }} aria-hidden="true"/>
              ))}
            </div>
          </div>

          {/* Layers */}
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {LAYERS.map(layer => (
              <div key={layer.id}
                style={{ borderBottom: '1px solid var(--color-border)' }}>
                {/* Layer header */}
                <button
                  onClick={() => setExpanded(expanded === layer.id ? null : layer.id)}
                  aria-expanded={expanded === layer.id}
                  style={{
                    width: '100%', background: 'none', border: 'none',
                    padding: '10px 14px',
                    display: 'flex', alignItems: 'center', gap: 10,
                    cursor: 'pointer', textAlign: 'left',
                  }}>
                  {/* Number */}
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: `${layer.color}22`,
                    border: `1px solid ${layer.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 600, color: layer.color,
                    flexShrink: 0,
                  }}>{layer.id}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text)' }}>
                      {layer.name}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: 600, padding: '2px 7px',
                    borderRadius: 20,
                    background: STATUS_STYLE[layer.status].bg,
                    color: STATUS_STYLE[layer.status].text,
                  }}>{layer.label}</span>
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                    {expanded === layer.id ? '▲' : '▼'}
                  </span>
                </button>

                {/* Items */}
                {expanded === layer.id && (
                  <ul style={{ margin: 0, padding: '0 14px 10px 46px', listStyle: 'none' }}>
                    {layer.items.map((item, i) => (
                      <li key={i} style={{
                        fontSize: 11, color: 'var(--color-text-muted)',
                        padding: '3px 0',
                        display: 'flex', alignItems: 'flex-start', gap: 6,
                        lineHeight: 1.4,
                      }}>
                        <span aria-hidden="true" style={{
                          color: layer.color, flexShrink: 0, marginTop: 1,
                        }}>
                          {layer.status === 'done' ? '✓' : '○'}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            padding: '8px 14px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
              Capa activa: <span style={{ color: '#00ffc2', fontWeight: 500 }}>Mock</span>
            </span>
            <a href="https://github.com/MauroPX/simon-v2-monitor"
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 10, color: 'var(--color-accent)', textDecoration: 'none' }}>
              Ver código →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
