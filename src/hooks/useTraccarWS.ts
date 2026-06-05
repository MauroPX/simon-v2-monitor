'use client'

import { useEffect, useRef, useState } from 'react'
import { useTraccarLive } from './useTraccarLive'
import { useAppStoreV2 } from '@/store/useAppStoreV2'
import type { TraccarDevice, TraccarPosition } from '@/types/traccar'

export type WsStatus = 'connecting' | 'open' | 'closed' | 'error' | 'fallback'

interface WsMessage {
  devices?:   TraccarDevice[]
  positions?: TraccarPosition[]
}

const WS_URL    = 'wss://demo4.traccar.org/api/socket'
const MAX_RETRY = 4
const STALE_MS  = 30_000

export function useTraccarWS() {
  // ── Always call polling hook first — keeps React Query cache warm
  // and provides demo data immediately while WS connects (or if it fails)
  const pollingData = useTraccarLive()

  const { setConnectionState } = useAppStoreV2()

  const [wsStatus,      setWsStatus]      = useState<WsStatus>('connecting')
  const [wsDevices,     setWsDevices]     = useState<TraccarDevice[]>([])
  const [wsPositions,   setWsPositions]   = useState<Record<number, TraccarPosition>>({})
  const [usingFallback, setUsingFallback] = useState(false)

  const wsRef            = useRef<WebSocket | null>(null)
  const retriesRef       = useRef(0)
  const lastMsgRef       = useRef(Date.now())
  const mountedRef       = useRef(true)
  const usingFallbackRef = useRef(false)
  const timerRef         = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Stale detection when WS is open
  useEffect(() => {
    if (wsStatus !== 'open') return
    const id = setInterval(() => {
      if (Date.now() - lastMsgRef.current > STALE_MS) setConnectionState('stale')
    }, 5_000)
    return () => clearInterval(id)
  }, [wsStatus, setConnectionState])

  // WS lifecycle — runs once; managed via refs to avoid stale closures
  useEffect(() => {
    mountedRef.current = true

    async function tryConnect(): Promise<void> {
      if (!mountedRef.current || usingFallbackRef.current) return

      // Exponential backoff on retries
      if (retriesRef.current > 0) {
        await new Promise<void>(resolve => {
          timerRef.current = setTimeout(
            resolve,
            Math.min(1_000 * 2 ** (retriesRef.current - 1), 8_000),
          )
        })
      }
      if (!mountedRef.current) return

      // 1. Obtain JSESSIONID via proxy
      try {
        const res = await fetch('/api/traccar/session', {
          method: 'POST',
          signal: AbortSignal.timeout(8_000),
        })
        if (!res.ok) throw new Error('no-session')
      } catch {
        if (!mountedRef.current) return
        usingFallbackRef.current = true
        setUsingFallback(true)
        setWsStatus('fallback')
        return
      }

      if (!mountedRef.current) return

      // 2. Open WebSocket — browser sends cookies for demo4.traccar.org automatically
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        if (!mountedRef.current) return
        retriesRef.current = 0
        lastMsgRef.current = Date.now()
        setWsStatus('open')
      }

      ws.onmessage = (e: MessageEvent<string>) => {
        if (!mountedRef.current) return
        lastMsgRef.current = Date.now()
        try {
          const msg = JSON.parse(e.data) as WsMessage
          if (msg.devices?.length) setWsDevices(msg.devices)
          const incoming = msg.positions
          if (incoming?.length) {
            setWsPositions(prev => {
              const next = { ...prev }
              for (const p of incoming) next[p.deviceId] = p
              return next
            })
          }
        } catch { /* ignore malformed JSON */ }
      }

      ws.onerror = () => {
        if (mountedRef.current) setWsStatus('error')
      }

      ws.onclose = () => {
        if (!mountedRef.current) return
        setWsStatus('closed')
        retriesRef.current++
        if (retriesRef.current >= MAX_RETRY) {
          usingFallbackRef.current = true
          setUsingFallback(true)
          setWsStatus('fallback')
        } else {
          void tryConnect()
        }
      }
    }

    void tryConnect()

    return () => {
      mountedRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
      wsRef.current?.close()
      wsRef.current = null
    }
  }, []) // deps: none — all mutable state accessed via refs

  // Fallback mode → return polling data transparently
  if (usingFallback) {
    return { ...pollingData, wsStatus: 'fallback' as WsStatus }
  }

  // While WS is connecting or has no data yet → return polling (demo) data
  // so the UI is never empty
  const hasWsData = wsDevices.length > 0
  return {
    devices:         hasWsData ? wsDevices   : pollingData.devices,
    positions:       hasWsData ? wsPositions : pollingData.positions,
    dataSource:      pollingData.dataSource,
    connectionState: pollingData.connectionState,
    wsStatus,
  }
}
