'use client'
// src/components/ui/ThemeToggle.tsx
// Toggle dark/light con aria-label correcto y :focus-visible (WCAG 2.4.7)

import { useAppStore } from '@/store/useAppStore'

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppStore()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-pressed={isDark}
      style={{
        background: 'none',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-muted)',
        padding: '4px 12px',
        borderRadius: 'var(--md-sys-shape-corner-full)',
        fontSize: 12,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'border-color 0.2s, color 0.2s',
        // :focus-visible manejado por globals.css — nunca outline: none aquí
      }}
    >
      <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
      <span>{isDark ? 'Claro' : 'Oscuro'}</span>
    </button>
  )
}

// ── ErrorScreen — pantalla completa de error empático
// WCAG: role=alert, foco automático en el botón Retry (Nielsen #9)
import { useEffect, useRef } from 'react'

interface ErrorScreenProps {
  title?: string
  description?: string
  onRetry?: () => void
  retryLabel?: string
}

export function ErrorScreen({
  title = 'No pudimos conectar con el servidor',
  description = 'Mostrando la última ubicación conocida. Verifica tu conexión a internet.',
  onRetry,
  retryLabel = 'Reintentar ahora',
}: ErrorScreenProps) {
  const retryRef = useRef<HTMLButtonElement>(null)

  // Foco automático en el botón Retry — WCAG 2.4.3 Orden del foco
  // Nielsen #9: el usuario puede actuar inmediatamente sin buscar el botón
  useEffect(() => {
    const timer = setTimeout(() => retryRef.current?.focus(), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-danger)',
          borderRadius: 'var(--md-sys-shape-corner-large)',
          padding: 28,
          maxWidth: 340,
          textAlign: 'center',
          animation: 'fade-in 0.2s ease forwards',
        }}
        data-atomic="organism"
        data-component="ErrorScreen"
      >
        {/* Ícono ilustrativo — aria-hidden porque el texto ya describe el error */}
        <div aria-hidden="true" style={{ fontSize: 36, marginBottom: 14 }}>📡</div>

        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>
          {title}
        </h2>

        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
          {description}
        </p>

        {onRetry && (
          <button
            ref={retryRef}
            onClick={onRetry}
            aria-label={retryLabel}
            style={{
              background: 'var(--color-danger)',
              color: '#fff',
              border: 'none',
              padding: '9px 22px',
              borderRadius: 'var(--md-sys-shape-corner-full)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'opacity 0.2s',
              // :focus-visible manejado por globals.css
            }}
          >
            🔄 {retryLabel}
          </button>
        )}
      </div>
    </div>
  )
}

// ── AppHeader
export function AppHeader() {
  return (
    <header
      role="banner"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        height: 48,
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Logo */}
        <div
          aria-hidden="true"
          style={{
            width: 28, height: 28,
            background: 'var(--color-accent)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5">
            <circle cx="8" cy="8" r="6"/>
            <path d="M8 4v4l2.5 2.5"/>
          </svg>
        </div>

        <span style={{ fontSize: 13, fontWeight: 500 }}>
          FleetControl <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>— Monitor en Tiempo Real</span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ThemeToggle />
      </div>
    </header>
  )
}
