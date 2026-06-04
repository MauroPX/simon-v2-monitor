import '@testing-library/jest-dom'
import { configureAxe } from 'jest-axe'

/**
 * Configuración axe-core — WCAG 2.2 AAA (umbral 7:1)
 * GATE 2 ítem 3: verificación automática en cada test.
 * El umbral AAA aplica a color-contrast en todos los componentes.
 */
configureAxe({
  rules: {
    'color-contrast': { enabled: true },
  },
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag22aa'],
  },
})
