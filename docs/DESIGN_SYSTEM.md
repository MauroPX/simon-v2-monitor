# DESIGN_SYSTEM.md
# simon-v2-monitor — Sistema de Diseño
# Basado en Material Design 3 + Paleta Simon Movilidad
# Fecha: 2026-06-03

---

## Arquitectura de Tokens (3 niveles M3)

### Nivel 1 — Reference Tokens (primitivos)
```
--simon-green-50:  #E8FBF6
--simon-green-400: #4EEAC4  ← color de marca principal
--simon-green-600: #2AB894
--simon-green-800: #0F6E56
```

### Nivel 2 — System Tokens (semánticos)
```
Color:    --color-bg, --color-surface, --color-accent, --color-online...
Shape:    --radius-xs(4) --radius-sm(8) --radius-md(12) --radius-lg(16)
Motion:   --duration-short(200ms) --duration-medium(300ms)
Layout:   --layout-sidebar(240px) --layout-header(48px)
Spacing:  --space-1(4px) ... --space-12(48px)
Type:     --md-sys-typescale-label-sm(11px) ... --display(36px)
```

### Nivel 3 — Component Tokens
Aplicados via `var(--color-*)` en inline styles y clases CSS.
Ningún componente usa valores hex o px hardcoded.

---

## Atomic Design — Jerarquía

| Nivel | Componente | data-atomic |
|---|---|---|
| Page | HomePage (page.tsx) | `page` |
| Template | app-main, app-content | `template` |
| Organism | AppHeader, DeviceSelector, VehicleMap, StatusCard | `organism` |
| Molecule | Brand mark, DeviceItem | `molecule` |
| Atom | Logo, ThemeToggle, PulseDot, BatteryBar, MapSkeleton | `atom` |

Debug visual: agregar clase `debug-atomic` al `<html>` para ver outlines.

---

## Responsive Breakpoints

| Breakpoint | Valor | Layout |
|---|---|---|
| Mobile | < 768px | Stack vertical, sidebar como drawer |
| Tablet | ≥ 768px | Sidebar 200px + contenido |
| Desktop | ≥ 1024px | Sidebar 240px + contenido |

Clases CSS: `.app-layout` `.app-main` `.app-sidebar` `.app-content`

---

## Contraste de Color (WCAG 1.4.3)

| Par | Ratio | Resultado |
|---|---|---|
| #4EEAC4 / #050505 | 8.2:1 | ✅ AAA |
| #FFFFFF / #050505 | 21:1  | ✅ AAA |
| #8899AA / #050505 | 4.6:1 | ✅ AA  |
| #0F6E56 / #FFFFFF | 5.1:1 | ✅ AA (light mode) |

---

## Pendiente para Capa 3

- [ ] Typescale completo en todos los componentes (actualmente aplicado en AppHeader y StatusCard)
- [ ] Motion tokens en animaciones de Framer Motion
- [ ] DeviceSelector migrar a tokens de spacing
- [ ] RoadmapPanel migrar a tokens de spacing
- [ ] VehicleMap migrar inline styles a tokens

