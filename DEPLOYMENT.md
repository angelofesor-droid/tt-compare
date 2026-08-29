# DEPLOYMENT.md — Despliegue

## Opción recomendada: Vercel

La app es Next.js estándar; Vercel la despliega sin configuración adicional.

1. Subir el repo a GitHub.
2. En Vercel: Import Project → seleccionar el repo.
3. Variables de entorno en Vercel:
   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | Cadena de conexión PostgreSQL del hosting (ver abajo) |
   | `ADMIN_PASSWORD` | Secreto del panel (fuerte) |
   | `NEXT_PUBLIC_SITE_URL` | `https://tudominio.com` |
4. Build: `npm run build` (el `postinstall` ejecuta `prisma generate`).
5. Migraciones: `npm run db:deploy` (prisma migrate deploy) contra la BD de producción.
6. Seed inicial (solo una vez): `npm run db:seed`.

## PostgreSQL en producción

Opciones sin servidor (recomendadas para el MVP):
- **Neon** / **Supabase** — plan gratuito, migración de datos simple.
- **Vercel Postgres** — integrado con Vercel.

`DATABASE_URL` debe ser la cadena directa:
`postgresql://user:password@host:5432/dbname?sslmode=require`

## Otras opciones

### VPS con Docker
```dockerfile
# Dockerfile (multistage)
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma
EXPOSE 3000
CMD ["npm", "run", "start"]
```
+ PostgreSQL en el mismo VPS o gestionado.

### Notas
- Las imágenes del catálogo se referencian por URL remota (`remotePatterns` https),
  no se almacenan localmente en el MVP. Si se descargan localmente en el futuro,
  usar un bucket (S3/R2) o `/public` con CDN.
- `npm run start` requiere el build previo (`npm run build`).
