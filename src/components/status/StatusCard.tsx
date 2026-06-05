'use client'
import React from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useTraccarPosition } from '@/hooks/useTraccar'
import { knotsToKmh, courseToCardinal, getBatteryState } from '@/lib/utils'

/**
 * StatusCardSkeleton — atom (estado: loading)
 * @description Placeholder shimmer mientras cargan datos del vehículo.
 * WCAG 4.1.3: aria-busy + aria-live notifican al lector de pantalla.
 * M3 tokens: usa --color-surface-container y --color-surface-container-high.
 */
export function StatusCardSkeleton() {
  return (
    <div role="status" aria-label="Cargando datos del vehículo"
      data-atomic="organism" data-component="StatusCard" data-state="loading"
      className="status-card status-card--loading">
      <div className="status-card__grid">
        {['vehicle','state','speed','battery'].map(k=>(
          <div key={k} className="status-card__cell">
            <div className="status-card__shimmer status-card__shimmer--label shimmer"/>
            <div className="status-card__shimmer status-card__shimmer--value shimmer"/>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * StatusCard — organism
 * @description Panel de telemetría del vehículo seleccionado.
 * Estados: empty | loading | error | tracking.
 * WCAG 1.3.1: dl/dt/dd para datos estructurados.
 * WCAG 4.1.3: aria-live=polite para actualizaciones en tiempo real.
 * M3 tokens: surface-container roles para jerarquía visual.
 */
export function StatusCard() {
  const { selectedDeviceId, selectDevice, devices, appState } = useAppStore()
  
  // Estados forzados desde StateTestPanel (?demo=true)
  const [demoError, setDemoError] = React.useState(false)
  React.useEffect(() => {
    const onErr   = () => setDemoError(true)
    const onClear = () => setDemoError(false)
    window.addEventListener('simon-demo-error', onErr)
    window.addEventListener('simon-demo-clear', onClear)
    return () => {
      window.removeEventListener('simon-demo-error', onErr)
      window.removeEventListener('simon-demo-clear', onClear)
    }
  }, [])
  const isForcedLoading = appState === 'loading-devices'
  const isForcedError   = demoError
  const { position: pos, isLoading, isError } = useTraccarPosition()
  const device = devices.find(d=>d.id===selectedDeviceId)

  if (isForcedLoading) return <StatusCardSkeleton/>

  if (isForcedError) return (
    <div role="alert" data-atomic="organism" data-component="StatusCard" data-state="error"
      className="status-card status-card--error"
      style={{display:'flex',alignItems:'center',justifyContent:'center',gap:16,padding:'0 24px'}}>
      <span className="material-symbols-outlined" aria-hidden="true"
        style={{fontSize:24,color:'var(--color-danger)',flexShrink:0}}>wifi_off</span>
      <div style={{flex:1}}>
        <p style={{fontSize:13,fontWeight:500,color:'var(--color-danger)',margin:0}}>
          No pudimos conectar con el servidor.
        </p>
        <p style={{fontSize:11,color:'var(--color-text-muted)',margin:'2px 0 0'}}>
          Verifica tu conexión e intenta de nuevo.
        </p>
      </div>
      <button
        type="button"
        onClick={() => { useAppStore.getState().setAppState('idle'); if(devices[0]) selectDevice(devices[0].id) }}
        className="status-card__retry-btn"
        aria-label="Reintentar conexión con el servidor"
        data-atomic="atom"
        style={{flexShrink:0}}>
        <span className="material-symbols-outlined" aria-hidden="true" style={{fontSize:16,verticalAlign:'middle',marginRight:4}}>refresh</span>
        Reintentar
      </button>
    </div>
  )

  if (!selectedDeviceId) return (
    <div data-atomic="organism" data-component="StatusCard" data-state="empty"
      className="status-card status-card--empty" aria-label="Sin vehículo seleccionado">
      <p className="status-card__empty-msg">Selecciona un vehículo para ver su telemetría</p>
    </div>
  )

  if (isLoading) return <StatusCardSkeleton/>

  if (isError) return (
    <div role="alert" data-atomic="organism" data-component="StatusCard" data-state="error"
      className="status-card status-card--error">
      <p className="status-card__error-msg">Error al cargar la telemetría.</p>
    </div>
  )

  const speed    = pos ? Math.round(knotsToKmh(pos.speed)) : 0
  const heading  = pos ? courseToCardinal(pos.course) : '—'
  const batPct   = (device as any)?.attributes?.batteryLevel ?? (device as any)?.attributes?.battery ?? null
  const batState = batPct !== null ? getBatteryState(batPct) : null
  const isOnline = device?.status === 'online'
  const batClass = batState==='critical'?'critical':batState==='warning'?'low':'good'

  return (
    <section aria-label={`Estado del vehículo ${device?.name??''}`}
      aria-live="polite" data-atomic="organism" data-component="StatusCard"
      data-state="tracking" className="status-card status-card--tracking">
      <dl className="status-card__grid">
        <div className="status-card__cell">
          <dt className="status-card__label">VEHÍCULO</dt>
          <dd className="status-card__value">{device?.name??'—'}</dd>
          {device?.contact&&<dd className="status-card__sub">{device.contact}</dd>}
        </div>
        <div className="status-card__cell">
          <dt className="status-card__label">ESTADO</dt>
          <dd className="status-card__value">
            <span className={`status-card__dot status-card__dot--${isOnline?'online':'offline'}`} aria-hidden="true"/>
            {isOnline?'En línea':'Offline'}
          </dd>
          <dd className="status-card__sub">{pos?'Ahora mismo':'—'}</dd>
        </div>
        <div className="status-card__cell">
          <dt className="status-card__label">VELOCIDAD</dt>
          <dd className="status-card__value">
            {speed}<span className="status-card__unit"> km/h</span>
          </dd>
          {pos&&<dd className="status-card__sub">Rumbo {heading} · {pos.course}°</dd>}
        </div>
        <div className="status-card__cell">
          <dt className="status-card__label">BATERÍA</dt>
          <dd className="status-card__value">
            {batState&&(
              <div role="progressbar" aria-valuenow={batPct??0}
                aria-valuemin={0} aria-valuemax={100}
                aria-label={`Batería al ${batPct??0}%`}
                className={`status-card__battery status-card__battery--${batClass}`}>
                <div className="status-card__battery-fill" style={{width:`${batPct??0}%`}}/>
              </div>
            )}
            <span>{batPct!==null?`${batPct}%`:'—'}</span>
          </dd>
        </div>
      </dl>
    </section>
  )
}
