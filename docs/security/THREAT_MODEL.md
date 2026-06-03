# THREAT_MODEL.md
# simon-v2-monitor | M1 — STRIDE completo
# Fecha: 2026-06-03

## STRIDE por componente

### Proxy CORS (Netlify Functions)
| Amenaza | STRIDE | Nivel | Control implementado |
|---|---|---|---|
| Suplantación de origen | S | Bajo | CORS headers restrictivos en netlify.toml |
| Manipulación de cookie | T | Medio | HttpOnly + SameSite en Set-Cookie |
| Denegación de servicio | D | Bajo | Rate limiting de Netlify (por plan) |
| Escalada de privilegios | E | Bajo | Solo paths permitidos en ALLOWED_PATHS[] |

### Browser (cliente)
| Amenaza | STRIDE | Nivel | Control implementado |
|---|---|---|---|
| XSS | T | Medio | CSP en netlify.toml + React escapa por defecto |
| Clickjacking | E | Bajo | X-Frame-Options: DENY |
| MIME sniffing | I | Bajo | X-Content-Type-Options: nosniff |

### API Traccar (externa)
| Amenaza | STRIDE | Nivel | Control |
|---|---|---|---|
| Credenciales demo expuestas | I | Bajo | Son públicas (admin/admin) — sin dato sensible real |
| Caída del servidor | D | Alto | Fallback a última posición conocida en UI |

## Riesgo residual aceptado
- Credenciales demo4 son públicas por diseño — no hay secreto real
- Sin datos personales en Capa 1 — riesgo de privacidad mínimo

**Firmado:** Design Engineer | 2026-06-03
