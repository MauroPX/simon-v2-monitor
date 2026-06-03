// src/lib/utils.ts
// Funciones puras — zero side effects
// Usadas por hooks y componentes sin importar lógica de negocio

// ============================================================
// CONVERSIÓN DE VELOCIDAD
// ADR-001 — Traccar devuelve nudos, la UI muestra km/h
// ============================================================
/** Convierte velocidad de nudos a km/h. API Traccar devuelve nudos. */
export function knotsToKmh(knots: number): number {
  return parseFloat((knots * 1.852).toFixed(1))
}

// ============================================================
// TIEMPO RELATIVO (sin dependencia de date-fns para casos simples)
// WCAG: texto legible para humanos en la StatusCard
// ============================================================
/** Formatea una fecha ISO como texto relativo legible. Ej: "Hace 30 segundos". */
export function timeAgo(isoString: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)

  if (seconds < 5)  return 'Ahora mismo'
  if (seconds < 60) return `Hace ${seconds} segundos`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`

  const days = Math.floor(hours / 24)
  return `Hace ${days} ${days === 1 ? 'día' : 'días'}`
}

// ============================================================
// CONVERSIÓN DE COURSE A CARDINAL
// 0=N, 45=NE, 90=E, etc.
// ============================================================
/** Convierte rumbo en grados (0-360) a punto cardinal. Ej: 45° → "NE". */
export function courseToCardinal(course: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']
  const index = Math.round(((course % 360) + 360) % 360 / 45) % 8
  return directions[index]
}

// ============================================================
// NIVEL DE BATERÍA — determina color semántico
// Von Restorff: batería baja atrae atención inmediata
// ============================================================
/** Estado visual de la batería según nivel. Determina color del BatteryBar átomo. */
export type BatteryState = 'critical' | 'warning' | 'normal'

/** Clasifica nivel de batería en estado visual. < 20 = critical (Von Restorff). */
export function getBatteryState(level: number): BatteryState {
  if (level < 20) return 'critical'
  if (level < 40) return 'warning'
  return 'normal'
}

// ============================================================
// INTERPOLACIÓN LINEAL — para marker smoothing
// Calcula posición intermedia entre dos coordenadas
// ============================================================
/** Interpolación lineal entre dos valores. Usada para smooth marker movement (rAF). */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export interface LatLng {
  lat: number
  lng: number
}

/** Interpola entre dos posiciones GPS. t=0 retorna from, t=1 retorna to. */
export function interpolatePosition(from: LatLng, to: LatLng, t: number): LatLng {
  return {
    lat: lerp(from.lat, to.lat, t),
    lng: lerp(from.lng, to.lng, t),
  }
}

// ============================================================
// PROXY URL — construye la URL al proxy de Netlify
// ADR-004 — toda comunicación con Traccar pasa por aquí
// ============================================================
/** Construye URL al proxy Netlify de Traccar. ADR-004 — toda llamada pasa por aquí. */
export function traccarUrl(path: string, params?: Record<string, string | number>): string {
  const base = '/.netlify/functions/traccar'
  const query = new URLSearchParams({ path, ...Object.fromEntries(
    Object.entries(params ?? {}).map(([k, v]) => [k, String(v)])
  )})
  return `${base}?${query.toString()}`
}

// ============================================================
// CLASE CONDICIONAL — utility para componer clases CSS
// ============================================================
/** Combina clases CSS filtrando valores falsy. Utility para composición condicional. */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
