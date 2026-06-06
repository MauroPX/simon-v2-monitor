# simon-v2-monitor — Respuesta a la Prueba Técnica
**Autor:** Leonel Mauricio Gómez Ocampo — Staff Product Architect
**Repo:** https://github.com/MauroPX/simon-v2-monitor
**Producción (Capa 1):** https://simon-v2-monitor-rmxm.vercel.app/?demo=true
**Preview (Capa 2+3):** https://simon-v2-monitor-rmxm-git-feat-capa-2-lemaogo-9238s-projects.vercel.app

---

## PROCESO — TITAN v7.0

Construí el producto usando TITAN v7.0, un framework de orquestación
multi-LLM de mi autoría. El ciclo es siempre:
1. Banco de contexto — la IA lee todos los archivos antes de escribir
2. Plan — la IA propone, yo evalúo
3. Confirmación — yo apruebo o corrijo
4. Ejecución — solo entonces la IA escribe código

Arquitectura de 3 capas evolutivas en ramas separadas de Git:
- main: Capa 1 certificada y congelada (LOCKED)
- feat/capa-2: Capa 2+3 encima sin romper Capa 1

---

## REQUISITO 1 — CONEXIÓN Y CONSUMO API TRACCAR

### a) Autenticación

Problema: CORS bloquea llamadas directas del browser a demo4.traccar.org.

Solución: Proxy server-side via Next.js API Routes.
  Browser → /api/traccar/session (mismo dominio, sin CORS)
  → Next.js API Route (Vercel, servidor)
  → POST demo4.traccar.org/api/session (server-to-server)
  → Cookie JSESSIONID retornada

Credenciales en variables de entorno de Vercel, nunca en el browser.
Documentado en ADR-009.

### b) Consumo del flujo de datos

| Endpoint | Archivo | Comportamiento |
|----------|---------|----------------|
| POST /api/session | src/app/api/traccar/session/route.ts | Autentica, retorna JSESSIONID |
| GET /api/devices | src/app/api/traccar/devices/route.ts | Lista dispositivos |
| GET /api/positions | src/app/api/traccar/positions/route.ts | Posiciones por deviceId |

Polling: React Query, intervalo 5 segundos (useTraccarLive.ts)
WebSocket (Capa 3): useTraccarWS.ts conecta a wss://demo4.traccar.org/api/socket
  - Fallback automático a polling si WS falla
  - Reconexión con backoff: 1s → 2s → 4s → 8s → fallback definitivo

Fallback resiliente: si Traccar falla → fleet-simulation.json
(12 vehículos simulados en Bogotá). Badge DEMO indica la fuente.

---

## REQUISITO 2 — ESTADOS CRÍTICOS DE UX

### a) Skeleton State

Shimmer animado con dimensiones exactas al contenido real.
CLS = 0. aria-busy="true" aria-label="Cargando datos del vehículo".

En Capa 2: el dashboard arranca con datos demo inmediatamente.
El skeleton solo aparece si connecting Y sin datos disponibles.
Anti-patrón evitado: no bloquear la UI cuando ya hay datos válidos.

### b) Error State

- Overlay empático: mensaje en lenguaje humano, no código de error
- Micro-copy: "No pudimos conectar con el servidor."
- Botón Reintentar funcional, sin recargar la página
- role="alert" aria-live="assertive"

### c) Marker Smoothing

Capa 1: lerp (interpolación lineal) con requestAnimationFrame.
  lat = lerp(currentLat, targetLat, 0.08) — avanza 8% hacia el objetivo por frame
  Sin lerp: el marker salta cada 5s. Con lerp: movimiento continuo.

Capa 2+3: react-leaflet-tracking-marker — anima bearing y transición automáticamente.

---

## REQUISITO 3 — UI/UX Y DISEÑO

### a) Sistema de Diseño y Tokens

Tokens CSS en src/styles/bem.css y src/app/globals.css:
  --color-primary:   #00ffc2  (extraído de simonmovilidad.com en producción)
  --color-bg:        #080808
  --color-surface:   #111111
  --color-online:    #00ffc2
  --color-offline:   #888780
  --color-danger:    #E24B4A
  --color-warning:   #EF9F27

BEM en archivo separado: Tailwind purga clases no usadas en build.
Archivo CSS separado resuelve el problema de purge.

### b) Dark/Light Mode

Toggle en el header. Dark-first: decisión de negocio.
Operadores 24/7 en baja luz — un fondo blanco es fatiga visual.
Contraste dark: mínimo AAA (7:1). Light: mínimo AA (4.5:1).

### c) Micro-interacciones

- Velocidad: transition color 300ms al cambiar
- Batería crítica (<20%): barra roja con pulse sutil
- Badge online: punto verde con pulse
- Alertas velocidad: toast con barra de progreso 5s
- Botones: transition all 200ms ease
- prefers-reduced-motion: todas las animaciones deshabilitadas

### d) Tarjeta de Estado

Jerarquía:
  Placa + estado de conexión (primer nivel visual)
  Nombre del vehículo
  Ruta origen → destino + ETA
  Telemetría: velocidad km/h + batería + conductor
  Métricas grandes: km cumplidos · ETA · km faltantes

Conversión de nudos: velocidadKmh = nudos × 1.852
  (Traccar devuelve nudos — corregido sobre output de IA)
Última actualización: timeAgo() → "Ahora mismo" / "Hace 2 min" / "14:32:01"

---

## REQUISITO 4 — MAPA INTERACTIVO

Librería: Leaflet + react-leaflet
Tile: OpenStreetMap (Capa 1) / CartoDB Dark (Capa 2+3)
Centro automático: el mapa centra en el vehículo seleccionado.

Marcador SVG con course:
  - Rota según atributo course de Traccar
  - Color según estado: online #00ffc2 / offline gris / stale ámbar

Capa 3 — features adicionales:
  - Rastro SVG: últimas 30 posiciones (línea punteada #00ffc2)
  - Cluster: agrupa vehículos cercanos en zoom < 14
  - Polilínea ruta 3 segmentos: verde cumplida / pulse actual / gris faltante

---

## REQUISITO 5 — ACCESIBILIDAD WCAG 2.1 AA

### Estructura semántica

StatusCard usa dl/dt/dd para pares etiqueta-valor:
  <dl>
    <dt>Velocidad</dt>
    <dd aria-live="polite" aria-atomic="true">45 km/h</dd>
    <dt>Batería</dt>
    <dd><div role="progressbar" aria-valuenow="85"
             aria-valuemin="0" aria-valuemax="100"
             aria-label="Batería al 85%"></div></dd>
  </dl>

### Navegación por teclado

Todos los elementos operables con Tab, Space, Enter:
  - Toggle dark/light
  - Selector de vehículos (listbox con role="option")
  - Botones de estado demo
  - Controles del mapa
  - Botón Reintentar
  - Botones reordenamiento paneles (WCAG 2.5.7)

### Focus visible

  :focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
  Nunca outline:none sin reemplazo.

### Atributos accesibles

| Elemento | Atributo | Valor |
|----------|----------|-------|
| Marcador mapa | aria-label | "Alpha-01 — En línea" |
| Velocidad StatusCard | aria-live="polite" | Cambios sin interrumpir |
| Alertas velocidad | role="alert" aria-live="assertive" | Anuncia inmediatamente |
| Skeleton | aria-busy="true" | Indica carga |
| Error overlay | role="alert" | Anuncia el error |
| Cluster | aria-label | "Grupo de N vehículos" |

---

## CORRECCIONES APLICADAS SOBRE OUTPUTS DE IA

### 1. Conversión nudos → km/h
IA generó SpeedAlert comparando speed directamente con 80.
Traccar devuelve nudos. 55 nudos = 102 km/h.
Fix: speedKmh = speed × 1.852 antes de comparar y de mostrar.

### 2. Tile del mapa
IA eligió OpenStreetMap claro. Contraste insuficiente con #00ffc2.
Fix: CartoDB Dark All. Decisión de dirección de arte.

### 3. Skeleton bloqueante
Store inicializaba dataSource='demo' y connectionState='connecting'.
IA bloqueaba el render aunque los datos demo ya estuvieran disponibles.
Fix:
  ANTES:  if (connectionState === 'connecting') return <GlobalConnectingState />
  DESPUÉS: if (connectionState === 'connecting' && dataSource !== 'demo')
             return <GlobalConnectingState />

---

## ROADMAP — CAPAS EVOLUTIVAS

| Capa | Estado | Features |
|------|--------|----------|
| Capa 1 | Producción | Mock, estados UI, dark/light, WCAG, lerp |
| Capa 2 | Preview | Traccar real, proxy CORS, 12 vehículos Bogotá, ruta Haversine |
| Capa 3 | Preview | WebSocket, alertas velocidad, rastro SVG, cluster |
| Capa 4 | Roadmap | Geofencing, alertas de zona, reportes automáticos |
| Capa 5 | Roadmap | Multi-tenant, roles operador/supervisor/admin |

---

## CÓMO EJECUTAR LOCALMENTE

git clone https://github.com/MauroPX/simon-v2-monitor
cd simon-v2-monitor
npm install
cp .env.example .env.local

Editar .env.local:
  TRACCAR_EMAIL=admin
  TRACCAR_PASSWORD=admin
  TRACCAR_BASE_URL=https://demo4.traccar.org
  NEXT_PUBLIC_APP_LAYER=capa-2

npm run dev
  Capa 1: http://localhost:3000/?demo=true
  Capa 2+3: http://localhost:3000 (con NEXT_PUBLIC_APP_LAYER=capa-2)
