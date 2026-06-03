# TASK_JOURNEY_MAPS.md
# simon-v2-monitor | M1 Discovery
# Fecha: 2026-06-03

## Journey 1 — Operador turno nocturno (flujo principal)

```
2:30 AM → Abre el monitor
  ↓ [PAIN: pantalla muy brillante]
  Selecciona vehículo de la lista
  ↓ [PAIN: lista sin búsqueda si hay muchos]
  Ve el mapa con la ubicación
  ↓
  Revisa velocidad y batería en la tarjeta
  ↓ [PAIN: datos no se actualizan sin recargar]
  Monitorea por 5 minutos
  ↓
  Detecta anomalía (batería baja)
  ↓ [PAIN: no hay alerta visual destacada]
  Reporta al técnico
```

**Solución implementada:**
- Dark mode por defecto → reduce fatiga visual
- Búsqueda en tiempo real → Ley de Hick
- Polling 5s automático → sin recarga manual
- Batería <20% en rojo (Von Restorff) → alerta inmediata

## Journey 2 — Pérdida de conexión (error state)

```
Red inestable → API Traccar no responde
  ↓
  [SIN SOLUCIÓN HOY]: pantalla en blanco, datos borrados
  
  [CON SIMON MONITOR]:
  Mapa en opacity 0.6 + banner empático
  "Conexión perdida — última ubicación conocida"
  Botón Reintentar con foco automático
  Auto-retry cada 3s en background
```

**Firmado:** Design Engineer | 2026-06-03
