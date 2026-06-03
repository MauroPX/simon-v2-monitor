// netlify/functions/traccar.ts
// Proxy CORS para API de Traccar demo4.traccar.org
// ADR-004 — evita ERR_CORS en llamadas desde el browser
// Maneja: session · devices · positions
// Reenvía cookies JSESSIONID bidireccionales

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'

const TRACCAR_BASE = 'https://demo4.traccar.org'

const ALLOWED_PATHS: Record<string, string[]> = {
  '/api/session': ['GET', 'POST', 'DELETE'],
  '/api/devices': ['GET'],
  '/api/positions': ['GET'],
  '/api/server': ['GET'],
  '/api/events': ['GET'],
}

function isAllowedPath(path: string): boolean {
  return Object.keys(ALLOWED_PATHS).some(allowed => path.startsWith(allowed))
}

export const handler: Handler = async (
  event: HandlerEvent,
  _context: HandlerContext
) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.URL || 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Cookie',
    'Access-Control-Allow-Credentials': 'true',
  }

  // Pre-flight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' }
  }

  // Extraer el path de la API de Traccar desde query param
  const targetPath = event.queryStringParameters?.path
  if (!targetPath || !isAllowedPath(targetPath)) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Path no permitido', path: targetPath }),
    }
  }

  // Construir query string (ej: deviceId=101&limit=1)
  const queryParams = { ...event.queryStringParameters }
  delete queryParams.path
  const queryString = new URLSearchParams(queryParams as Record<string, string>).toString()
  const url = `${TRACCAR_BASE}${targetPath}${queryString ? '?' + queryString : ''}`

  // Headers al upstream — reenviar cookie de sesión
  const upstreamHeaders: Record<string, string> = {
    'Content-Type': event.headers['content-type'] || 'application/json',
  }
  if (event.headers.cookie) {
    upstreamHeaders['Cookie'] = event.headers.cookie
  }

  try {
    const response = await fetch(url, {
      method: event.httpMethod,
      headers: upstreamHeaders,
      body: event.body || undefined,
    })

    const responseHeaders: Record<string, string> = { ...corsHeaders }

    // Reenviar Set-Cookie al cliente (JSESSIONID)
    const setCookie = response.headers.get('set-cookie')
    if (setCookie) {
      // Adaptar la cookie para SameSite en el proxy
      const adaptedCookie = setCookie
        .replace(/SameSite=Lax/i, 'SameSite=None; Secure')
        .replace(/SameSite=Strict/i, 'SameSite=None; Secure')
      responseHeaders['Set-Cookie'] = adaptedCookie
    }

    responseHeaders['Content-Type'] = response.headers.get('content-type') || 'application/json'

    const body = await response.text()

    return {
      statusCode: response.status,
      headers: responseHeaders,
      body,
    }
  } catch (error) {
    console.error('[traccar-proxy] Error:', error)
    return {
      statusCode: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'No pudimos conectar con el servidor de Traccar',
        detail: error instanceof Error ? error.message : 'Unknown error',
      }),
    }
  }
}
