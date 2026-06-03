# ROADMAP_v1.md
# simon-v2-monitor | M1 — Firmado PO
# Fecha: 2026-06-03

## Capas evolutivas (Shape Up — appetite por capa)

### Capa 1 — Mock (appetite: 16h — COMPLETADA)
- UI completa con datos simulados
- WCAG 2.1 AA verificado
- Deploy en Netlify
- Tokens Simon Movilidad

### Capa 2 — Demo (appetite: 1 semana)
- Login real contra Traccar demo4
- Dispositivos reales de la API
- Proxy CORS verificado en producción

### Capa 3 — MVP (appetite: 4-8 semanas)
- Servidor Traccar propio Simon Movilidad
- WebSocket en lugar de polling
- Múltiples vehículos en mapa
- Alertas: speeding, geofence, batería

### Capa 4 — Legacy/C (appetite: 2-4 semanas post-Capa 3)
- Adaptador `simon.ts` para API propia
- Migración sin tocar componentes UI

**Firmado:** Design Engineer (rol PO) | 2026-06-03
