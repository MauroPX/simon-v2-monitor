# ADR-008 — Polling vs WebSocket
**Estado:** LOCK | **Fecha:** 2026-06-03

**Decisión:** Polling 5s + requestAnimationFrame

**Razón:** Netlify Functions no soporta WebSockets. Polling + rAF logra el mismo efecto visual con menor complejidad para el scope de 16h.

**Consecuencias:** React Query maneja retry y cache. Marcador interpolado durante 5s sin saltos bruscos.
