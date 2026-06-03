# RISK_REGISTER.md
# simon-v2-monitor | M1 Compliance
# Fecha: 2026-06-03

| ID | Activo | Amenaza | Prob | Impacto | Control | Residual |
|---|---|---|---|---|---|---|
| R01 | API Traccar demo | Caída del servidor | Alta | Medio | Fallback UI + última posición | Bajo |
| R02 | JSESSIONID | Secuestro de sesión | Baja | Medio | HttpOnly cookie | Bajo |
| R03 | Deploy Netlify | Regresión en producción | Baja | Alto | CI/CD + rollback automático | Bajo |
| R04 | Dependencias npm | CVE crítico | Media | Alto | Dependabot en GitHub | Bajo |
| R05 | Proxy CORS | Abuso de endpoints | Baja | Bajo | ALLOWED_PATHS whitelist | Mínimo |

**Firmado:** Design Engineer | 2026-06-03
