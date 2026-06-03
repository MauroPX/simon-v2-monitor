/**
 * lib/utils — Tests de funciones puras
 * Cubre: knotsToKmh, courseToCardinal, getBatteryState, lerp, timeAgo
 */
import { knotsToKmh, courseToCardinal, getBatteryState, lerp, interpolatePosition } from '@/lib/utils'

describe('knotsToKmh — conversión de velocidad', () => {
  it('convierte 0 nudos a 0 km/h', () => expect(knotsToKmh(0)).toBe(0))
  it('convierte 1 nudo a 1.852 km/h', () => expect(knotsToKmh(1)).toBe(1.9))
  it('convierte 60 nudos correctamente', () => expect(knotsToKmh(60)).toBe(111.1))
  it('NUNCA devuelve nudos crudos — siempre multiplica por 1.852', () => {
    expect(knotsToKmh(10)).not.toBe(10)
    expect(knotsToKmh(10)).toBe(18.5)
  })
})

describe('courseToCardinal — conversión de rumbo', () => {
  it('0° = Norte', () => expect(courseToCardinal(0)).toBe('N'))
  it('90° = Este', () => expect(courseToCardinal(90)).toBe('E'))
  it('180° = Sur', () => expect(courseToCardinal(180)).toBe('S'))
  it('270° = Oeste', () => expect(courseToCardinal(270)).toBe('O'))
  it('360° = Norte (wraparound)', () => expect(courseToCardinal(360)).toBe('N'))
  it('45° = NE', () => expect(courseToCardinal(45)).toBe('NE'))
})

describe('getBatteryState — estados Von Restorff', () => {
  it('< 20 = critical', () => expect(getBatteryState(15)).toBe('critical'))
  it('= 20 = warning (borde)', () => expect(getBatteryState(20)).toBe('warning'))
  it('< 40 = warning', () => expect(getBatteryState(35)).toBe('warning'))
  it('>= 40 = normal', () => expect(getBatteryState(40)).toBe('normal'))
  it('100 = normal', () => expect(getBatteryState(100)).toBe('normal'))
})

describe('lerp — interpolación lineal para marker smoothing', () => {
  it('t=0 devuelve el valor inicial', () => expect(lerp(0, 100, 0)).toBe(0))
  it('t=1 devuelve el valor final', () => expect(lerp(0, 100, 1)).toBe(100))
  it('t=0.5 devuelve el punto medio', () => expect(lerp(0, 100, 0.5)).toBe(50))
})

describe('interpolatePosition — smooth marker movement', () => {
  const from = { lat: 4.710, lng: -74.072 }
  const to   = { lat: 4.720, lng: -74.062 }

  it('t=0 devuelve posición inicial', () => {
    const r = interpolatePosition(from, to, 0)
    expect(r.lat).toBeCloseTo(4.710)
    expect(r.lng).toBeCloseTo(-74.072)
  })

  it('t=1 devuelve posición final', () => {
    const r = interpolatePosition(from, to, 1)
    expect(r.lat).toBeCloseTo(4.720)
    expect(r.lng).toBeCloseTo(-74.062)
  })

  it('t=0.5 devuelve punto medio', () => {
    const r = interpolatePosition(from, to, 0.5)
    expect(r.lat).toBeCloseTo(4.715)
  })
})
