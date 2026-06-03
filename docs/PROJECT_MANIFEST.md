# PROJECT_MANIFEST.md
# Monitor de Vehículo en Tiempo Real — simon-v2-monitor
# Versión: 1.0.0 | Fecha: 2026-06-02 | Momentum: M0

---

## 1. IDENTIDAD DEL PROYECTO

| Campo | Valor |
|---|---|
| Nombre | simon-v2-monitor |
| Tipo | SPA — Control Room Component |
| Descripción | Monitor de flota vehicular en tiempo real conectado a Traccar API |
| Objetivo | Demostrar criterio estético, accesibilidad WCAG 2.1 AA y resiliencia UX |
| Contexto | Prueba técnica — Design Engineer (UX/UI) |

## 2. EQUIPO (roles del challenge)

| Rol | Responsable |
|---|---|
| Design Engineer | Candidato |
| IA Copiloto | Claude Sonnet 4.6 (revisado y dirigido por el candidato) |
| QA / A11y | axe DevTools + Lighthouse CI |
| Deploy | Netlify |
| Control de versiones | GitHub |

## 3. PROBLEMA QUE RESUELVE

Los operadores de control de flota trabajan turnos de 24h bajo alto estrés.
Las herramientas actuales tienen baja accesibilidad, interfaces saturadas y
mala resiliencia ante fallos de conectividad. Este monitor prioriza:
- Legibilidad en condiciones de fatiga visual (dark mode, alto contraste)
- Resiliencia ante errores de red (última posición conocida + retry empático)
- Movimiento orgánico del marcador (sin saltos bruscos entre coordenadas)
- Operabilidad completa con teclado (WCAG 2.1 AA)

## 4. STACK TECNOLÓGICO

Ver ADR-001 para justificación completa.

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js App Router | 14.x |
| Estilos | Tailwind CSS + CSS custom properties M3 | 3.4.x |
| Estado global | Zustand | 4.x |
| Data fetching | TanStack React Query | 5.x |
| Mapa | Leaflet + react-leaflet | 4.x |
| Animaciones | Framer Motion | 11.x |
| Fechas | date-fns | 3.x |
| Iconos | lucide-react | latest |
| A11y testing | jest-axe + axe-core | latest |
| Deploy | Netlify (Functions para CORS proxy) | — |
| CI/CD | GitHub Actions | — |

## 5. OBJETIVOS DE CALIDAD

| Métrica | Target |
|---|---|
| WCAG 2.1 | Nivel AA — 0 violaciones críticas |
| Lighthouse Performance | ≥ 85 |
| LCP | < 2.5s |
| CLS | < 0.1 |
| Cobertura de tests | ≥ 70% (componentes críticos) |
| Tiempo de polling | 5 segundos |
| Tiempo de respuesta a error | < 100ms (UI) |

## 6. SCOPE

### IN SCOPE
- Autenticación contra Traccar demo4.traccar.org
- Lista de dispositivos con selector accesible
- Polling de posición cada 5s (con fallback a WebSocket)
- Mapa Leaflet con marcador SVG rotante por `course`
- Status Card semántica con dl/dt/dd
- Estados: Loading (skeleton) · Error (empático) · Tracking (live)
- Dark / Light mode toggle
- Navegación 100% por teclado
- Deploy público en Netlify

### OUT OF SCOPE (Roadmap pendiente)
- Historial de rutas / heatmap
- Múltiples vehículos simultáneos en mapa
- Notificaciones push
- Shift summary / handover
- Atajos de teclado avanzados (Esc, slash)

## 7. ENTREGABLES

1. Repositorio GitHub público con README completo
2. URL Netlify funcional con datos reales de Traccar
3. Video Loom 7-8 minutos (guion documentado en docs/VIDEO_SCRIPT.md)

---

**Firmado:** Design Engineer | 2026-06-02
**Estado:** ACTIVO — M0 en progreso
