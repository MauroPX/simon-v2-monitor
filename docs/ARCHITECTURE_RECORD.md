# ARCHITECTURE_RECORD.md
# simon-v2-monitor | M2 Architecture
# Fecha: 2026-06-03

## Stack decidido (ADR-001 a ADR-008)

| Capa | Tecnología | Justificación |
|---|---|---|
| Framework | Next.js 14 App Router | Proxy CORS nativo, deploy Netlify |
| Estilos | Tailwind CSS + CSS Custom Properties M3 | Tokens semánticos, dark mode class |
| Estado | Zustand 4.x | Re-renders controlados para polling |
| Data | TanStack React Query 5.x | Retry, cache, stale data automático |
| Mapa | Leaflet + react-leaflet | Gratuito, sin API key |
| Proxy | Netlify Functions | CORS sin servidor adicional |
| Deploy | Netlify | CI/CD automático desde GitHub |
| Tests | jest-axe + Testing Library | WCAG automático en CI |

## Arquitectura de componentes
```
Page (fleet-monitor-page)
├── Organism: AppHeader
│   ├── Atom: LogoMark
│   ├── Atom: ThemeToggle
│   └── Molecule: BrandLabel
├── Organism: DeviceSelector
│   └── Molecule: DeviceItem (×N)
├── Organism: VehicleMap
│   └── Atom: VehicleMarker (SVG)
└── Organism: StatusCard
    ├── Atom: PulseDot
    ├── Atom: BatteryBar
    └── Atom: AnimatedValue
```

## Flujo de datos
```
Browser → /.netlify/functions/traccar → demo4.traccar.org
       ↑
React Query (polling 5s) → Zustand store → Componentes
```

**Firmado:** Design Engineer | 2026-06-03
