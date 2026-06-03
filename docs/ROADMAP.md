# ROADMAP.md
# simon-v2-monitor — 4 Capas Evolutivas del Producto
# Fecha: 2026-06-03

---

## Visión general

El monitor de flota evoluciona en 4 capas independientes.
Cada capa agrega valor sin romper la anterior.
Los componentes de UI nunca cambian entre capas — solo cambia la fuente de datos.

```
Capa 1 [LIVE]    → Mock estable
Capa 2 [PRÓXIMO] → API Traccar demo
Capa 3 [ROADMAP] → Traccar propio + mejoras UX
Capa 4 [FUTURO]  → API propia Simon Movilidad
```

---

## Capa 1 — Mock ✅ LIVE

**URL:** https://simon-monitor-test.netlify.app
**Variable:** `NEXT_PUBLIC_USE_MOCK=true`

**Completado:**
- UI completa con tokens Simon Movilidad (#050505, #4EEAC4)
- WCAG 2.1 AA — dl/dt/dd + aria-live + focus-visible
- Dark/Light mode persistente en localStorage
- Estados: Loading skeleton · Error empático · Tracking
- Marcador SVG rotante con requestAnimationFrame (smooth)
- 4 vehículos simulados con movimiento cada 5s
- Proxy CORS en Netlify Functions
- Deploy automático desde GitHub (main → Netlify)

---

## Capa 2 — Demo 🔵 PRÓXIMO

**Variable:** `NEXT_PUBLIC_USE_MOCK=false`
**Cambio:** Una variable de entorno en Netlify UI — sin tocar código

**Por hacer:**
- Verificar login real contra demo4.traccar.org
- Validar que JSESSIONID persiste en el proxy
- Manejar caídas frecuentes del servidor demo
- Documentar en ADR-009: "Traccar demo como fuente de datos"

**Riesgo:** demo4.traccar.org es un servidor público que cae frecuentemente.
**Mitigación:** Fallback automático a mock cuando la API no responde.

---

## Capa 3 — MVP ⬜ ROADMAP (4-8 semanas)

**Prerequisito:** Simon Movilidad provee un servidor Traccar propio
**Variable:** `TRACCAR_BASE=https://traccar.simonmovilidad.com`

**UX pendiente:**
- WebSocket `/api/socket` en lugar de polling (latencia real)
- Múltiples vehículos simultáneos en el mapa
- Alertas: speeding · geofence exit · batería crítica
- Shift summary al login — contexto del turno anterior
- Atajos de teclado: Esc (deseleccionar) · / (búsqueda)
- Heatmap de velocidad en replay de ruta histórica
- Notificaciones push (Service Worker)

**Técnico:**
- Tests E2E con Playwright
- Lighthouse CI en GitHub Actions
- DAST con OWASP ZAP

---

## Capa 4 — Legacy/C ⬜ FUTURO

**Prerequisito:** Simon Movilidad expone su API propia
**Cambio:** Solo `src/lib/adapters/simon.ts` — UI sin cambios

```typescript
// src/lib/adapters/simon.ts
// Traduce la respuesta de Simon Movilidad al contrato interno
// Los componentes nunca se enteran del cambio

export function adaptSimonPosition(raw: SimonAPIResponse): TraccarPosition {
  return {
    latitude:  raw.lat,                    // renombrar campo
    longitude: raw.lng,                    // renombrar campo
    speed:     raw.velocidad / 1.852,      // km/h → nudos
    course:    raw.rumbo,                  // renombrar campo
    fixTime:   raw.timestamp,              // renombrar campo
    attributes: {
      batteryLevel: raw.bateria,
      fuel:         raw.combustible,
    }
  }
}
```

**Estrategia de migración:**
1. Activar adaptador con feature flag (sin downtime)
2. Correr ambas APIs en paralelo (shadow mode) 1 semana
3. Validar que los datos son equivalentes
4. Cortar el tráfico a la API propia
5. Deprecar el adaptador de Traccar
6. Documentar en MIGRATION_DOCUMENT_legacy_v1.md

---

## Decisión de arquitectura

La clave que hace posible esta evolución sin reproceso:

**ADR-004 — Proxy como capa de abstracción**
Todos los componentes llaman a `/.netlify/functions/traccar`.
Nunca llaman directamente a Traccar ni a Simon Movilidad.
El proxy es el único punto que cambia entre capas.

**ADR-001 — Contratos de datos inmutables**
`TraccarPosition` es el contrato interno.
Cualquier fuente externa se adapta a este contrato.
Los componentes solo conocen `TraccarPosition`.

---

**Generado:** TITAN v7.0 | 2026-06-03
