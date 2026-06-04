'use client'
import { useAppStore } from '@/store/useAppStore'

/**
 * ThemeToggle — atom
 * @description Botón de alternancia dark/light. Persiste en localStorage.
 * WCAG 1.3.3: no depende solo del color para comunicar estado.
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useAppStore()
  const isDark = theme === 'dark'
  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-pressed={isDark}
      data-atomic="atom"
      data-component="ThemeToggle"
      className="theme-toggle"
    >
      <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
      <span className="theme-toggle__label">{isDark ? 'Claro' : 'Oscuro'}</span>
    </button>
  )
}

/**
 * AppHeader — organism
 * @description Barra de navegación principal. Logo, marca y ThemeToggle.
 * @param onMenuClick - Abre sidebar en mobile.
 */
export function AppHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header
      role="banner"
      data-atomic="organism"
      data-component="AppHeader"
      className="app-header"
    >
      <div className="app-header__left">
        <button
          onClick={onMenuClick}
          aria-label="Abrir menú de vehículos"
          data-atomic="atom"
          className="app-header__menu-btn"
        >☰</button>
        <div aria-hidden="true" data-atomic="atom" className="app-header__logo">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
            stroke="var(--color-bg)" strokeWidth="1.5">
            <path d="M8 1C5.24 1 3 3.24 3 6c0 4.5 5 9 5 9s5-4.5 5-9c0-2.76-2.24-5-5-5z"/>
            <circle cx="8" cy="6" r="1.5" fill="var(--color-bg)" stroke="none"/>
          </svg>
        </div>
        <span data-atomic="molecule" className="app-header__brand">
          FleetControl{' '}
          <span className="app-header__brand-sub">— Monitor en Tiempo Real</span>
        </span>
      </div>
      <ThemeToggle />
    </header>
  )
}
