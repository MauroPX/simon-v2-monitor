'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect, type ReactNode } from 'react'
import { AppHeader } from '@/components/ui/AppHeader'
import { DeviceSelector } from '@/components/ui/DeviceSelector'
import { StatusCard, StatusCardSkeleton } from '@/components/status/StatusCard'
import { StateTestPanel } from '@/components/ui/StateTestPanel'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/hooks/useAuth'
import { useAppStoreV2 } from '@/store/useAppStoreV2'

const VehicleMap = dynamic(
  () => import('@/components/map/VehicleMap').then(m => m.VehicleMap),
  { ssr: false, loading: () => (
    <div role="status" aria-label="Cargando mapa"
      className="shimmer" style={{ width:'100%', height:'100%', minHeight:200 }}/>
  )}
)

const DashboardCapa2 = dynamic(
  () => import('@/components/dashboard/DashboardCapa2').then(m => m.DashboardCapa2),
  {
    ssr: false,
    loading: () => (
      <div className="shimmer" style={{ width: '100%', height: '100dvh' }} />
    ),
  }
)

const isLayer2 = process.env.NEXT_PUBLIC_APP_LAYER === 'capa-2'

function DemoFallbackProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const id = setTimeout(() => {
      const { connectionState, setConnectionState, setDataSource } = useAppStoreV2.getState()
      if (connectionState === 'connecting') {
        setConnectionState('demo')
        setDataSource('demo')
      }
    }, 8_000)
    return () => clearTimeout(id)
  }, [])

  return <>{children}</>
}

export default function HomePage() {
  useAuth()
  const { appState } = useAppStore()
  const isLoading = appState === 'authenticating' || appState === 'loading-devices'
  const selectedDeviceId = useAppStore(s => s.selectedDeviceId)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobilePage, setMobilePage] = useState<'list' | 'monitor'>('monitor')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 767)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Auto-navega a monitor al seleccionar un vehículo en mobile
  useEffect(() => {
    if (isMobile && selectedDeviceId) setMobilePage('monitor')
  }, [isMobile, selectedDeviceId])

  useEffect(() => {
    if (!sidebarOpen) return
    const handler = (e: MouseEvent) => {
      const sidebar = document.querySelector('.app-sidebar')
      if (sidebar && !sidebar.contains(e.target as Node)) setSidebarOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [sidebarOpen])

  if (isLayer2) return (
    <DemoFallbackProvider>
      <DashboardCapa2 />
    </DemoFallbackProvider>
  )

  // ── Mobile Capa 1 — 2 vistas con bottom nav ──
  if (isMobile) return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <a href="#main-content" className="skip-link">Saltar al contenido principal</a>
      <AppHeader onMenuClick={() => {}} />
      <div id="main-content" style={{ flex: 1, overflow: 'hidden' }}>
        {mobilePage === 'list' && (
          <div style={{ height: '100%', overflowY: 'auto', paddingBottom: 56 }}>
            <DeviceSelector />
          </div>
        )}
        {mobilePage === 'monitor' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, minHeight: 0 }}>
              {isLoading
                ? <div role="status" aria-label="Cargando mapa" className="shimmer" style={{ width: '100%', height: '100%', minHeight: 200 }} />
                : <VehicleMap />}
            </div>
            <div style={{ overflowY: 'auto', maxHeight: '40vh', paddingBottom: 56 }}>
              {isLoading ? <StatusCardSkeleton /> : <StatusCard />}
            </div>
          </div>
        )}
      </div>
      <nav
        role="tablist"
        aria-label="Vistas del monitor"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          height: 56, display: 'flex',
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          zIndex: 200,
        }}
      >
        {([
          { page: 'list'    as const, label: 'Lista',   icon: '≡' },
          { page: 'monitor' as const, label: 'Monitor', icon: '◎' },
        ]).map(({ page, label, icon }) => (
          <button
            key={page}
            role="tab"
            aria-selected={mobilePage === page}
            aria-label={label}
            onClick={() => setMobilePage(page)}
            style={{
              flex: 1, border: 'none', background: 'none',
              color: mobilePage === page ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontSize: 11,
              fontWeight: mobilePage === page ? 700 : 400,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 3, minHeight: 44, cursor: 'pointer',
              borderTop: mobilePage === page
                ? '2px solid var(--color-primary)'
                : '2px solid transparent',
            }}
          >
            <span style={{ fontSize: 20 }}>{icon}</span>
            {label}
          </button>
        ))}
      </nav>
    </div>
  )

  return (
    <>
      <a href="#main-content" className="skip-link">Saltar al contenido principal</a>

      <div className="app-layout" data-atomic="page" data-component="FleetMonitorPage">

        <AppHeader onMenuClick={() => setSidebarOpen(o => !o)} />

        <main id="main-content" className="app-main" role="main"
          aria-label="Panel de control de flota vehicular" data-atomic="template">

          <aside
            className={`app-sidebar${sidebarOpen ? ' open' : ''}`}
            aria-label="Lista de vehículos de la flota"
            data-atomic="organism"
          >
            <DeviceSelector />
          </aside>

          <div className="app-content" data-atomic="template">

            <div style={{ position:'relative', overflow:'hidden', minHeight:200 }}
              data-atomic="organism">
              {isLoading ? (
                <div role="status" aria-label="Cargando mapa"
                  className="shimmer" style={{ width:'100%', height:'100%', minHeight:200 }}/>
              ) : (
                <VehicleMap />
              )}
            </div>

            <div className="status-panel-mobile" data-atomic="organism">
              {isLoading ? <StatusCardSkeleton /> : <StatusCard />}
            </div>

          </div>
        </main>
      </div>

      <StateTestPanel />
    </>
  )
}
