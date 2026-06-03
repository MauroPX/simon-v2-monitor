'use client'
import { useEffect, useRef, useState } from 'react'
import { useAppStore, useSelectedDevice } from '@/store/useAppStore'
import { useTraccarPosition } from '@/hooks/useTraccar'
import { knotsToKmh, courseToCardinal, getBatteryState, timeAgo } from '@/lib/utils'

export function StatusCardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando datos del vehículo" data-atomic="organism"
      className="status-grid-responsive" style={{ height:'100%' }}>
      {[0,1,2,3].map(i => (
        <div key={i} style={{ display:'flex', flexDirection:'column', gap:'var(--space-1)' }}>
          <div className="shimmer" style={{ height:10, width:'55%', borderRadius:4 }}/>
          <div className="shimmer" style={{ height:24, width:'75%', borderRadius:4 }}/>
          <div className="shimmer" style={{ height:9, width:'45%', borderRadius:4 }}/>
        </div>
      ))}
    </div>
  )
}

function AnimatedValue({ value, large }: { value: string; large?: boolean }) {
  const [flash, setFlash] = useState(false)
  const prev = useRef(value)
  useEffect(() => {
    if (value !== prev.current) {
      prev.current = value
      setFlash(true)
      const t = setTimeout(() => setFlash(false), 400)
      return () => clearTimeout(t)
    }
  }, [value])
  return (
    <span style={{ color: flash ? 'var(--color-accent)' : 'var(--color-text)',
      transition:'color 0.4s ease', fontSize: large ? 15 : 20,
      fontWeight: large ? 500 : 600, lineHeight:1.2 }}>
      {value}
    </span>
  )
}

function PulseDot({ isOnline }: { isOnline: boolean }) {
  return (
    <span aria-hidden="true" style={{ width:9, height:9, borderRadius:'50%',
      flexShrink:0, display:'inline-block',
      background: isOnline ? 'var(--color-online)' : 'var(--color-offline)',
      animation: isOnline ? 'pulse-ring 2s ease-in-out infinite' : 'none' }}/>
  )
}

function BatteryBar({ level }: { level: number }) {
  const state = getBatteryState(level)
  const color = state === 'critical' ? 'var(--color-danger)'
    : state === 'warning' ? 'var(--color-warning)' : 'var(--color-online)'
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'var(--space-1)' }}>
      <div role="progressbar" aria-valuenow={level} aria-valuemin={0} aria-valuemax={100}
        aria-label={`Batería al ${level}%`}
        style={{ width:34, height:13, border:`1.5px solid ${color}`,
          borderRadius:3, position:'relative', flexShrink:0 }}>
        <span aria-hidden="true" style={{ position:'absolute', right:-4, top:'50%',
          transform:'translateY(-50%)', width:3, height:6,
          background:color, borderRadius:'0 2px 2px 0' }}/>
        <div style={{ height:'100%', width:`${Math.max(0,Math.min(100,level))}%`,
          background:color, borderRadius:1,
          transition:'width 0.4s var(--ease-standard)' }}/>
      </div>
      <span style={{ fontSize:'var(--md-sys-typescale-body-sm-size)', fontWeight:500,
        color: state === 'critical' ? 'var(--color-danger)' : 'var(--color-text)' }}>
        {level}%
      </span>
    </div>
  )
}

export function StatusCard() {
  const device = useSelectedDevice()
  const { appState } = useAppStore()
  const { position, isLoading, isError, error, lastSuccessTime } = useTraccarPosition()

  if (!device) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      color:'var(--color-text-muted)', fontSize:'var(--md-sys-typescale-label-md-size)', height:'100%' }}>
      Selecciona un vehículo para ver su telemetría
    </div>
  )

  if (isLoading && !position) return <StatusCardSkeleton />

  const speedKmh = position ? knotsToKmh(position.speed) : 0
  const cardinal = position ? courseToCardinal(position.course) : '—'
  const battery = position?.attributes?.batteryLevel ?? position?.attributes?.battery ?? null
  const lastUpdate = position ? timeAgo(position.fixTime) : '—'
  const isOnline = device.status === 'online'

  return (
    <section aria-label={`Estado del vehículo ${device.name}`} data-atomic="organism">
      {isError && error && (
        <div role="alert" aria-live="assertive"
          style={{ background:'var(--color-danger-dim)', border:'1px solid var(--color-danger)',
            borderRadius:'var(--radius-sm)', padding:'7px 12px', display:'flex',
            alignItems:'center', gap:'var(--space-2)', marginBottom:'var(--space-2)', fontSize:'var(--md-sys-typescale-label-md-size)' }}>
          <span aria-hidden="true">⚠️</span>
          <span style={{ flex:1 }}>
            {isError && lastSuccessTime > 0
              ? `Datos de ${timeAgo(new Date(lastSuccessTime).toISOString())} — Reintentando...`
              : error}
          </span>
        </div>
      )}
      <dl aria-live="polite" aria-atomic="false"
        aria-label="Telemetría en tiempo real"
        className="status-grid-responsive" style={{ margin:0 }}>
        <div>
          <dt style={{ fontSize:'var(--md-sys-typescale-label-sm-size)', fontWeight:500, textTransform:'uppercase',
            letterSpacing:'.06em', color:'var(--color-text-muted)', marginBottom:5 }}>
            Vehículo
          </dt>
          <dd style={{ margin:0 }}>
            <AnimatedValue value={device.name} large />
          </dd>
          <p style={{ fontSize:'var(--md-sys-typescale-label-sm-size)', color:'var(--color-text-muted)', marginTop:'var(--space-1)' }}>
            {String(device.attributes?.driver ?? 'Sin conductor')}
          </p>
        </div>

        <div>
          <dt style={{ fontSize:'var(--md-sys-typescale-label-sm-size)', fontWeight:500, textTransform:'uppercase',
            letterSpacing:'.06em', color:'var(--color-text-muted)', marginBottom:5 }}>
            Estado
          </dt>
          <dd style={{ margin:0, display:'flex', alignItems:'center', gap:'var(--space-1)',
            fontSize:'var(--md-sys-typescale-headline-size)', fontWeight:600, lineHeight:1.2 }}>
            <PulseDot isOnline={isOnline} />
            <AnimatedValue value={isOnline ? 'En línea' : 'Offline'} large />
          </dd>
          <p style={{ fontSize:'var(--md-sys-typescale-label-sm-size)', color:'var(--color-text-muted)', marginTop:'var(--space-1)' }}>
            {isError && lastSuccessTime > 0
              ? `Datos de ${timeAgo(new Date(lastSuccessTime).toISOString())}`
              : lastUpdate}
          </p>
        </div>

        <div>
          <dt style={{ fontSize:'var(--md-sys-typescale-label-sm-size)', fontWeight:500, textTransform:'uppercase',
            letterSpacing:'.06em', color:'var(--color-text-muted)', marginBottom:5 }}>
            Velocidad
          </dt>
          <dd style={{ margin:0, display:'flex', alignItems:'baseline', gap:'var(--space-1)',
            fontSize:'var(--md-sys-typescale-headline-size)', fontWeight:600, lineHeight:1.2 }}>
            <AnimatedValue value={speedKmh.toFixed(1)} />
            <small style={{ fontSize:'var(--md-sys-typescale-label-sm-size)', fontWeight:400,
              color:'var(--color-text-muted)' }}>km/h</small>
          </dd>
          <p style={{ fontSize:'var(--md-sys-typescale-label-sm-size)', color:'var(--color-text-muted)', marginTop:'var(--space-1)' }}>
            Rumbo {cardinal}{position ? ` · ${Math.round(position.course)}°` : ''}
          </p>
        </div>

        <div>
          <dt style={{ fontSize:'var(--md-sys-typescale-label-sm-size)', fontWeight:500, textTransform:'uppercase',
            letterSpacing:'.06em', color:'var(--color-text-muted)', marginBottom:5 }}>
            Batería
          </dt>
          <dd style={{ margin:0 }}>
            {battery !== null
              ? <BatteryBar level={battery} />
              : <span style={{ fontSize:'var(--md-sys-typescale-body-sm-size)', color:'var(--color-text-muted)' }}>N/D</span>}
          </dd>
          <p style={{ fontSize:'var(--md-sys-typescale-label-sm-size)', color:'var(--color-text-muted)', marginTop:'var(--space-1)' }}>
            {position?.attributes?.fuel !== undefined
              ? `Combustible: ${position.attributes.fuel}%` : ''}
          </p>
        </div>
      </dl>
    </section>
  )
}
