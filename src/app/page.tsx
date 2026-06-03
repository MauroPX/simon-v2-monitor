'use client'
// src/app/page.tsx
// Página principal — ensamblaje de todos los componentes
// dynamic import del mapa con ssr: false (ADR-003 — Leaflet + SSR)

import dynamic from 'next/dynamic'
import { AppHeader } from '@/components/ui/AppHeader'
import { DeviceSelector } from '@/components/ui/DeviceSelector'
import { StatusCard, StatusCardSkeleton } from '@/components/status/StatusCard'
import { useAppStore } from '@/store/useAppStore'

// ── Leaflet solo en el cliente — NUNCA con SSR
// Sin este dynamic import, el build de Next.js falla con "window is not defined"
const VehicleMap = dynamic(
  () => import('@/components/map/VehicleMap').then((m) => m.VehicleMap),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  }
)

// ── Skeleton del mapa — mismas dimensiones que el mapa real (evita CLS)
function MapSkeleton() {
  return (
    <div
      className="shimmer"
      aria-busy="true"
      aria-label="Cargando mapa"
      style={{ width: '100%', height: '100%', minHeight: 300 }}
    />
  )
}

export default function HomePage() {
  const { appState } = useAppStore()
  const isLoading = appState === 'authenticating' || appState === 'loading-devices'

  return (
    // Skip navigation link — WCAG 2.4.1
    <>
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          zIndex: 9999,
          padding: '8px 16px',
          background: 'var(--color-accent)',
          color: '#fff',
          borderRadius: 4,
          fontSize: 14,
          textDecoration: 'none',
        }}
        onFocus={(e) => { e.currentTarget.style.left = '8px'; e.currentTarget.style.top = '8px' }}
        onBlur={(e) => { e.currentTarget.style.left = '-9999px' }}
      >
        Saltar al contenido principal
      </a>

      <div
        style={{
          display: 'grid',
          gridTemplateRows: '48px 1fr',
          height: '100dvh',
          background: 'var(--color-bg)',
          overflow: 'hidden',
        }}
      >
        <AppHeader />

        <main
          id="main-content"
          role="main"
          aria-label="Panel de control de flota vehicular"
          style={{
            display: 'grid',
            gridTemplateColumns: '260px 1fr',
            overflow: 'hidden',
          }}
        >
          {/* Sidebar — lista de vehículos */}
          <DeviceSelector />

          {/* Área principal — mapa + tarjeta de estado */}
          <section
            style={{
              display: 'grid',
              gridTemplateRows: '1fr 220px',
              overflow: 'hidden',
            }}
            aria-label="Monitoreo del vehículo seleccionado"
          >
            {/* Zona del mapa */}
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              {isLoading ? <MapSkeleton /> : <VehicleMap />}
            </div>

            {/* Tarjeta de estado — siempre visible, cambia según el estado */}
            <div
              style={{
                background: 'var(--color-surface)',
                borderTop: '1px solid var(--color-border)',
                padding: '14px 16px',
                overflow: 'hidden',
              }}
            >
              {isLoading ? <StatusCardSkeleton /> : <StatusCard />}
            </div>
          </section>
        </main>
      </div>
    </>
  )
}
