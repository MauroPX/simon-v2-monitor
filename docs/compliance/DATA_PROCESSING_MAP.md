# DATA_PROCESSING_MAP.md
# simon-v2-monitor | Fecha: 2026-06-03

## Mapeo de datos procesados

| Dato | Origen | Propósito | Retención | PII |
|---|---|---|---|---|
| Posición GPS (lat/lng) | Traccar API demo | Visualización en mapa | No persiste (memoria) | No |
| Velocidad (nudos) | Traccar API demo | Conversión y display | No persiste | No |
| JSESSIONID | Traccar API demo | Autenticación de sesión | Sesión browser | No |
| Nombre de dispositivo | Traccar API demo | Identificación en UI | No persiste | No |

## Notas
- Capa 1 (Mock): sin datos reales de usuarios — datos demo públicos de Traccar
- No hay base de datos propia — sin persistencia de datos de usuarios
- Sin analytics de usuarios implementado en Capa 1

## Capa 3 (MVP) — pendiente
Cuando se conecte a Traccar propio de Simon Movilidad:
- PIA (Privacy Impact Assessment) requerido
- Ley 1581 Colombia aplica para datos de conductores

**Firmado:** Design Engineer | 2026-06-03
