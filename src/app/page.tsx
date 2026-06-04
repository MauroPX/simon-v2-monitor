'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/ui/AppHeader'
import { DeviceSelector } from '@/components/ui/DeviceSelector'
import { StatusCard, StatusCardSkeleton } from '@/components/status/StatusCard'
import { RoadmapPanel } from '@/components/ui/RoadmapPanel'
import { StateTestPanel } from '@/components/ui/StateTestPanel'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/hooks/useAuth'

const VehicleMap = dynamic(
  () => import('@/components/map/VehicleMap').then(m => m.VehicleMap),
  { ssr: false, loading: () => (
    <div role="status" aria-label="Cargando mapa"
      className="shimmer" style={{ width:'100%', height:'100%', minHeight:200 }}/>
  )}
)

export default function HomePage() {
  useAuth()
  const { appState } = useAppStore()
  const isLoading = appState === 'authenticating' || appState === 'loading-devices'
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!sidebarOpen) return
    const handler = (e: MouseEvent) => {
      const sidebar = document.querySelector('.app-sidebar')
      if (sidebar && !sidebar.contains(e.target as Node)) setSidebarOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [sidebarOpen])

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

      <RoadmapPanel />
      <StateTestPanel />
    </>
  )
}
