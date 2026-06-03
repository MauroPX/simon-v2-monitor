# SPEC_DOCUMENT.md
# simon-v2-monitor | M2 — Firmado PO
# Fecha: 2026-06-03

## Alcance (Capa 1 Mock)

### Feature 1: Autenticación
- POST /api/session contra Traccar via proxy
- Cookie JSESSIONID manejada por el proxy
- Mock activable con NEXT_PUBLIC_USE_MOCK=true

### Feature 2: Lista de dispositivos
- GET /api/devices via proxy
- Renderizado como role=listbox con role=option
- Búsqueda en tiempo real (Ley de Hick)
- Estados: loading (skeleton) | error (retry) | populated

### Feature 3: Tracking de posición
- GET /api/positions?deviceId=X&limit=1 cada 5s
- Conversión de nudos a km/h (× 1.852)
- Marcador SVG que rota según `course`
- Smooth movement via requestAnimationFrame

### Feature 4: Status Card
- Estructura semántica dl/dt/dd (WCAG 1.3.1)
- aria-live="polite" para actualizaciones
- 4 métricas: vehículo, estado, velocidad, batería
- 4 estados: empty | loading | error | tracking

### Feature 5: Dark/Light mode
- Toggle con aria-label y aria-pressed
- Persiste en localStorage
- Tokens Simon Movilidad (#050505 / #4EEAC4)

## Fuera de alcance Capa 1
- Historial de rutas
- Múltiples vehículos en mapa
- Notificaciones push
- Autenticación con usuarios reales

**Firmado:** Design Engineer (rol PO) | 2026-06-03
