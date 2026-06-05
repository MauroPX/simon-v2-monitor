'use client'

import { useAppStoreV2, type ConnectionState } from '@/store/useAppStoreV2'
import styles from './ConnectionBadge.module.css'

const BADGE_CLASS: Record<ConnectionState, string> = {
  live:       styles['badge--live'],
  demo:       styles['badge--demo'],
  connecting: styles['badge--connecting'],
  stale:      styles['badge--stale'],
  error:      styles['badge--error'],
}

const DOT_CLASS: Partial<Record<ConnectionState, string>> = {
  live:  styles['dot--live'],
  demo:  styles['dot--demo'],
  stale: styles['dot--stale'],
  error: styles['dot--error'],
}

const LABEL: Record<ConnectionState, string> = {
  live:       'EN VIVO',
  demo:       'DEMO',
  connecting: 'CONECTANDO…',
  stale:      'DESACTUALIZADO',
  error:      'ERROR',
}

const ARIA_LABEL: Record<ConnectionState, string> = {
  live:       'Fuente de datos: En vivo',
  demo:       'Fuente de datos: Demostración',
  connecting: 'Fuente de datos: Conectando',
  stale:      'Fuente de datos: Desactualizado',
  error:      'Fuente de datos: Error de conexión',
}

export function ConnectionBadge() {
  const { connectionState } = useAppStoreV2()
  const dotClass = DOT_CLASS[connectionState]

  return (
    <span
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={ARIA_LABEL[connectionState]}
      className={`${styles.badge} ${BADGE_CLASS[connectionState]}`}
    >
      {dotClass && (
        <span className={`${styles.dot} ${dotClass}`} aria-hidden="true" />
      )}
      <span>{LABEL[connectionState]}</span>
    </span>
  )
}
