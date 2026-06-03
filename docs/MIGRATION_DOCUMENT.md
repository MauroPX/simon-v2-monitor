# MIGRATION_DOCUMENT.md
# simon-v2-monitor | Sprint 1 → Netlify Production
# Fecha: 2026-06-03

## Sección 1: Resumen del cambio
Deploy inicial de simon-v2-monitor Capa 1 (Mock) a Netlify producción.

## Sección 2: Componentes afectados
- Todos (primer deploy)
- URL: simon-monitor-test.netlify.app

## Sección 3: Pre-requisitos
- ✅ Build exitoso: `npm run build`
- ✅ GATE 2: 12/12 componentes verificados
- ✅ Sin vulnerabilidades críticas (SAST_REPORT.md)
- ✅ Proxy Netlify Functions activo

## Sección 4: Secuencia de deploy
1. `git push origin main` → GitHub detecta cambio
2. Netlify CI inicia build automático
3. `npm run build` → Next.js build
4. Netlify Functions bundling (traccar.ts)
5. Deploy a CDN global
6. URL activa: simon-monitor-test.netlify.app

## Sección 5: Plan de rollback
```bash
netlify rollback
# Revierte al deploy anterior en < 30 segundos
```

## Sección 6: Comunicación
- URL pública disponible inmediatamente
- Sin downtime (Netlify atomic deploys)

**Firmado:** Design Engineer | 2026-06-03
