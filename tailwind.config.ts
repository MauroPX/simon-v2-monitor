// tailwind.config.ts
// ADR-002 — Tailwind extiende los tokens M3 definidos en globals.css
// REGLA: los colores de Tailwind son alias de CSS vars, no valores hardcoded

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // ADR-002: toggle via clase .dark en <html>
  theme: {
    extend: {
      // Colores semánticos que mapean a CSS vars M3
      // Esto permite usar clases como bg-surface, text-accent, etc.
      colors: {
        background: 'var(--color-bg)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          variant: 'var(--color-surface-2)',
        },
        text: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          dim: 'var(--color-accent-dim)',
        },
        online: {
          DEFAULT: 'var(--color-online)',
          dim: 'var(--color-online-dim)',
        },
        offline: 'var(--color-offline)',
        warning: 'var(--color-warning)',
        danger: {
          DEFAULT: 'var(--color-danger)',
          dim: 'var(--color-danger-dim)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          hover: 'var(--color-border-hover)',
          focus: 'var(--color-border-focus)',
        },
      },

      // Shape tokens M3
      borderRadius: {
        'none': '0px',
        'xs': '4px',   // --md-sys-shape-corner-extra-small
        'sm': '8px',   // --md-sys-shape-corner-small
        'md': '12px',  // --md-sys-shape-corner-medium
        'lg': '16px',  // --md-sys-shape-corner-large
        'xl': '28px',  // --md-sys-shape-corner-extra-large
        'full': '9999px',
      },

      // Motion tokens M3
      transitionDuration: {
        'short1': '50ms',
        'short4': '200ms',
        'medium2': '300ms',
        'long2': '500ms',
      },
      transitionTimingFunction: {
        'standard': 'cubic-bezier(0.2, 0, 0, 1)',
        'emphasized': 'cubic-bezier(0.2, 0, 0, 1)',
      },

      // Tipografía M3
      fontFamily: {
        sans: ['var(--md-ref-typeface-plain)', 'system-ui', 'sans-serif'],
        mono: ['var(--md-ref-typeface-mono)', 'ui-monospace', 'monospace'],
      },

      // Animaciones del proyecto
      animation: {
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2s ease-in-out infinite',
        'val-highlight': 'val-highlight 0.4s ease forwards',
        'fade-in': 'fade-in 0.3s var(--md-sys-motion-easing-standard) forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 var(--color-online-ring)' },
          '70%': { boxShadow: '0 0 0 8px transparent' },
          '100%': { boxShadow: '0 0 0 0 transparent' },
        },
        'val-highlight': {
          '0%': { color: 'var(--color-accent)' },
          '100%': { color: 'var(--color-text)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
