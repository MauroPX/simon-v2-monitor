import { NextResponse, type NextRequest } from 'next/server'
import { knotsToKmh } from '@/lib/utils'

const TRACCAR_BASE = 'https://demo4.traccar.org'
const TIMEOUT_MS = 10_000

interface RawPosition {
  speed: number
  [key: string]: unknown
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const cookie = req.headers.get('cookie') ?? ''
  const deviceId = req.nextUrl.searchParams.get('deviceId')

  const url = new URL(`${TRACCAR_BASE}/api/positions`)
  if (deviceId) url.searchParams.set('deviceId', deviceId)

  let upstreamRes: Response
  try {
    upstreamRes = await fetch(url.toString(), {
      headers: { Cookie: cookie },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error'
    return NextResponse.json(
      { error: `No se pudo conectar con Traccar: ${message}` },
      { status: 503 }
    )
  }

  if (upstreamRes.status === 401) {
    return NextResponse.json(
      { error: 'Sesión expirada o no autenticado' },
      { status: 401 }
    )
  }

  if (!upstreamRes.ok) {
    return NextResponse.json(
      { error: `Error del servidor Traccar: ${upstreamRes.status}` },
      { status: upstreamRes.status }
    )
  }

  const raw = (await upstreamRes.json()) as RawPosition[]
  const converted = raw.map(pos => ({ ...pos, speed: knotsToKmh(pos.speed) }))
  return NextResponse.json(converted)
}
