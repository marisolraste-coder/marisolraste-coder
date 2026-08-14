# Supabase — Le Miski OS

Proyecto remoto: `wcfflsfwhivbwnbkenva` (`le-miski-os-dev`).

Esta carpeta contiene migraciones revisables. No guarda contraseñas, tokens,
Secret keys, `service_role` ni fórmulas reales.

## Límites de seguridad

- El navegador usa únicamente la Publishable key.
- `le_miski_private.master_formulas` no se expone en Data API y revoca todo
  acceso a `anon` y `authenticated`.
- PRODUCTION recibe solo recetas operativas derivadas, asignadas y vigentes.
- Los permisos combinan identidad, rol, dispositivo y OP asignada.
- Los PIN se almacenan como hash y se validarán mediante una función privada.
- Las acciones sensibles se registran en `audit_events`.

Las cuentas de Marisol Rodríguez y Usuario 1 se vincularán a `profiles` solo
después de crear sus identidades en Supabase Auth.
