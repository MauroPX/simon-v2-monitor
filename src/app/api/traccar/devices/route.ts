import { NextResponse, type NextRequest } from 'next/server'

const TRACCAR_BASE = 'https://demo4.traccar.org'
const TIMEOUT_MS = 10_000

export async function GET(req: NextRequest): Promise<NextResponse> {
  const cookie = req.headers.get('cookie') ?? ''

  let upstreamRes: Response
  try {
    upstreamRes = await fetch(`${TRACCAR_BASE}/api/devices`, {
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

  const devices = (await upstreamRes.json()) as unknown[]
  return NextResponse.json(devices)
}
