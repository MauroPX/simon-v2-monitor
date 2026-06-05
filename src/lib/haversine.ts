// Haversine utilities — distancia GPS y progreso de ruta
// Usado por MapCapa2 y RouteProgressPanel para calcular posición en ruta

export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R  = 6371
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180
  const a  = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Km acumulados en cada punto del array, escalados a totalRouteKm.
 * Retorna array de misma longitud: [0, km_en_p1, km_en_p2, ..., totalRouteKm]
 */
export function routeKmAtPoints(
  points: { lat: number; lng: number }[],
  totalRouteKm: number,
): number[] {
  if (points.length < 2) return points.map(() => 0)

  const segKm: number[] = []
  for (let i = 0; i < points.length - 1; i++) {
    segKm.push(haversineKm(
      points[i].lat, points[i].lng,
      points[i + 1].lat, points[i + 1].lng,
    ))
  }

  const totalHaversine = segKm.reduce((s, k) => s + k, 0)
  const scale = totalHaversine > 0 ? totalRouteKm / totalHaversine : 1

  let acc = 0
  return [0, ...segKm.map(k => { acc += k * scale; return acc })]
}

/**
 * Índice del último waypoint alcanzado dado completedKm.
 * Retorna i tal que cumKm[i] <= completedKm, clampado a [0, points.length - 1].
 */
export function findCurrentIndex(
  points: { lat: number; lng: number }[],
  completedKm: number,
  totalRouteKm: number,
): number {
  if (points.length <= 1) return 0
  if (completedKm >= totalRouteKm) return points.length - 1

  const cumKm = routeKmAtPoints(points, totalRouteKm)
  let idx = 0
  for (let i = 0; i < cumKm.length - 1; i++) {
    if (cumKm[i] <= completedKm) idx = i
  }
  return Math.max(0, Math.min(idx, points.length - 1))
}
