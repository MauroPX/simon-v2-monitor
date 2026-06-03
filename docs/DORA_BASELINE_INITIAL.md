# DORA_BASELINE_INITIAL.md
# simon-v2-monitor | Fecha: 2026-06-03

## Métricas DORA — Baseline inicial (Sprint 1)

| Métrica | Baseline | Target |
|---|---|---|
| Deployment Frequency | 1/día (manual) | 1/día (automático via Netlify) |
| Lead Time for Changes | ~2h | < 1h |
| Change Failure Rate | No medido | < 10% |
| Time to Restore | No medido | < 30min (canary rollback) |

## Notas
- Deploy automático activo desde GitHub → Netlify (main branch)
- Rollback: `netlify rollback` disponible en CLI
- CI/CD: GitHub Actions con 5 jobs (lint, type-check, test, a11y, build)

**Firmado:** Design Engineer | 2026-06-03
