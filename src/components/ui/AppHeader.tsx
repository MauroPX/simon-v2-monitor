'use client'
import { useAppStore } from '@/store/useAppStore'

interface AppHeaderProps {
  onMenuClick?: () => void
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppStore()
  const isDark = theme === 'dark'
  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-pressed={isDark}
      data-atomic="atom"
      style={{
        background: 'none',
        border: '1px solid var(--color-border-2)',
        color: 'var(--color-text-muted)',
        padding: 'var(--space-1) var(--space-3)',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--md-sys-typescale-label-sm-size)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
        transition: 'border-color var(--duration-short)',
        minHeight: 32,
      }}
    >
      <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
      <span>{isDark ? 'Claro' : 'Oscuro'}</span>
    </button>
  )
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  return (
    <header
      role="banner"
      data-atomic="organism"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-4)',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        height: 'var(--layout-header)',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        {/* Mobile menu toggle — visible solo en móvil */}
        <button
          onClick={onMenuClick}
          aria-label="Abrir menú de vehículos"
          data-atomic="atom"
          style={{
            display: 'none', /* CSS responsive lo muestra en mobile */
            background: 'none', border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer', padding: 'var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 18, minHeight: 44, minWidth: 44,
          }}
          className="mobile-menu-btn"
        >
          ☰
        </button>

        {/* Logo atom */}
        <div
          aria-hidden="true"
          data-atomic="atom"
          style={{
            width: 28, height: 28,
            background: 'var(--color-accent)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
            stroke="var(--color-bg)" strokeWidth="1.5">
            <path d="M8 1C5.24 1 3 3.24 3 6c0 4.5 5 9 5 9s5-4.5 5-9c0-2.76-2.24-5-5-5z"/>
            <circle cx="8" cy="6" r="1.5" fill="var(--color-bg)" stroke="none"/>
          </svg>
        </div>

        {/* Brand molecule */}
        <span
          data-atomic="molecule"
          style={{
            fontSize: 'var(--md-sys-typescale-title-md-size)',
            fontWeight: 500, color: 'var(--color-text)',
          }}
        >
          FleetControl{' '}
          <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>
            — Monitor en Tiempo Real
          </span>
        </span>
      </div>

      <ThemeToggle />
    </header>
  )
}
