# OBSERVABILITY_PLAN.md
# simon-v2-monitor | M2 Architecture
# Fecha: 2026-06-03

## Capa 1 (Mock) — Observabilidad básica

| Herramienta | Propósito | Estado |
|---|---|---|
| Netlify Analytics | Pageviews, performance | Activo (free) |
| GitHub Actions logs | CI/CD build logs | Activo |
| Browser DevTools | Debug local | Manual |

## Capa 3 (MVP) — Observabilidad completa

| Herramienta | Propósito | Costo |
|---|---|---|
| Sentry (free 5K/mes) | Errores JS en producción | $0 |
| Netlify Analytics Pro | Core Web Vitals | $9/mes |
| UptimeRobot | Uptime monitoring 5min | $0 |

## Métricas a monitorear (Capa 3)
- Error rate de polling: < 1%
- LCP: < 2.5s
- Error state activaciones: frecuencia y duración
- Tiempo de sesión por operador

**Firmado:** Design Engineer | 2026-06-03
