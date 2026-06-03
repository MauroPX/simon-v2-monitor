# ADR Log — simon-v2-monitor
# Todas las decisiones técnicas del proyecto
# Formato: MADR (Michael Nygard) | Estado: LOCK / DRAFT / SUPERSEDED

---

## ADR-001 — Stack Principal

**Estado:** LOCK | **Fecha:** 2026-06-02 | **Autor:** Design Engineer

### Contexto
Prueba técnica de 16h que requiere proxy CORS, deploy rápido y soporte
de Netlify Functions para proxear la API de Traccar.

### Decisión
**Next.js 14 App Router** como framework principal.

### Opciones evaluadas
| Opción | Pros | Contras | Decisión |
|---|---|---|---|
| Next.js 14 | Proxy nativo en API Routes, deploy Netlify nativo, SSR | Más configuración inicial | ✅ ELEGIDA |
| React + Vite | Setup más simple | Necesita servidor proxy separado para CORS | ❌ |
| Vue 3 | Ligero | Ecosistema de mapas más limitado | ❌ |

### Consecuencias
- Las funciones CORS van en `/app/api/traccar/[...path]/route.ts`
- El mapa Leaflet requiere `dynamic import` con `ssr: false`
- Deploy en Netlify con `next-on-netlify` o adaptador oficial

---

## ADR-002 — Frontend Design System

**Estado:** LOCK | **Fecha:** 2026-06-02 | **Autor:** Design Engineer

### Decisión
**Tailwind CSS 3.4** + **CSS Custom Properties** siguiendo arquitectura
de tokens Material Design 3 (Reference → System → Component).

**Dark mode:** estrategia `class` de Tailwind (`dark:` prefijo).
**Tokens semánticos:** CSS vars en `:root` y `[data-theme="dark"]`.

### Variables CSS M3 definidas
```css
/* Roles semánticos — NUNCA valores hardcoded en componentes */
--md-sys-color-background
--md-sys-color-surface
--md-sys-color-surface-variant
--md-sys-color-primary
--md-sys-color-on-primary
--md-sys-color-error
--md-sys-color-on-error
/* Tokens de negocio del proyecto */
--color-online      /* verde — vehículo conectado */
--color-offline     /* gris — vehículo desconectado */
--color-warning     /* ámbar — batería baja < 20% */
```

### Consecuencias
- Ningún componente usa valores hex directamente
- El toggle dark/light solo cambia `data-theme` en `<html>`
- La paleta de contraste se verifica con axe en cada PR

---

## ADR-003 — Librería de Mapas

**Estado:** LOCK | **Fecha:** 2026-06-02 | **Autor:** Design Engineer

### Decisión
**Leaflet 1.9** + **react-leaflet 4.x** con tile layer OpenStreetMap.

### Opciones evaluadas
| Opción | Costo | API Key | SSR | Decisión |
|---|---|---|---|---|
| Leaflet | Gratuito | No | Requiere `dynamic import` | ✅ ELEGIDA |
| Mapbox GL JS | API key + billing | Sí | Sí | ❌ |
| Google Maps | API key + billing | Sí | Sí | ❌ |

### Nota crítica — SSR
Leaflet usa `window` en el momento de la importación. En Next.js:
```typescript
const MapComponent = dynamic(() => import('@/components/map/VehicleMap'), {
  ssr: false,
  loading: () => <MapSkeleton />
})
```
Sin este patrón el build falla en producción.

---

## ADR-004 — Proxy CORS para API Traccar

**Estado:** LOCK | **Fecha:** 2026-06-02 | **Autor:** Design Engineer

### Contexto
La API de Traccar demo4.traccar.org no tiene headers CORS.
Las llamadas desde el browser fallan con `ERR_CORS`.

### Decisión
**Netlify Functions** como proxy serverless en `/netlify/functions/traccar.ts`.
Maneja: session · devices · positions. Reenvía cookies `JSESSIONID`.

### Alternativas descartadas
- `next.config.js rewrites`: no funciona para POST con cookies cross-origin
- Servidor Express propio: overhead innecesario para una prueba técnica

### Consecuencias
- El frontend siempre llama a `/.netlify/functions/traccar?path=...`
- El proxy agrega `credentials: 'include'` y reenvía `Set-Cookie`
- En desarrollo local: `netlify dev` levanta las functions automáticamente

---

## ADR-005 — Estrategia Git

**Estado:** LOCK | **Fecha:** 2026-06-02 | **Autor:** Design Engineer

### Decisión
**Conventional Commits** + **branch protection** en `main`.

### Estructura de branches
```
main          → producción (protegida, solo merge via PR)
develop       → integración (merge de features)
feat/m0-setup → setup inicial del proyecto
feat/auth-proxy → proxy CORS + hook de autenticación
feat/status-card → StatusCard semántica + skeleton
feat/map-leaflet → mapa + marcador SVG + smooth movement
feat/dark-mode → toggle + verificación de contraste
feat/a11y-audit → correcciones finales de accesibilidad
```

### Conventional commits obligatorios
```
feat(scope): descripción
fix(scope): descripción
docs: descripción
chore: descripción
refactor(scope): descripción
test(scope): descripción
a11y(scope): descripción  ← tipo custom para correcciones WCAG
```

### Regla anti-deuda técnica
- Todo PR debe pasar: `npm run lint` + `npm run test` + `npm run a11y`
- No se mergea código con `TODO:` sin issue asociado
- No se mergea con valores hardcoded (hex, px fijos sin token)

---

## ADR-006 — Accesibilidad WCAG 2.1 AA

**Estado:** LOCK | **Fecha:** 2026-06-02 | **Autor:** Design Engineer

### Decisión
**WCAG 2.1 Nivel AA** como requisito no negociable.

### Implementación técnica
| Criterio WCAG | Implementación |
|---|---|
| 1.3.1 Info y relaciones | `<dl><dt><dd>` en StatusCard, `<ul><li>` en DeviceList |
| 1.4.3 Contraste (AA) | Mínimo 4.5:1 — verificado con axe DevTools |
| 1.4.11 Contraste no-texto | 3:1 para iconos y bordes interactivos |
| 2.1.1 Teclado | Todo interactivo accesible con Tab + Enter + Space |
| 2.4.7 Foco visible | `:focus-visible` con `outline: 3px solid var(--md-sys-color-primary)` |
| 4.1.3 Mensajes de estado | `aria-live="polite"` en StatusCard, `role="alert"` en errores |

### Herramientas
- **jest-axe**: tests automáticos en cada componente
- **axe DevTools**: verificación manual en PR
- **Lighthouse CI**: en el pipeline de GitHub Actions

---

## ADR-007 — Animaciones y prefers-reduced-motion

**Estado:** DRAFT | **Fecha:** 2026-06-02 | **Autor:** Design Engineer

### Decisión
Todas las animaciones deben respetar `prefers-reduced-motion`.

### Implementación global
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### En Framer Motion
```typescript
const shouldReduceMotion = useReducedMotion()
const transition = shouldReduceMotion ? { duration: 0 } : { duration: 0.8 }
```

---

## ADR-008 — Polling vs WebSocket

**Estado:** PENDIENTE DECISIÓN | **Fecha:** 2026-06-02

### Opciones
| Opción | Latencia | Complejidad proxy | Bonus video |
|---|---|---|---|
| Polling 5s | ~5s lag | Baja (fetch simple) | Bajo |
| WebSocket `/api/socket` | Real-time | Alta (Netlify no soporta WS nativos, requiere workaround) | Alto |
| **Polling 5s + fallback WS** | ~5s normal, RT cuando disponible | Media | Muy alto |

**⚠️ BLOQUEADO — esperando decisión del equipo**
