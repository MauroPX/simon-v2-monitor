# THREAT_MODEL_v0.md
# simon-v2-monitor | M0 — Topología inicial
# Fecha: 2026-06-03

## Topología de red

```
Browser → Netlify CDN → Netlify Functions (proxy) → Traccar API
```

## Superficie de ataque identificada (M0)

| Componente | Amenaza | Nivel | Control |
|---|---|---|---|
| Proxy CORS | Exposición de credenciales Traccar | Bajo | Variables de entorno Netlify |
| JSESSIONID | Secuestro de sesión | Medio | HttpOnly cookie, SameSite |
| API Traccar | CORS directo desde browser | Alto | Proxy Netlify Functions |
| Netlify deploy | Secrets en código | Alto | .gitignore + env vars |

## Gestión de secretos
- Dev: `.env.local` (gitignored)
- Prod: Netlify Environment Variables (no en código)

## Notas M0
- Sin datos personales de usuarios reales (demo pública)
- Sin base de datos propia en Capa 1
- STRIDE completo se ejecuta en M1 contra wireframes reales

**Firmado:** Design Engineer | 2026-06-03
