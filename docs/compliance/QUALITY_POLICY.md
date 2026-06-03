# QUALITY_POLICY.md
# simon-v2-monitor | Fecha: 2026-06-03

## Política de Calidad

### Objetivos
- WCAG 2.1 AA: 0 violaciones críticas en producción
- TypeScript: zero `any` en código fuente
- Tests: cobertura de estados críticos por componente
- Bundle: First Load JS < 200KB
- LCP: < 2.5s

### Proceso
El proceso BFL (Blueprint → Forge → Lock) garantiza que ningún componente
llega a producción sin haber pasado el GATE 2 (12/12 ítems verificados).

### Métricas de seguimiento
- GATE 2 audit score por componente (docs/blueprint/ATOMIC_SPEC.json)
- CI/CD pipeline: lint + type-check + test + a11y + build (5 jobs)
- COMPONENT_REGISTRY.json: registro de componentes LOCKED

**Firmado:** Design Engineer | 2026-06-03
