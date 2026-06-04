'use client'
import { useAppStore } from '@/store/useAppStore'

/**
 * ThemeToggle — atom
 * @description Alterna entre tema oscuro y claro.
 * WCAG 1.3.3: aria-pressed comunica estado sin depender del color.
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useAppStore()
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-pressed={isDark}
      data-atomic="atom"
      data-component="ThemeToggle"
      className="theme-toggle"
    >
      <span className="material-symbols-outlined" aria-hidden="true" style={{fontSize:16}}>
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
      <span className="theme-toggle__label">{isDark ? 'Claro' : 'Oscuro'}</span>
    </button>
  )
}

/**
 * AppHeader — organism
 * @description Barra de navegación principal.
 * @param onMenuClick - Abre sidebar drawer en mobile.
 */
export function AppHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header
      role="banner"
      data-atomic="organism"
      data-component="AppHeader"
      className="app-header"
    >
      <div className="app-header__left" data-atomic="molecule">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir menú de vehículos"
          data-atomic="atom"
          className="app-header__menu-btn"
        >
          <span className="material-symbols-outlined" aria-hidden="true">menu</span>
        </button>
        <div
          aria-hidden="true"
          data-atomic="atom"
          className="app-header__logo"
        >
          <span className="material-symbols-outlined" style={{fontSize:16, color:'var(--color-bg)'}}>
            location_on
          </span>
        </div>
        <span data-atomic="molecule" className="app-header__brand">
          FleetControl
          <span className="app-header__brand-sub"> — Monitor en Tiempo Real</span>
        </span>
      </div>
      <div data-atomic="molecule">
        <ThemeToggle />
      </div>
    </header>
  )
}
