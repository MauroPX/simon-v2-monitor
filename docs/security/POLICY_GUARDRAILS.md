# POLICY_GUARDRAILS.md
**Fecha:** 2026-06-03

## Nunca en el repo
- Tokens, API keys, JSESSIONID
- Archivos .env.local
- Datos reales de usuarios

## Secretos
- Dev: .env.local (gitignored)
- Prod: Netlify Environment Variables

**Firmado:** Design Engineer | 2026-06-03
