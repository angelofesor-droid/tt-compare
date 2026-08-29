# SECURITY.md — Seguridad

## Principios

- **Validar todas las entradas**: schemas Zod en el servicio de producto (name, brandId,
  categoryId, slug, imágenes, fuentes, atributos, precio).
- **Nunca exponer secretos**: `.env` está en `.gitignore`; solo existe `.env.example`
  con valores de ejemplo.
- **Defensa en profundidad** en el panel admin.

## Panel admin (MVP)

- Ruta `/admin` protegida por **cookie firmada** (`admin_token`) con HMAC-SHA256
  (secreto = `ADMIN_PASSWORD`), `httpOnly`, `sameSite=lax` y expiración de 12 h.
- La verificación ocurre en el layout del route group protegido (Node runtime),
  con `timingSafeEqual` para evitar ataques de timing.
- `/admin/login` valida la contraseña contra `ADMIN_PASSWORD`.
- `robots.txt` bloquea `/admin`.
- **Límite conocido del MVP**: no hay rate limiting ni bloqueo por intentos.
  Sustituir por NextAuth real en V1 (recomendado).

## Base de datos

- Usuario dedicado `tt_app` con permisos solo sobre la BD de la app
  (en desarrollo se le otorgó `CREATEDB` para las shadow databases de Prisma Migrate).
- Prisma: consultas parametrizadas (sin interpolación manual de SQL).
- Índices en slugs y FKs (ver DATABASE.md).

## Prácticas aplicadas

- `next/image` con `remotePatterns` restringido a `https` (sin HTTP plano).
- Alt text en imágenes (accesibilidad + SEO).
- Formularios con `required` y validación server-side (Zod) — nunca confiar solo en el cliente.
- URLs de fuentes validadas con Zod (`z.string().url()`).
- Middleware de producción: considerar headers de seguridad (`X-Frame-Options`,
  `X-Content-Type-Options`, CSP) al desplegar detrás de un proxy.

## Checklist antes de producción

- [ ] Cambiar `ADMIN_PASSWORD` por un valor fuerte (openssl rand -base64 32)
- [ ] Activar `secure` en cookies (automático en `NODE_ENV=production`)
- [ ] HTTPS obligatorio (proxy/Vercel)
- [ ] Rate limiting en `/api/admin/login`
- [ ] Revisar `remotePatterns` de imágenes si se restringe a dominios conocidos
