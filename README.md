# FleetControl — Monitor de Vehículo en Tiempo Real

SPA (Single Page Application) conectada a la API de [Traccar](https://www.traccar.org) para monitoreo GPS en tiempo real de flota vehicular. Construida como prueba técnica para el rol de **Design Engineer (UX/UI)**.

## Demo

🔗 **[Ver aplicación en vivo →](https://simon-v2-monitor.netlify.app)**

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 App Router |
| Estilos | Tailwind CSS + CSS Custom Properties (M3 tokens) |
| Estado global | Zustand |
| Data fetching | TanStack React Query (polling 5s) |
| Mapa | Leaflet + react-leaflet |
| Animaciones | Framer Motion + requestAnimationFrame |
| Proxy CORS | Netlify Functions |
| CI/CD | GitHub Actions |
| Deploy | Netlify |

## Características

- **Autenticación** contra Traccar demo4 con cookie `JSESSIONID`
- **Lista de dispositivos** con búsqueda y selector accesible (`role=listbox`)
- **Mapa interactivo** con marcador SVG que rota según el atributo `course`
- **Smooth movement**: el marcador se interpola con `requestAnimationFrame` durante los 5s del intervalo de polling — sin saltos bruscos
- **Status Card** semántica con `<dl><dt><dd>` y `aria-live="polite"`
- **3 estados UX**: Loading (skeleton) · Error (empático con retry) · Tracking (live)
- **Dark / Light mode** toggle con persistencia en `localStorage`
- **Accesibilidad WCAG 2.1 AA**: navegación 100% por teclado, `prefers-reduced-motion`, contrastes verificados con axe

## Ejecutar localmente

### Prerequisitos

- Node.js 20+
- Netlify CLI: `npm install -g netlify-cli`

### Setup

```bash
# 1. Clonar
git clone https://github.com/[usuario]/simon-v2-monitor.git
cd simon-v2-monitor

# 2. Instalar dependencias
npm install

# 3. Variables de entorno
cp .env.example .env.local
# Editar .env.local si es necesario

# 4. Levantar con Netlify CLI (activa el proxy CORS)
netlify dev
# → App en http://localhost:8888
```

### Solo UI (sin API real)

```bash
NEXT_PUBLIC_USE_MOCK=true npm run dev
# → App en http://localhost:3000 con datos simulados
```

## Scripts

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run lint         # ESLint
npm run type-check   # TypeScript
npm run test         # Jest + jest-axe
npm run test:a11y    # Solo tests de accesibilidad
```

## Decisiones de diseño

### ¿Por qué `<dl><dt><dd>` en la Status Card?
Es la forma semánticamente correcta de representar pares etiqueta-valor en HTML. Un lector de pantalla anuncia "Velocidad: 84.5 kilómetros por hora" como una unidad coherente. Usar `<div><span>` no tiene ese semántica asociativa.

### ¿Por qué polling en lugar de WebSocket?
Netlify Functions no soporta WebSockets nativos. El polling de 5s con interpolación `requestAnimationFrame` logra el mismo efecto visual (marcador que se desliza suavemente) sin la complejidad de un servidor de WebSocket adicional.

### ¿Por qué Zustand en lugar de Context?
Zustand evita re-renders en cascada. El polling actualiza la posición 12 veces por minuto — con Context, cada actualización re-renderizaría todo el árbol. Con Zustand, solo re-renderizan los componentes suscritos al slice exacto que cambió.

### Error State: "última posición conocida"
Cuando el polling falla, `React Query` mantiene el último dato con `placeholderData`. El mapa muestra el marcador en baja opacidad (opacity 0.6 + grayscale) y el banner de error aparece con `role="alert"` y foco automático en el botón "Reintentar".

## Uso de IA

La IA (Claude Sonnet) generó:
- Hook de autenticación base y estructura del proxy CORS
- Layout inicial con Tailwind
- Función de interpolación de coordenadas

Correcciones manuales clave:
1. **La IA generó la Status Card con `<div>`s anidados** → refactorizado manualmente a `<dl><dt><dd>` por corrección semántica WCAG 1.3.1
2. **La IA actualizaba el marcador con `setLatLng()` directamente** → reemplazado con interpolación `requestAnimationFrame` para movimiento suave
3. **La IA no implementó `prefers-reduced-motion`** → añadido manualmente en `globals.css` y en cada animación de Framer Motion

## Accesibilidad (WCAG 2.1 AA)

| Criterio | Implementación |
|---|---|
| 1.1.1 Contenido no textual | `aria-label` en marcador del mapa con nombre + velocidad + dirección |
| 1.3.1 Info y relaciones | `<dl><dt><dd>` en Status Card · `role=listbox` en lista |
| 1.4.3 Contraste AA | Mínimo 4.5:1 verificado con axe DevTools en ambos modos |
| 2.1.1 Teclado | Tab + Enter + Space navegan toda la app |
| 2.3.3 Animaciones | `prefers-reduced-motion` desactiva todas las animaciones |
| 2.4.1 Saltar bloques | Skip link "Saltar al contenido principal" |
| 2.4.7 Foco visible | `outline: 3px solid accent` en todos los interactivos |
| 4.1.3 Mensajes de estado | `aria-live="polite"` en tarjeta · `role="alert"` en errores |

## Roadmap (con más tiempo)

- [ ] Historial de rutas con heatmap de velocidad
- [ ] Múltiples vehículos en el mapa simultáneamente
- [ ] Atajos de teclado: `Esc` para deseleccionar, `/` para búsqueda
- [ ] Shift summary al login (contexto del turno anterior)
- [ ] Notificaciones push para alertas de batería baja
- [ ] WebSocket real vía servidor propio (no Netlify Functions)
- [ ] Tests end-to-end con Playwright

## Licencia

MIT — prueba técnica
