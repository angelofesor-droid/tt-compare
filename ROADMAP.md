# ROADMAP.md — Comparador de Equipamiento de Tenis de Mesa

> Plan de desarrollo por fases. Cada fase termina verificada: **tests ✓ · lint ✓ ·
> typecheck ✓ · sin errores acumulados**.
> Última actualización: 2026-08-29.

## Filosofía

Construir primero un producto **pequeño pero excelente**:

- BUEN SISTEMA + BUEN DISEÑO + DATOS CONFIABLES + IMÁGENES CORRECTAS
- COMPARACIÓN ÚTIL + ADMINISTRACIÓN SENCILLA
- El catálogo crece después: 30 productos perfectamente documentados > 300 dudosos.

---

## MVP (Fase 1 → 13)

| # | Fase | Entregable | Criterio de salida |
|---|---|---|---|
| 1 | **Auditoría y arquitectura** | ARCHITECTURE.md, DATABASE.md, ROADMAP.md | Documentos aprobados, entorno inspeccionado |
| 2 | **Inicialización técnica** | Proyecto Next.js + TS + Tailwind, scripts, git, lint | `npm run dev` arranca, `lint` y `build` OK |
| 3 | **Base de datos** | PostgreSQL local, Prisma, migración inicial, seed de categorías y atributos | `db:migrate` y `db:seed` idempotentes OK |
| 4 | **Categorías y atributos** | Modelo Category + AttributeDefinition, catálogo por categoría vacío funcional | `/rubbers`, `/blades`, `/tables` renderizan con datos reales |
| 5 | **Productos e imágenes** | CRUD producto (servicio), imágenes, fuentes, pros/contras, validación, slug | Un producto publicado aparece en catálogo con su imagen |
| 6 | **Panel administrativo** | `/admin` protegido: dashboard, lista, formulario dinámico, duplicar, archivar, preview | Crear goma desde admin SIN tocar código |
| 7 | **Homepage y catálogo** | ProductCard, grids, ordenamiento, paginación, destacados/recientes | Homepage y catálogos profesionales responsive |
| 8 | **Páginas individuales** | Ficha: galería, specs, pros/contras, fuente, similares, metadata dinámica | `/product/[slug]` completo |
| 9 | **Búsqueda y filtros** | Buscador global, filtros dinámicos por categoría | Encontrar producto por nombre/marca/modelo |
| 10 | **Comparador** | `/compare` selector 2–4, misma categoría obligatoria, tabla, vista móvil, URL limpia | Goma vs goma funciona; goma vs madero bloqueado con mensaje claro |
| 11 | **SEO** | Metadata, canonical, OG, schema.org, sitemap dinámico, robots.txt | Páginas públicas indexables, admin bloqueado |
| 12 | **Testing** | Unit/integration (Vitest) + E2E críticos (Playwright) | Casos críticos verdes (ver §Tests críticos) |
| 13 | **Optimización** | Rendimiento (imágenes, ISR, índices), accesibilidad, seguridad final | Lighthouse decente, sin JS innecesario |

### Tests críticos (Fase 12 — obligatorios)

1. Una goma puede compararse con otra goma. ✅
2. Un madero puede compararse con otro madero. ✅
3. Una mesa puede compararse con otra mesa. ✅
4. Una goma NO puede compararse con un madero (mensaje claro). ✅
5. Un producto publicado tiene imagen principal. ✅
6. Un producto sin datos obligatorios NO puede publicarse. ✅
7. Nombre e imagen llevan a la página correcta. ✅

---

## V1 (post-MVP)

| Área | Contenido |
|---|---|
| Usuarios y auth | NextAuth, roles (admin/editor), login real |
| Reviews | Reseñas moderadas por usuarios, con fuentes |
| Ofertas | Tiendas (Store), ofertas (Offer), enlaces de afiliado (AffiliateLink) |
| Precios | Múltiples ofertas por producto, actualización semi-manual |
| Búsqueda | Full-text (tsvector) o Meilisearch |
| SEO avanzado | Comparaciones curadas indexables, páginas de marca |
| Catálogo | Ampliación: pelotas, fundas, pegamentos, paletas completas |

## V2

| Área | Contenido |
|---|---|
| Precios | Historial y alertas de precio |
| Importación | Masiva (CSV/JSON), APIs públicas |
| Personalización | Perfiles de jugador, recomendaciones por estilo |
| Comunidad | Favoritos, listas "mi equipo" |
| Monetización | Afiliados completos, analytics |

---

## Reglas de ejecución

- **No acumular errores**: después de cada fase: tests → lint → typecheck → corregir → continuar.
- **Inspeccionar antes de modificar**: leer un archivo antes de editarlo; reutilizar
  componentes existentes antes de crear uno nuevo; justificar cada dependencia.
- **No destruir código sin comprenderlo.**
- **Datos**: nunca inventar productos, imágenes, specs, precios, reviews ni fuentes.
  Falta información → "No disponible".
- **Escalabilidad**: paginación, búsqueda, filtros, índices y componentes reutilizables
  desde el día uno; el sistema debe funcionar bien con 30 productos y aguantar 10.000+.

## Estado actual

- [x] Fase 1: auditoría de entorno + documentos de arquitectura (2026-08-29)
- [x] Fase 2: inicialización técnica — Next.js 16 + TS + Tailwind + lint + build (2026-08-29)
- [x] Fase 3: base de datos — PostgreSQL 17 + Prisma 7, migración init, seed idempotente (2026-08-29)
- [x] Fase 4: categorías y atributos — modelo Category + AttributeDefinition, rutas /rubbers /blades /tables (2026-08-29)
- [x] Fase 5: productos e imágenes — servicio CRUD, validación Zod, slug único, reglas de publicación (2026-08-29)
- [x] Fase 6: panel administrativo — /admin protegido (cookie HMAC), dashboard, lista, formulario dinámico, duplicar, archivar, preview (2026-08-29)
- [x] Fase 7: homepage y catálogo — ProductCard, grids, orden, paginación, destacados/recientes (2026-08-29)
- [x] Fase 8: páginas individuales — galería, specs, pros/contras, fuentes, relacionados, metadata dinámica (2026-08-29)
- [x] Fase 9: búsqueda y filtros — buscador global + filtros dinámicos por categoría (2026-08-29)
- [x] Fase 10: comparador — selector 2–4, misma categoría obligatoria, tabla, vista móvil, URL limpia (2026-08-29)
- [x] Fase 11: SEO — metadata, canonical, OG, Schema.org, sitemap dinámico, robots.txt (2026-08-29)
- [x] Fase 12: testing — Vitest 20 tests (unit + integración): slug, validación, creación, comparación (2026-08-29)
- [x] Fase 13: optimización — imágenes optimizadas, índices, paginación, componentes reutilizables, build de producción OK (2026-08-29)

Pendiente (no bloqueante para el MVP): E2E Playwright, revisión de accesibilidad con
herramientas externas, deploy. Ver DEPLOYMENT.md.

> **Ampliación por decisión del usuario (2026-08-29):** se incorporaron al MVP
> (a) comentarios de usuarios con media y durabilidad según usuarios (ProductReview,
> 96 reviews reales citadas de RevSpin en 16 fichas) y (b) atributo `durability`
> (valoración editorial 1-10) en gomas. El catálogo real cuenta con 38 productos
> verificados (15 gomas, 14 maderos, 9 mesas).
