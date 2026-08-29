import prisma from "@/lib/prisma";
import { ProductStatus } from "@/generated/prisma/enums";
import { slugify } from "@/lib/utils/slug";
import { productSchema, type ProductInput } from "@/lib/validations/product";
import { z } from "zod";

export class ProductError extends Error {
  constructor(message: string, public issues?: z.ZodIssue[]) {
    super(message);
    this.name = "ProductError";
  }
}

/**
 * Genera un slug único a partir del nombre.
 * Si el slug ya existe, agrega sufijo -2, -3...
 */
export async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name) || "producto";
  let candidate = base;
  let i = 2;
  while (true) {
    const existing = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${i}`;
    i++;
  }
}

/** Valida la entrada y lanza ProductError con issues legibles */
function assertValid(data: unknown): ProductInput {
  const parsed = productSchema.safeParse(data);
  if (!parsed.success) {
    throw new ProductError("Datos de producto inválidos", parsed.error.issues);
  }
  return parsed.data;
}

export interface CreateProductInput extends Omit<ProductInput, "slug"> {
  slug?: string;
}

/**
 * Crea un producto con todas sus relaciones (imágenes, fuentes, atributos, pros/contras, precio).
 */
export async function createProduct(input: CreateProductInput) {
  const data = assertValid(input);

  // Slug: el del admin o generado automáticamente
  const slug = data.slug && data.slug.trim() ? data.slug.trim() : await generateUniqueSlug(data.name);
  const uniqueSlug = await generateUniqueSlugFrom(slug);

  // Resolver IDs de definiciones de atributos según categoría
  const defs = await prisma.attributeDefinition.findMany({
    where: { categoryId: data.categoryId },
    select: { id: true, key: true },
  });
  const defByKey = new Map(defs.map((d) => [d.key, d.id]));

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug: uniqueSlug,
      brandId: data.brandId,
      categoryId: data.categoryId,
      summary: data.summary ?? null,
      description: data.description ?? null,
      status: data.status,
      publishedAt: data.status === ProductStatus.PUBLISHED ? new Date() : null,
      featured: data.featured,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
      images: {
        create: data.images.map((img, idx) => ({
          url: img.url,
          alt: img.alt ?? data.name,
          width: img.width ?? null,
          height: img.height ?? null,
          source: img.source ?? null,
          sourceUrl: img.sourceUrl || null,
          kind: img.kind,
          isPrimary: img.isPrimary,
          sortOrder: img.isPrimary ? 0 : idx + 1,
        })),
      },
      sources: {
        create: data.sources.map((s) => ({
          kind: s.kind,
          name: s.name,
          url: s.url,
          consultedAt: new Date(),
        })),
      },
      prosCons: {
        create: [
          ...data.pros.map((text, idx) => ({ kind: "PRO" as const, text, sortOrder: idx })),
          ...data.cons.map((text, idx) => ({ kind: "CON" as const, text, sortOrder: idx })),
        ],
      },
      attributes: {
        create: data.attributes.map((a, idx) => {
          const defId = defByKey.get(a.key);
          if (!defId) throw new ProductError(`Atributo desconocido para esta categoría: ${a.key}`);
          return {
            attributeId: defId,
            value: a.value,
            unit: a.unit ?? null,
            scale: a.scale ?? null,
            source: a.source ?? "Fabricante",
            sortOrder: idx,
          };
        }),
      },
      prices: data.price?.amount
        ? {
            create: {
              amount: data.price.amount,
              currency: data.price.currency,
              source: data.price.source ?? "Precio manual",
            },
          }
        : undefined,
    },
    include: {
      brand: true,
      category: true,
      images: true,
      sources: true,
      prosCons: true,
      attributes: { include: { attribute: true } },
      prices: true,
    },
  });

  return product;
}

async function generateUniqueSlugFrom(base: string): Promise<string> {
  let candidate = base;
  let i = 2;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing) return candidate;
    candidate = `${base}-${i}`;
    i++;
  }
}

/**
 * Actualiza un producto completo (reemplaza relaciones).
 */
export async function updateProduct(id: string, input: CreateProductInput) {
  const data = assertValid(input);

  // Slug único excluyendo el propio producto
  const desiredSlug = data.slug && data.slug.trim() ? data.slug.trim() : await generateUniqueSlug(data.name, id);
  const slug = await ensureSlugFree(desiredSlug, id);

  // Verificar unicidad de slug fuera del producto
  async function ensureSlugFree(base: string, excludeId: string): Promise<string> {
    let candidate = base;
    let i = 2;
    while (true) {
      const existing = await prisma.product.findUnique({ where: { slug: candidate }, select: { id: true } });
      if (!existing || existing.id === excludeId) return candidate;
      candidate = `${base}-${i}`;
      i++;
    }
  }

  const defs = await prisma.attributeDefinition.findMany({
    where: { categoryId: data.categoryId },
    select: { id: true, key: true },
  });
  const defByKey = new Map(defs.map((d) => [d.key, d.id]));

  // Transacción: actualizar producto + reemplazar relaciones
  const product = await prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId: id } });
    await tx.productSource.deleteMany({ where: { productId: id } });
    await tx.productProsCons.deleteMany({ where: { productId: id } });
    await tx.productAttributeValue.deleteMany({ where: { productId: id } });
    await tx.productPrice.deleteMany({ where: { productId: id } });

    return tx.product.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        brandId: data.brandId,
        categoryId: data.categoryId,
        summary: data.summary ?? null,
        description: data.description ?? null,
        status: data.status,
        publishedAt: data.status === ProductStatus.PUBLISHED ? (await tx.product.findUnique({ where: { id }, select: { publishedAt: true } }))?.publishedAt ?? new Date() : null,
        featured: data.featured,
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
        images: {
          create: data.images.map((img, idx) => ({
            url: img.url,
            alt: img.alt ?? data.name,
            width: img.width ?? null,
            height: img.height ?? null,
            source: img.source ?? null,
            sourceUrl: img.sourceUrl || null,
            kind: img.kind,
            isPrimary: img.isPrimary,
            sortOrder: img.isPrimary ? 0 : idx + 1,
          })),
        },
        sources: {
          create: data.sources.map((s) => ({ kind: s.kind, name: s.name, url: s.url, consultedAt: new Date() })),
        },
        prosCons: {
          create: [
            ...data.pros.map((text, idx) => ({ kind: "PRO" as const, text, sortOrder: idx })),
            ...data.cons.map((text, idx) => ({ kind: "CON" as const, text, sortOrder: idx })),
          ],
        },
        attributes: {
          create: data.attributes.map((a, idx) => {
            const defId = defByKey.get(a.key);
            if (!defId) throw new ProductError(`Atributo desconocido para esta categoría: ${a.key}`);
            return {
              attributeId: defId,
              value: a.value,
              unit: a.unit ?? null,
              scale: a.scale ?? null,
              source: a.source ?? "Fabricante",
              sortOrder: idx,
            };
          }),
        },
        prices: data.price?.amount
          ? { create: { amount: data.price.amount, currency: data.price.currency, source: data.price.source ?? "Precio manual" } }
          : undefined,
      },
      include: {
        brand: true,
        category: true,
        images: true,
        sources: true,
        prosCons: true,
        attributes: { include: { attribute: true } },
        prices: true,
      },
    });
  });

  return product;
}

/** Cambia estado: PUBLICAR / DESPUBLICAR / ARCHIVAR */
export async function setProductStatus(id: string, status: ProductStatus) {
  return prisma.product.update({
    where: { id },
    data: {
      status,
      publishedAt: status === ProductStatus.PUBLISHED ? new Date() : undefined,
    },
  });
}

/** Duplica un producto como DRAFT (slug nuevo, sin publicar) */
export async function duplicateProduct(id: string) {
  const source = await prisma.product.findUnique({
    where: { id },
    include: {
      brand: true,
      images: true,
      sources: true,
      prosCons: true,
      attributes: true,
      prices: true,
    },
  });
  if (!source) throw new ProductError("Producto no encontrado");

  const newSlug = await generateUniqueSlug(`${source.name} copia`);

  return prisma.product.create({
    data: {
      name: `${source.name} (copia)`,
      slug: newSlug,
      brandId: source.brandId,
      categoryId: source.categoryId,
      summary: source.summary,
      description: source.description,
      status: ProductStatus.DRAFT,
      featured: false,
      images: {
        create: source.images.map((img) => ({
          url: img.url,
          alt: img.alt,
          width: img.width,
          height: img.height,
          source: img.source,
          sourceUrl: img.sourceUrl,
          kind: img.kind,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder,
        })),
      },
      sources: {
        create: source.sources.map((s) => ({ kind: s.kind, name: s.name, url: s.url, consultedAt: s.consultedAt })),
      },
      prosCons: {
        create: source.prosCons.map((pc) => ({ kind: pc.kind, text: pc.text, sortOrder: pc.sortOrder })),
      },
      attributes: {
        create: source.attributes.map((a) => ({
          attributeId: a.attributeId,
          value: a.value,
          unit: a.unit,
          scale: a.scale,
          source: a.source,
          sortOrder: a.sortOrder,
        })),
      },
    },
    include: { brand: true, category: true, images: true, sources: true, prosCons: true, attributes: { include: { attribute: true } }, prices: true },
  });
}

/** Obtiene producto por id con todo */
export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      sources: { orderBy: { consultedAt: "desc" } },
      prosCons: { orderBy: { sortOrder: "asc" } },
      attributes: { include: { attribute: true }, orderBy: { sortOrder: "asc" } },
      prices: { orderBy: { updatedAt: "desc" }, take: 1 },
    },
  });
}

/** Obtiene producto publicado por slug */
export async function getPublishedProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: ProductStatus.PUBLISHED },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      sources: { orderBy: { consultedAt: "desc" } },
      prosCons: { orderBy: { sortOrder: "asc" } },
      attributes: { include: { attribute: true }, orderBy: { sortOrder: "asc" } },
      prices: { orderBy: { updatedAt: "desc" }, take: 1 },
    },
  });
}

/** Lista admin con filtros y paginación */
export async function listAdminProducts(params: { search?: string; category?: string; status?: string; page?: number; pageSize?: number }) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));

  const where = {
    ...(params.category ? { categoryId: params.category } : {}),
    ...(params.status ? { status: params.status as ProductStatus } : {}),
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: "insensitive" as const } },
            { brand: { name: { contains: params.search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        brand: true,
        category: true,
        images: { where: { isPrimary: true }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

/** Métricas para el dashboard admin */
export async function getAdminStats() {
  const [total, published, drafts, archived, rubbers, blades, tables, brands] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: ProductStatus.PUBLISHED } }),
    prisma.product.count({ where: { status: ProductStatus.DRAFT } }),
    prisma.product.count({ where: { status: ProductStatus.ARCHIVED } }),
    prisma.product.count({ where: { status: ProductStatus.PUBLISHED, category: { key: "RUBBER" } } }),
    prisma.product.count({ where: { status: ProductStatus.PUBLISHED, category: { key: "BLADE" } } }),
    prisma.product.count({ where: { status: ProductStatus.PUBLISHED, category: { key: "TABLE" } } }),
    prisma.brand.count(),
  ]);
  return { total, published, drafts, archived, rubbers, blades, tables, brands };
}
