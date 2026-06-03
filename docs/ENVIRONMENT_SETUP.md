# ENVIRONMENT_SETUP.md
# simon-v2-monitor — Setup de entorno local
# Evidencia M0 · Última actualización: 2026-06-02

---

## Prerequisitos

| Herramienta | Versión mínima | Verificar con |
|---|---|---|
| Node.js | 20.x | `node --version` |
| npm | 10.x | `npm --version` |
| Netlify CLI | 17.x | `netlify --version` |
| Git | 2.x | `git --version` |

## 1. Clonar el repositorio

```bash
git clone https://github.com/[usuario]/simon-v2-monitor.git
cd simon-v2-monitor
```

## 2. Instalar dependencias

```bash
npm install
```

## 3. Variables de entorno

Crear `.env.local` en la raíz (nunca commitear este archivo):

```bash
cp .env.example .env.local
```

Contenido de `.env.local`:

```env
# Traccar demo server (pública — no es un secreto real)
NEXT_PUBLIC_TRACCAR_BASE=https://demo4.traccar.org

# Activar datos mock si la API de Traccar no responde
# true = usar MOCK_FLEET en lugar de API real
NEXT_PUBLIC_USE_MOCK=false

# URL del sitio (Netlify la setea automáticamente en producción)
# En local, dejarlo vacío o poner http://localhost:3000
URL=http://localhost:3000
```

## 4. Levantar el servidor de desarrollo

### Opción A — Con Netlify CLI (RECOMENDADO)
Levanta las Functions (proxy CORS) junto con Next.js:

```bash
npm install -g netlify-cli
netlify dev
```

La app estará en: `http://localhost:8888`
El proxy CORS estará en: `http://localhost:8888/.netlify/functions/traccar`

### Opción B — Solo Next.js (sin proxy CORS)
Útil para desarrollo de UI sin datos reales:

```bash
NEXT_PUBLIC_USE_MOCK=true npm run dev
```

La app estará en: `http://localhost:3000`

## 5. Verificar que todo funciona

```bash
# Lint
npm run lint

# Tests (incluye jest-axe)
npm run test

# Type check
npm run type-check

# Build de producción
npm run build
```

## 6. Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo Next.js |
| `netlify dev` | Servidor con Functions (proxy CORS activo) |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npm run format` | Prettier (escribe) |
| `npm run format:check` | Prettier (verifica sin escribir) |
| `npm run type-check` | TypeScript sin emitir |
| `npm run test` | Jest + jest-axe |
| `npm run test:ci` | Jest con coverage (para CI) |
| `npm run test:a11y` | Solo los tests de accesibilidad |
| `npm run test:watch` | Jest en modo watch |

## 7. Estructura de carpetas

```
simon-v2-monitor/
├── .github/workflows/     # CI/CD pipeline
├── docs/
│   ├── adr/               # Architecture Decision Records
│   ├── compliance/        # WCAG, calidad, privacidad
│   └── security/          # Threat model, políticas
├── netlify/functions/     # Proxy CORS para Traccar API
├── src/
│   ├── app/               # Next.js App Router
│   ├── components/
│   │   ├── layout/        # Header, Sidebar
│   │   ├── map/           # VehicleMap, VehicleMarker
│   │   ├── status/        # StatusCard, StatusSkeleton
│   │   └── ui/            # DeviceSelector, ThemeToggle, ErrorState
│   ├── hooks/             # useAuth, useDevices, useTraccarPosition
│   ├── store/             # Zustand store
│   ├── lib/               # Utilidades (timeAgo, conversiones)
│   ├── styles/            # globals.css (tokens M3)
│   └── types/             # TypeScript interfaces (Traccar API)
├── netlify.toml           # Configuración de deploy Netlify
├── tailwind.config.ts     # Tokens M3 en Tailwind
└── .env.example           # Variables de entorno documentadas
```

## 8. Convenciones de Git

```bash
# Siempre trabajar en una feature branch
git checkout -b feat/nombre-de-la-feature

# Commits con conventional commits
git commit -m "feat(status-card): add aria-live polite to StatusCard"
git commit -m "fix(map): prevent marker jump on first position update"
git commit -m "a11y(theme-toggle): add focus-visible ring 3px contrast"
git commit -m "docs: update ENVIRONMENT_SETUP with netlify dev command"

# PRs siempre hacia develop (nunca directamente a main)
git push origin feat/nombre-de-la-feature
# → Crear PR en GitHub hacia develop
```

## 9. Troubleshooting frecuente

| Problema | Causa | Solución |
|---|---|---|
| `window is not defined` en build | Leaflet importado sin `dynamic()` | Usar `dynamic(() => import(...), { ssr: false })` |
| CORS error en `/api/session` | Llamando directo a Traccar sin proxy | Usar `netlify dev` o endpoint `/api/traccar?path=/api/session` |
| Cookie `JSESSIONID` no persiste | `credentials: 'include'` faltante | Verificar que todas las llamadas al proxy tienen `credentials: 'include'` |
| Dark mode no aplica | `data-theme` no seteado en `<html>` | Verificar ThemeProvider en `layout.tsx` |
| Tests de axe fallan | Violación WCAG en componente | Ver el mensaje del error — tiene el ID del criterio WCAG violado |

---

**Generado en M0** | Actualizar si cambia el stack o las instrucciones de setup
