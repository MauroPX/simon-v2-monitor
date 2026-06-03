# SECURITY_POLICY.md
# simon-v2-monitor | Fecha: 2026-06-03

## Política de Seguridad

### Clasificación de datos
| Nivel | Datos | Control |
|---|---|---|
| Público | Posiciones GPS demo Traccar | Sin restricción |
| Interno | Token JSESSIONID | Cookie HttpOnly, no persiste |
| Confidencial | Variables de entorno | Netlify Env Vars, nunca en repo |

### Controles obligatorios
- Ningún secreto en el repositorio (verificado con .gitignore)
- Proxy CORS obligatorio (ADR-004) — sin llamadas directas desde browser
- Headers de seguridad en netlify.toml (CSP, HSTS, X-Frame-Options)
- HTTPS obligatorio (Netlify enforces por defecto)

### Gestión de incidentes
- P0: rollback inmediato con `netlify rollback`
- Secreto expuesto: revocar en Netlify UI → nuevo deploy

**Firmado:** Design Engineer | 2026-06-03
