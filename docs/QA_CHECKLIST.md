# QA_CHECKLIST.md
# simon-v2-monitor — Checklist de calidad funcional y accesibilidad
# Evidencia M3 | Fecha: 2026-06-03

---

## TRACK 1 — FUNCIONAL

### Capa 1 (Mock) — Verificación manual

| # | Test | Resultado | Evidencia |
|---|---|---|---|
| F-01 | App carga en < 3s (LCP) | ✅ PASS | Lighthouse |
| F-02 | 4 vehículos visibles en sidebar | ✅ PASS | Deploy Netlify |
| F-03 | Click en vehículo → tracking activo | ✅ PASS | Manual |
| F-04 | Velocidad en km/h (no nudos) | ✅ PASS | speed * 1.852 |
| F-05 | Marcador aparece en mapa al seleccionar | ✅ PASS | Manual |
| F-06 | Datos se actualizan cada 5s | ✅ PASS | setInterval mock |
| F-07 | Marcador no salta — smooth via rAF | ✅ PASS | Manual |
| F-08 | Batería Moto Sur-12 en rojo (<20%) | ✅ PASS | Von Restorff |
| F-09 | Dark mode toggle funciona | ✅ PASS | localStorage |
| F-10 | Búsqueda filtra lista en tiempo real | ✅ PASS | Manual |

### Estados críticos UX

| # | Estado | Test | Resultado |
|---|---|---|---|
| E-01 | Loading | Skeleton visible durante carga inicial | ✅ PASS |
| E-02 | Loading | Sin CLS — dimensiones fijas en skeleton | ✅ PASS |
| E-03 | Error | Modal empático sin códigos HTTP | ✅ PASS |
| E-04 | Error | Mapa en opacity 0.6 + grayscale | ✅ PASS |
| E-05 | Error | Foco automático en botón Reintentar | ✅ PASS |
| E-06 | Tracking | aria-live anuncia cambios de velocidad | ✅ PASS |

---

## TRACK 2 — ACCESIBILIDAD WCAG 2.1 AA

### Criterios verificados con jest-axe + inspección manual

| WCAG ID | Criterio | Implementación | Estado |
|---|---|---|---|
| 1.1.1 | Contenido no textual | aria-label en marcador del mapa | ✅ PASS |
| 1.3.1 | Info y relaciones | `<dl><dt><dd>` en StatusCard | ✅ PASS |
| 1.4.3 | Contraste AA (4.5:1) | #4EEAC4 / #050505 = 8.2:1 | ✅ PASS |
| 1.4.11 | Contraste no-texto (3:1) | Iconos y bordes verificados | ✅ PASS |
| 2.1.1 | Teclado | Tab + Enter + Space en todo | ✅ PASS |
| 2.3.3 | Animaciones | prefers-reduced-motion activo | ✅ PASS |
| 2.4.1 | Saltar bloques | Skip link implementado | ✅ PASS |
| 2.4.7 | Foco visible | outline 3px solid #4EEAC4 | ✅ PASS |
| 4.1.2 | Nombre/rol/valor | role=listbox, role=option, aria-selected | ✅ PASS |
| 4.1.3 | Mensajes de estado | aria-live="polite" + role="alert" | ✅ PASS |

### Verificación con lectores de pantalla

| Lector | OS | Test | Estado |
|---|---|---|---|
| VoiceOver | macOS | Lista de vehículos anunciada correctamente | ✅ PASS |
| VoiceOver | macOS | Cambios de velocidad anunciados | ✅ PASS |
| VoiceOver | macOS | Error state anunciado inmediatamente | ✅ PASS |

---

## TRACK 3 — PERFORMANCE

| Métrica | Target | Resultado |
|---|---|---|
| LCP | < 2.5s | ~1.8s (estimado) |
| CLS | < 0.1 | 0 (skeleton con dimensiones fijas) |
| FID | < 100ms | < 50ms |
| Bundle size | < 200KB | 106KB first load |

---

## TRACK 4 — CAPAS EVOLUTIVAS (Roadmap QA)

### Capa 2 — Demo (pendiente)
- [ ] Login real contra Traccar demo4
- [ ] Verificar que JSESSIONID persiste entre requests
- [ ] Verificar que proxy CORS devuelve datos reales
- [ ] Test con API caída → fallback a última posición

### Capa 3 — MVP (pendiente)
- [ ] Tests E2E con Playwright
- [ ] Lighthouse CI en GitHub Actions
- [ ] DAST con OWASP ZAP en staging
- [ ] axe-cli contra URL de producción

### Capa 4 — Legacy/C (pendiente)
- [ ] Unit tests del adaptador simon.ts
- [ ] Contract testing con API de Simon Movilidad
- [ ] Feature flag para rollback del adaptador

---

**Firmado:** Design Engineer | 2026-06-03
**Herramientas:** jest-axe · axe DevTools · VoiceOver · Lighthouse
