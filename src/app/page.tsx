'use client'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { AppHeader } from '@/components/ui/AppHeader'
import { DeviceSelector } from '@/components/ui/DeviceSelector'
import { StatusCard, StatusCardSkeleton } from '@/components/status/StatusCard'
import { RoadmapPanel } from '@/components/ui/RoadmapPanel'
import { useAppStore } from '@/store/useAppStore'

const VehicleMap = dynamic(
  () => import('@/components/map/VehicleMap').then(m => m.VehicleMap),
  { ssr: false, loading: () => <MapSkeleton /> }
)

function MapSkeleton() {
  return (
    <div
      className="shimmer"
      aria-busy="true"
      aria-label="Cargando mapa"
      data-atomic="atom"
      style={{ width: '100%', height: '100%', minHeight: 240 }}
    />
  )
}

export default function HomePage() {
  const { appState } = useAppStore()
  const isLoading = appState === 'authenticating' || appState === 'loading-devices'
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      {/* WCAG 2.4.1 — Skip link */}
      <a
        href="#main-content"
        className="sr-only"
        style={{
          position: 'absolute', zIndex: 9999,
          padding: 'var(--space-2) var(--space-4)',
          background: 'var(--color-accent)', color: 'var(--color-bg)',
          borderRadius: 'var(--radius-xs)', fontSize: 'var(--md-sys-typescale-body-md-size)',
          textDecoration: 'none', fontWeight: 500,
        }}
        onFocus={e => { e.currentTarget.style.left = '8px'; e.currentTarget.style.top = '8px' }}
        onBlur={e => { e.currentTarget.style.left = '-9999px' }}
      >
        Saltar al contenido principal
      </a>

      {/* PAGE — data-atomic="page" */}
      <div className="app-layout" data-atomic="page">

        {/* ORGANISM — Header */}
        <AppHeader onMenuClick={() => setSidebarOpen(o => !o)} />

        {/* TEMPLATE — Main layout */}
        <main
          id="main-content"
          className="app-main"
          role="main"
          aria-label="Panel de control de flota vehicular"
          data-atomic="template"
        >
          {/* ORGANISM — Sidebar */}
          <nav
            className={`app-sidebar${sidebarOpen ? ' open' : ''}`}
            aria-label="Lista de vehículos de la flota"
            data-atomic="organism"
          >
            <DeviceSelector />
          </nav>

          {/* TEMPLATE — Content area */}
          <section
            className="app-content"
            aria-label="Monitoreo del vehículo seleccionado"
            data-atomic="template"
            style={{ minHeight: 0 }}
          >
            {/* ORGANISM — Map */}
            <div
              style={{ position: 'relative', overflow: 'hidden', minHeight: 200 }}
              data-atomic="organism"
            >
              {isLoading ? <MapSkeleton /> : <VehicleMap />}
            </div>

            {/* ORGANISM — Status panel */}
            <div
              className="status-panel-mobile"
              style={{
                background: 'var(--color-surface)',
                borderTop: '1px solid var(--color-border)',
                padding: 'var(--space-3) var(--space-4)',
              }}
              data-atomic="organism"
            >
              {isLoading ? <StatusCardSkeleton /> : <StatusCard />}
            </div>
          </section>
        </main>
      </div>

      {/* RoadmapPanel — fixed, fuera del layout */}
      <RoadmapPanel />
    </>
  )
}
