# GSD_TASK_CARD_M0.md
# Punto de recuperación de sesión — Momentum 0
# Proyecto: simon-v2-monitor | Fecha: 2026-06-02
# Generado por: TITAN v7.0 [OBSERVER]

---

## ESTADO ACTUAL DEL PROYECTO

```
PROYECTO:    simon-v2-monitor
MOMENTUM:    M0 — Onboarding & Context
FASE BFL:    N/A (M0 no usa BFL — genera fundación)
SPRINT:      0 (pre-desarrollo)
PROGRESO M0: 9 / 15 evidencias completadas (60%)
```

## EVIDENCIAS GENERADAS EN ESTA SESIÓN

| # | Artefacto | Estado | Ubicación |
|---|---|---|---|
| 1 | PROJECT_MANIFEST.md | ✅ GENERADO | `/docs/PROJECT_MANIFEST.md` |
| 2 | ADR_LOG.md (ADR-001 a ADR-007) | ✅ GENERADO | `/docs/adr/ADR_LOG.md` |
| 3 | ENVIRONMENT_SETUP.md | ✅ GENERADO | `/docs/ENVIRONMENT_SETUP.md` |
| 4 | globals.css (tokens M3 completos) | ✅ GENERADO | `/src/styles/globals.css` |
| 5 | tailwind.config.ts (extensión M3) | ✅ GENERADO | `/tailwind.config.ts` |
| 6 | netlify/functions/traccar.ts | ✅ GENERADO | `/netlify/functions/traccar.ts` |
| 7 | netlify.toml | ✅ GENERADO | `/netlify.toml` |
| 8 | .github/workflows/ci.yml | ✅ GENERADO | `/.github/workflows/ci.yml` |
| 9 | Prototipo interactivo (widget) | ✅ GENERADO | artifact en sesión |

## EVIDENCIAS PENDIENTES PARA CERRAR M0

| # | Artefacto | Prioridad | Comando |
|---|---|---|---|
| 10 | POLICY_GUARDRAILS.md | 🔴 ALTA | `/compliance security-policy` |
| 11 | WCAG_COMMITMENT.md | 🔴 ALTA | `/compliance wcag-commitment` |
| 12 | QUALITY_POLICY.md | 🟡 MEDIA | `/compliance quality-policy` |
| 13 | DATA_PROCESSING_MAP.md | 🟡 MEDIA | `/compliance privacy-map` |
| 14 | PROCESS_MAP.md | 🟢 BAJA | `/compliance process-map` |
| 15 | ADR-008 cerrado (Polling vs WS) | 🔴 ALTA | Decisión pendiente del equipo |

## DECISIONES TOMADAS (LOCKED)

```
✅ Framework:    Next.js 14 App Router
✅ Estilos:      Tailwind CSS 3.4 + CSS Custom Properties M3
✅ Estado:       Zustand 4.x
✅ Data:         TanStack React Query 5.x
✅ Mapa:         Leaflet + react-leaflet (dynamic import, ssr: false)
✅ Deploy:       Netlify (no Vercel)
✅ Proxy CORS:   Netlify Functions /netlify/functions/traccar.ts
✅ Git:          Conventional commits + branch protection main/develop
✅ A11y:         WCAG 2.1 AA con jest-axe en CI
✅ Animaciones:  prefers-reduced-motion obligatorio
⏳ Polling:      Polling 5s vs WebSocket — PENDIENTE ADR-008
```

## BRANCHES PLANIFICADAS

```
main          → producción (protegida)
develop       → integración
feat/m0-setup → [SIGUIENTE] estructura + tokens + proxy
feat/auth-proxy     → hook useAuth + Netlify proxy
feat/devices        → useDevices + DeviceSelector
feat/status-card    → StatusCard + skeleton + aria-live
feat/map-leaflet    → VehicleMap + smooth marker
feat/dark-mode      → ThemeToggle + verificación contraste
feat/a11y-audit     → correcciones finales WCAG
```

## COMMIT PLAN (próximos 7 commits)

```bash
# feat/m0-setup
git commit -m "chore: init Next.js 14 + Tailwind + Zustand + React Query"
git commit -m "docs: add PROJECT_MANIFEST + ADR-001 thru ADR-007"
git commit -m "feat(tokens): add M3 CSS vars + Tailwind theme extension"
git commit -m "feat(proxy): add Netlify Function traccar.ts for CORS"
git commit -m "ci: add GitHub Actions pipeline (lint+test+a11y+build)"
git commit -m "chore: add netlify.toml with security headers"
git commit -m "docs: add ENVIRONMENT_SETUP.md + GSD_TASK_CARD_M0"
```

## PARA RETOMAR ESTA SESIÓN

Pegar este card completo al inicio de la próxima sesión de Claude.
TITAN retomará desde el milisegundo exacto sin necesidad de re-explicar contexto.

## SIGUIENTE PASO INMEDIATO

```
ACCIÓN:  Generar package.json + tsconfig + estructura de componentes base
BRANCH:  feat/m0-setup
COMMIT:  "chore: init Next.js 14 + Tailwind + Zustand + React Query"
TIEMPO:  ~30 min para completar M0
GATE:    ADR-008 (Polling vs WS) debe decidirse antes de feat/auth-proxy
```

## GATEWAY M0 → M1

```
✅ Stack decidido (ADR-001 a ADR-006)
✅ Git workflow definido
✅ Netlify configurado
✅ Proxy CORS creado
✅ CI/CD configurado
✅ Tokens M3 definidos
⏳ ADR-008 pendiente (no bloquea M0 — solo bloquea feat/auth-proxy)
⏳ Compliance docs pendientes (POLICY_GUARDRAILS · WCAG_COMMITMENT)
```

---

**Generado:** TITAN v7.0 [OBSERVER] | 2026-06-02
**Próxima revisión:** Al iniciar feat/auth-proxy
