import { NextResponse, type NextRequest } from 'next/server'

const TRACCAR_BASE = 'https://demo4.traccar.org'
const TIMEOUT_MS = 10_000

export async function POST(_req: NextRequest): Promise<NextResponse> {
  const email = process.env.TRACCAR_EMAIL
  const password = process.env.TRACCAR_PASSWORD

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Credenciales de servidor no configuradas' },
      { status: 503 }
    )
  }

  const body = new URLSearchParams({ email, password })

  let upstreamRes: Response
  try {
    upstreamRes = await fetch(`${TRACCAR_BASE}/api/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
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
      { error: 'Credenciales inválidas' },
      { status: 401 }
    )
  }

  if (!upstreamRes.ok) {
    return NextResponse.json(
      { error: `Error del servidor Traccar: ${upstreamRes.status}` },
      { status: upstreamRes.status }
    )
  }

  const session = (await upstreamRes.json()) as Record<string, unknown>
  const response = NextResponse.json(session, { status: 200 })

  const setCookie = upstreamRes.headers.get('set-cookie')
  if (setCookie) {
    response.headers.set('set-cookie', setCookie)
  }

  return response
}
