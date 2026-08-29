# DEPLOYMENT.md — Despliegue a Netlify + Supabase

> Recomendado por el usuario (2026-08-29). Stack: **Netlify** (frontend + serverless Next.js)
> + **Supabase** (PostgreSQL hosteado). Ambos con plan gratuito.

## Arquitectura

```
Netlify (Next.js 16, OpenNext adapter, auto-detectado)
   │
   ├── DATABASE_URL  → Supabase Supavisor (pooler, puerto 6543, transaction mode)
   └── DIRECT_URL    → Supabase directo (puerto 5432, usado solo por Prisma Migrate)
```

## 1. Crear la base de datos en Supabase

1. Entra a https://supabase.com y crea cuenta (gratis).
2. Crea un **New project**: nombre `tt-compare`, elige región (us-east-1 o la más cercana), contraseña de la BD (guárdala).
3. Espera a que se cree (~2 min).
4. En **Project Settings → Database → Connection string**:
   - Copia la conexión **directa** (Session pooler / port 5432) → será `DIRECT_URL`
   - Copia la conexión del **pooler** (Transaction, port 6543) → será `DATABASE_URL`
   - Ambas tienen forma `postgresql://postgres.xxxx:[PASSWORD]@...` — reemplaza `[YOUR-PASSWORD]` por tu contraseña real.

## 2. Subir el código a GitHub

```bash
cd C:\Users\fesor\workspace\tt-compare
git branch -M main
# crear un repo vacío en GitHub, luego:
git remote add origin https://github.com/TU_USUARIO/tt-compare.git
git push -u origin main
```

## 3. Crear el sitio en Netlify

1. Entra a https://app.netlify.com y crea cuenta (gratis, con GitHub).
2. **Add new site → Import an existing project** → selecciona el repo `tt-compare`.
3. Netlify detecta Next.js automáticamente (build command `npm run build`, Node 22).
4. En **Site configuration → Environment variables**, agrega:
   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | (pooler Supabase, port 6543) |
   | `DIRECT_URL` | (conexión directa Supabase, port 5432) |
   | `ADMIN_PASSWORD` | secreto fuerte (`openssl rand -base64 32`) |
   | `NEXT_PUBLIC_SITE_URL` | `https://tu-proyecto.netlify.app` |
5. Deploy.

## 4. Migrar la base de datos (tablas) en Supabase

Desde el proyecto local, apuntando a Supabase:

```bash
cd C:\Users\fesor\workspace\tt-compare
set DATABASE_URL=<TU_POOLER_URL>& set DIRECT_URL=<TU_URL_DIRECTA>& npx prisma migrate deploy
```

Esto crea las tablas. Luego el seed base (categorías, marcas, atributos):

```bash
set DATABASE_URL=<TU_POOLER_URL>& set DIRECT_URL=<TU_URL_DIRECTA>& npx prisma db seed
```

## 5. Cargar el catálogo real (167 productos + reviews)

Los scripts de carga leen de `prisma/real-catalog.json` y `prisma/reviews.json` y escriben en la
`DATABASE_URL` del `.env`. Para poblar Supabase, apunta el `.env` a la BD remota y ejecútalos
(con `DIRECT_URL` también seteada):

```bash
cd C:\Users\fesor\workspace\tt-compare
# 1. tablas + seed base (categorías, marcas, atributos)
set DATABASE_URL=<POOLER>& set DIRECT_URL=<DIRECTA>& npx prisma migrate deploy
set DATABASE_URL=<POOLER>& set DIRECT_URL=<DIRECTA>& npx prisma db seed
# 2. productos del catálogo real
set DATABASE_URL=<POOLER>& npx tsx scripts/load-real-catalog.ts
# 3. durabilidad editorial de las gomas
set DATABASE_URL=<POOLER>& npx tsx scripts/set-durability.ts
# 4. reviews reales de usuarios
set DATABASE_URL=<POOLER>& npx tsx scripts/load-reviews.ts
```

## Verificación

- Abre `https://tu-proyecto.netlify.app` → debe mostrar el catálogo.
- Prueba una ficha, una comparación y el `/admin` (login con `ADMIN_PASSWORD`).
- Verifica `/sitemap.xml` y `/robots.txt`.

## Notas

- **Admin protegido** en producción: cookie `secure` (automático con `NODE_ENV=production`).
- **Imágenes**: se sirven por URL remota (hotlink); el `remotePatterns` https ya permite cualquier host.
- **Prisma 7**: el `postinstall` (`prisma generate`) corre en el build de Netlify.
- **Migraciones futuras**: `prisma migrate deploy` contra Supabase (nunca `migrate dev` en producción).
