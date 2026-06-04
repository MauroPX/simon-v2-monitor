'use client'
import { useState } from 'react'

const LAYERS = [
  { id:1, label:'Capa 1', name:'Mock', status:'live', color:'#00ffc2',
    desc:'UI completa con datos simulados. DS v3.0, M3 tokens, WCAG 2.2 AAA.',
    items:['DS v3.0 Simon Movilidad','M3 surface containers','WCAG 2.2 AAA','4 vehículos mock','Mapa Leaflet','StatusCard telemetría','Dark/Light mode'] },
  { id:2, label:'Capa 2', name:'Demo', status:'next', color:'#19b5ff',
    desc:'Conexión a demo4.traccar.org. Estados connecting y stale.',
    items:['Credenciales Traccar','Estado connecting','Estado stale','Error handling HTTP','Badge fuente de datos','ADR-009','MIGRATION_DOCUMENT C2'] },
  { id:3, label:'Capa 3', name:'MVP', status:'roadmap', color:'#ffb547',
    desc:'WebSocket nativo. Alertas. Rastro de ruta. Instancia propia.',
    items:['WebSocket tiempo real','Alertas velocidad','Alertas geocerca','Rastro SVG','Instancia Traccar','Cluster marcadores','SPRINT_3_REPORT'] },
  { id:4, label:'Capa 4', name:'Legacy', status:'future', color:'#a7b4c2',
    desc:'Adaptador API Simon Movilidad. Migración sin downtime.',
    items:['Adaptador simon.ts','Dual-source toggle','Feature flags','MIGRATION_DOC C4','POSTMORTEM template'] },
]

const STATUS_LABEL: Record<string,string> = {
  live:'● LIVE', next:'◎ PRÓXIMO', roadmap:'○ ROADMAP', future:'○ FUTURO'
}

/**
 * RoadmapPanel — organism
 * @description Panel flotante con roadmap de 4 capas evolutivas.
 * Usa botón nativo para garantizar accesibilidad por teclado (WCAG 2.1.1).
 */
export function RoadmapPanel() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<number|null>(null)

  return (
    <div
      data-atomic="organism"
      data-component="RoadmapPanel"
      className="roadmap-panel"
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="roadmap-content"
        aria-label="Abrir panel de roadmap y documentación"
        className="roadmap-panel__trigger"
        data-atomic="atom"
      >
        <span className="material-symbols-outlined" aria-hidden="true">map</span>
        <span className="roadmap-panel__trigger-label">Roadmap & Docs</span>
        <span className="material-symbols-outlined" aria-hidden="true" style={{fontSize:16}}>
          {open ? 'expand_more' : 'chevron_left'}
        </span>
      </button>

      {open && (
        <div
          id="roadmap-content"
          role="dialog"
          aria-label="Panel de roadmap evolutivo"
          className="roadmap-panel__content"
          data-atomic="template"
        >
          <div className="roadmap-panel__header" data-atomic="molecule">
            <span className="roadmap-panel__title">Capas Evolutivas</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar panel de roadmap"
              className="roadmap-panel__close"
              data-atomic="atom"
            >
              <span className="material-symbols-outlined" aria-hidden="true" style={{fontSize:18}}>close</span>
            </button>
          </div>

          <div className="roadmap-panel__layers" data-atomic="organism">
            {LAYERS.map(layer => (
              <div
                key={layer.id}
                data-atomic="molecule"
                className={`roadmap-layer roadmap-layer--${layer.status}${active===layer.id?' roadmap-layer--expanded':''}`}
              >
                <button
                  type="button"
                  onClick={() => setActive(active === layer.id ? null : layer.id)}
                  className="roadmap-layer__header"
                  aria-expanded={active === layer.id}
                  aria-label={`${layer.label} ${layer.name} — ${layer.status}`}
                  data-atomic="atom"
                >
                  <span
                    className="roadmap-layer__dot"
                    style={{ background: layer.color }}
                    aria-hidden="true"
                  />
                  <span className="roadmap-layer__label">{layer.label}</span>
                  <span className="roadmap-layer__name">{layer.name}</span>
                  <span className="roadmap-layer__status" style={{ color: layer.color }}>
                    {STATUS_LABEL[layer.status]}
                  </span>
                </button>

                {active === layer.id && (
                  <div className="roadmap-layer__detail" data-atomic="molecule">
                    <p className="roadmap-layer__desc">{layer.desc}</p>
                    <ul className="roadmap-layer__items" aria-label={`Ítems de ${layer.name}`}>
                      {layer.items.map((item, i) => (
                        <li key={i} className="roadmap-layer__item" data-atomic="atom">
                          <span
                            className="roadmap-layer__item-dot"
                            style={{ background: layer.color }}
                            aria-hidden="true"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
