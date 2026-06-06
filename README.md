# simon-v2-monitor

Monitor de flota GPS en tiempo real — Prueba Técnica Design Engineer, Simon Movilidad.

## Links

- **Producción (Capa 1):** https://simon-v2-monitor-rmxm.vercel.app/?demo=true
- **Preview (Capa 2+3):** https://simon-v2-monitor-rmxm-git-feat-capa-2-lemaogo-9238s-projects.vercel.app
- **Respuesta técnica:** [docs/TECHNICAL_CHALLENGE_RESPONSE.md](./docs/TECHNICAL_CHALLENGE_RESPONSE.md)

## Ejecutar localmente

git clone https://github.com/MauroPX/simon-v2-monitor
cd simon-v2-monitor
npm install
cp .env.example .env.local
npm run dev

## Variables de entorno

| Variable | Valor |
|----------|-------|
| TRACCAR_EMAIL | admin |
| TRACCAR_PASSWORD | admin |
| TRACCAR_BASE_URL | https://demo4.traccar.org |
| NEXT_PUBLIC_APP_LAYER | capa-2 (omitir para Capa 1) |

## Arquitectura

| Capa | Rama | Estado |
|------|------|--------|
| Capa 1 | main | Producción |
| Capa 2+3 | feat/capa-2 | Preview |
