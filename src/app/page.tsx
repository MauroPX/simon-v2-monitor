'use client'
import dynamic from 'next/dynamic'
import { AppHeader } from '@/components/ui/AppHeader'
import { DeviceSelector } from '@/components/ui/DeviceSelector'
import { StatusCard, StatusCardSkeleton } from '@/components/status/StatusCard'
import { RoadmapPanel } from '@/components/ui/RoadmapPanel'
import { useAppStore } from '@/store/useAppStore'

const VehicleMap = dynamic(
  () => import('@/components/map/VehicleMap').then(m => m.VehicleMap),
  { ssr: false, loading: () => <div style={{width:'100%',height:'100%',background:'var(--color-surface-2)'}} /> }
)

export default function HomePage() {
  const { appState } = useAppStore()
  const isLoading = appState === 'authenticating' || appState === 'loading-devices'
  return (
    <>
      <a href="#main-content" style={{position:'absolute',left:'-9999px',zIndex:9999,padding:'8px 16px',background:'var(--color-accent)',color:'var(--color-bg)',borderRadius:4,fontSize:14,textDecoration:'none',fontWeight:500}} onFocus={e=>{e.currentTarget.style.left='8px';e.currentTarget.style.top='8px'}} onBlur={e=>{e.currentTarget.style.left='-9999px'}}>
        Saltar al contenido principal
      </a>
      <div style={{display:'grid',gridTemplateRows:'48px 1fr',height:'100dvh',background:'var(--color-bg)',overflow:'hidden'}}>
        <AppHeader />
        <main id="main-content" role="main" style={{display:'grid',gridTemplateColumns:'240px 1fr',overflow:'hidden'}}>
          <nav style={{background:'var(--color-surface)',borderRight:'1px solid var(--color-border)',display:'flex',flexDirection:'column',overflow:'hidden'}}>
            <DeviceSelector />
          </nav>
          <section style={{display:'grid',gridTemplateRows:'1fr 220px',overflow:'hidden'}}>
            <div style={{position:'relative',overflow:'hidden'}}>
              {isLoading ? <div style={{width:'100%',height:'100%',background:'var(--color-surface-2)'}} /> : <VehicleMap />}
            </div>
            <div style={{background:'var(--color-surface)',borderTop:'1px solid var(--color-border)',padding:'14px 16px',overflow:'hidden'}}>
              {isLoading ? <StatusCardSkeleton /> : <StatusCard />}
            </div>
          </section>
        </main>
      </div>
      <RoadmapPanel />
    </>
  )
}
