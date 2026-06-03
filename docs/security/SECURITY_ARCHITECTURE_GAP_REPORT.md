# SECURITY_ARCHITECTURE_GAP_REPORT.md
# simon-v2-monitor | M2 — Gap Analysis
# Fecha: 2026-06-03

## Gaps identificados y estado

| Gap | Severidad | Estado | Control |
|---|---|---|---|
| Sin rate limiting en proxy | Medio | ACEPTADO | Netlify tiene rate limiting por plan |
| Sin autenticación propia | Medio | ACEPTADO | Usa Traccar auth — alcance de prueba técnica |
| Sin WAF propio | Bajo | ACEPTADO | Netlify CDN tiene protección básica |
| Sin logging centralizado | Bajo | DIFERIDO | Capa 3 — Sentry |
| Credenciales demo en código | Bajo | N/A | Son públicas por diseño (admin/admin) |

## Single Points of Failure

| SPOF | Mitigación |
|---|---|
| Traccar demo4 cae | Fallback UI + última posición conocida |
| Netlify outage | Sin fallback — aceptado en Capa 1 |
| GitHub Actions falla | Build local con `npm run build` |

## Decisión
Arquitectura aprobada para Capa 1. Los gaps identificados son aceptables
dado el scope de prueba técnica con datos demo públicos.

**Firmado:** Design Engineer | 2026-06-03
