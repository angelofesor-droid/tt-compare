# TT Compare

Comparador de equipamiento de tenis de mesa: **gomas, maderos y mesas** con características
verificadas contra fuentes oficiales, fichas completas, filtros dinámicos y comparación
lado a lado.

> Catálogo especializado + base de datos + comparador + guía de compra.
> No es una tienda ni una demo: es un producto comercial real.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 |
| Backend | Next.js Server Components · Server Actions · Route Handlers |
| Base de datos | PostgreSQL 17 · Prisma 7 (ORM) |
| Validación | Zod |
| Testing | Vitest (unit + integración) |
| Lint | ESLint (config Next.js) |

## Requisitos

- Node.js ≥ 20.19 (recomendado 22+)
- PostgreSQL 15+ (local) — en Windows: `winget install PostgreSQL.PostgreSQL.17`

## Puesta en marcha (desarrollo)

```bash
# 1. Instalar dependencias (genera el cliente Prisma vía postinstall)
npm install

# 2. Configurar variables de entorno
cp .env.example .env
#    → DATABASE_URL: postgresql://usuario:password@localhost:5432/tt_compare
#    → ADMIN_PASSWORD: secreto del panel (openssl rand -base64 32)

# 3. Crear BD + aplicar migraciones + seed (categorías, marcas, atributos, productos demo)
createdb tt_compare          # o crea la BD con tu cliente de PostgreSQL
npm run db:migrate           # crea las tablas
npm run db:seed              # datos base + productos demo marcados como (demo)

# 4. Arrancar
npm run dev                  # http://localhost:3000
```

Panel admin: `http://localhost:3000/admin` (contraseña = `ADMIN_PASSWORD`).

## Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servir build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sin emitir |
| `npm test` | Vitest (unit + integración) |
| `npm run db:migrate` | Prisma migrate dev |
| `npm run db:deploy` | Prisma migrate deploy (producción) |
| `npm run db:seed` | Seed idempotente |
| `npm run db:studio` | Prisma Studio |

## Documentación

- [ARCHITECTURE.md](ARCHITECTURE.md) — arquitectura del sistema
- [DATABASE.md](DATABASE.md) — modelo de datos
- [ROADMAP.md](ROADMAP.md) — plan de desarrollo por fases
- [SEO.md](SEO.md) — estrategia SEO
- [SECURITY.md](SECURITY.md) — seguridad
- [DEPLOYMENT.md](DEPLOYMENT.md) — despliegue
- [IMAGE-SOURCES.md](docs/IMAGE-SOURCES.md) — política de imágenes del catálogo

## Reglas del producto (resumen)

1. **El sistema primero, los datos después**: agregar un producto nuevo nunca requiere tocar código.
2. **Atributos dinámicos por categoría**: los filtros y formularios se derivan de la base de datos.
3. **No inventar datos**: falta información → "No disponible".
4. **Escalas de fabricante no son comparables entre sí**: se conservan valor original + escala + fuente.
5. **Imagen principal correcta y consistente** en todas las apariciones del producto.
6. **Comparación solo dentro de la misma categoría** (goma vs goma, madero vs madero, mesa vs mesa).

## Estado

MVP funcional (Fases 1–12 del ROADMAP): catálogo, fichas, búsqueda, filtros dinámicos,
comparador, panel admin protegido, SEO, testing y datos demo identificados.
Ver [ROADMAP.md](ROADMAP.md) para el detalle y el estado de cada fase.
