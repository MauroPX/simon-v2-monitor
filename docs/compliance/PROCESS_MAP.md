# PROCESS_MAP.md
# simon-v2-monitor | Fecha: 2026-06-03

## Mapa de Proceso BPM

```
M0 Onboarding → M1 Discovery → M2 Architecture → M3 Execution
     ↓                ↓               ↓                ↓
PROJECT_MANIFEST  USER_TASKS      SPEC_DOCUMENT    Sprint BFL
ADRs              THREAT_MODEL    DESIGN_SPEC      ATOMIC_SPEC
Compliance        ROADMAP_v1      CI/CD            COMPONENT_REGISTRY
```

## Proceso de construcción de componentes (BFL)
```
BLUEPRINT (ATOMIC_SPEC.json) → FORGE (código + tests) → LOCK (COMPONENT_REGISTRY)
        ↓ GATE 1                      ↓ GATE 2 12/12          ↓ GATE 3
   atomic_level               hex=0, aria, data-atomic      REGISTRY firmado
   BEM definido               JSDoc, TypeScript strict       VERSION_CERTIFICATE
```

## Roles
- Design Engineer: PM + TL + Designer + Dev + TPM (unipersonal — prueba técnica)
- IA Copiloto: Claude Sonnet 4.6 (revisado y dirigido por Design Engineer)

**Firmado:** Design Engineer | 2026-06-03
