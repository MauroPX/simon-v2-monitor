'use client'

import { useRef, useState, useCallback, type ReactNode } from 'react'
import { useAppStoreV2 } from '@/store/useAppStoreV2'
import { AppHeader } from '@/components/ui/AppHeader'
import styles from './DashboardLayout.module.css'

interface Props {
  sidebar: ReactNode
  map: ReactNode
  panel: ReactNode
}

const SNAP_PEEK = 50  // vh — sheet translated 50vh down, showing 40vh
const SNAP_FULL = 0   // vh — sheet at top, showing 90vh
const SNAP_MID  = 25  // vh — snap threshold

export function DashboardLayout({ sidebar, map, panel }: Props) {
  const { layerOrder } = useAppStoreV2()
  const [sheetOpen, setSheetOpen] = useState(false)

  const sheetRef     = useRef<HTMLDivElement>(null)
  const sheetOpenRef = useRef(false)     // mirrors state for callbacks (avoids stale closure)
  const translateRef = useRef(SNAP_PEEK)
  const dragRef      = useRef<{ startY: number; startTranslate: number } | null>(null)
  const wasTouchRef  = useRef(false)     // prevents click-after-touchend duplication

  const applyTranslate = (vh: number) => {
    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${vh}vh)`
    }
  }

  const snapTo = useCallback((open: boolean) => {
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'transform 300ms cubic-bezier(0.2,0,0,1)'
    }
    const target = open ? SNAP_FULL : SNAP_PEEK
    applyTranslate(target)
    translateRef.current = target
    sheetOpenRef.current = open
    setSheetOpen(open)
  }, [])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    wasTouchRef.current = true
    dragRef.current = {
      startY:         e.touches[0].clientY,
      startTranslate: sheetOpenRef.current ? SNAP_FULL : SNAP_PEEK,
    }
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'none'
    }
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragRef.current) return
    const deltaY   = e.touches[0].clientY - dragRef.current.startY
    const vhDelta  = (deltaY / window.innerHeight) * 100
    const next     = Math.max(SNAP_FULL, Math.min(SNAP_PEEK, dragRef.current.startTranslate + vhDelta))
    translateRef.current = next
    applyTranslate(next)
  }, [])

  const onTouchEnd = useCallback(() => {
    if (!dragRef.current) return
    dragRef.current = null
    snapTo(translateRef.current < SNAP_MID)
    setTimeout(() => { wasTouchRef.current = false }, 400)
  }, [snapTo])

  const handleClick = useCallback(() => {
    if (wasTouchRef.current) return  // synthetic click from touch — already handled
    snapTo(!sheetOpenRef.current)
  }, [snapTo])

  // Map layerOrder keys to slot content
  const slots: Record<string, ReactNode> = {
    'vehicle-list': sidebar,
    'status-card':  panel,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <AppHeader onMenuClick={() => {}} />

      {/* ── Desktop 3-column grid ── */}
      <div
        className={styles.dashboard}
        style={{ flex: 1, minHeight: 0 }}
        data-atomic="template"
        data-component="DashboardLayout"
      >
        <aside
          className={styles.dashboard__sidebar}
          role="region"
          aria-label="Lista de vehículos"
        >
          {sidebar}
        </aside>

        <main
          className={styles.dashboard__map}
          role="main"
          aria-label="Mapa de flota vehicular"
        >
          {map}
        </main>

        <aside
          className={styles.dashboard__panel}
          role="region"
          aria-label="Panel de información"
        >
          {panel}
        </aside>
      </div>

      {/* ── Mobile bottom sheet ── */}
      <div
        ref={sheetRef}
        className={styles.sheet}
        role="dialog"
        aria-label="Panel de vehículos"
        aria-modal="false"
        aria-expanded={sheetOpen}
      >
        <button
          type="button"
          className={styles.sheet__handle_wrap}
          aria-label={sheetOpen ? 'Contraer panel' : 'Expandir panel'}
          aria-expanded={sheetOpen}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onClick={handleClick}
        >
          <span className={styles.sheet__handle} aria-hidden="true" />
        </button>

        <div className={styles.sheet__content}>
          {layerOrder
            .filter(key => key !== 'map' && key in slots)
            .map(key => (
              <section
                key={key}
                className={styles.sheet__section}
                aria-label={
                  key === 'vehicle-list' ? 'Lista de vehículos' : 'Información del vehículo'
                }
              >
                {slots[key]}
              </section>
            ))}
        </div>
      </div>
    </div>
  )
}
