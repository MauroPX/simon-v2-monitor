# DESIGN_SPEC.md
# simon-v2-monitor | M2 — Firmado TL
# Fecha: 2026-06-03

## Tokens por componente

### AppHeader (organism)
| Token M3 | Valor | Uso |
|---|---|---|
| --color-surface | #0d1117 dark / #fff light | Background |
| --color-border | rgba(78,234,196,0.10) | Border bottom |
| --layout-header | 48px | Height |
| --md-sys-typescale-title-md-size | 14px | Título |

### StatusCard (organism)
| Token M3 | Valor | Uso |
|---|---|---|
| --color-online | #4EEAC4 dark / #0F6E56 light | Pulse dot, battery normal |
| --color-danger | #EF4444 | Batería crítica <20% |
| --color-warning | #F59E0B | Batería warning 20-40% |
| --md-sys-typescale-headline-size | 24px | Velocidad |
| --md-sys-typescale-label-sm-size | 11px | Labels dt |

## BEM por componente

| Componente | Block | Elements | Modifiers |
|---|---|---|---|
| AppHeader | app-header | __brand, __logo, __title, __controls | — |
| StatusCard | status-card | __grid, __item, __term, __value, __sub | --loading, --error, --empty |
| DeviceSelector | device-selector | __header, __search, __list, __empty | --loading, --error |
| DeviceItem | device-item | __icon, __info, __name, __meta, __badge | --selected, --offline |
| VehicleMap | vehicle-map | __container, __marker, __overlay | --error, --empty |
| PulseDot | pulse-dot | — | --online, --offline |
| BatteryBar | battery-bar | __track, __fill, __cap | --critical, --warning, --normal |

## WCAG por componente

| Componente | Criterios | Implementación |
|---|---|---|
| StatusCard | 1.3.1, 4.1.3 | dl/dt/dd + aria-live=polite |
| DeviceSelector | 4.1.2, 2.1.1 | role=listbox + role=option + keyboard |
| VehicleMap | 1.1.1, 4.1.2 | role=img + aria-label dinámico |
| AppHeader | 2.4.7, 4.1.2 | focus-visible 3px + aria-pressed |
| BatteryBar | 1.3.1 | role=progressbar + aria-valuenow |
| PulseDot | 1.4.1 | aria-hidden=true |

**Firmado:** Design Engineer (rol TL) | 2026-06-03
