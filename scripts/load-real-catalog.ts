// Carga el catálogo REAL desde prisma/real-catalog.json
// Los datos provienen de investigación con fuentes verificadas (fabricantes/tiendas oficiales).
// Regla del proyecto: nunca inventar datos. Si falta un dato, queda vacío (UI muestra "No disponible").
import "dotenv/config";
import { PrismaClient, ProductStatus } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "node:fs";
import path from "node:path";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type RealProduct = {
  name: string;
  brand: string;
  category: "RUBBER" | "BLADE" | "TABLE";
  attributes: Record<string, string>; // key del atributo -> valor
  scale?: Record<string, string>; // key del atributo -> nombre de escala (si aplica)
  summary?: string | null;
  description?: string | null;
  pros?: string[];
  cons?: string[];
  imageUrl: string;
  imageAlt?: string | null;
  imageSource?: string | null;
  sourceUrl: string;
  sourceName: string;
  price?: { amount: number; currency: string; source: string } | null;
};

async function main() {
  const file = path.join(__dirname, "..", "prisma", "real-catalog.json");
  if (!fs.existsSync(file)) {
    console.error("No existe prisma/real-catalog.json");
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(file, "utf-8")) as { products: RealProduct[] };
  console.log(`Catálogo real: ${data.products.length} productos`);

  // Índices
  const brands = await prisma.brand.findMany({ select: { id: true, slug: true, name: true } });
  const categories = await prisma.category.findMany({ select: { id: true, key: true } });
  const brandByName = new Map(brands.map((b) => [b.name.toLowerCase(), b.id]));
  const categoryByKey = new Map(categories.map((c) => [c.key, c.id]));

  let created = 0;
  let updated = 0;

  for (const p of data.products) {
    const brandId = brandByName.get(p.brand.toLowerCase());
    const categoryId = categoryByKey.get(p.category);
    if (!brandId) {
      console.warn(`⚠ Marca desconocida: ${p.brand} (añádela al seed base)`);
      continue;
    }
    if (!categoryId) {
      console.warn(`⚠ Categoría desconocida: ${p.category}`);
      continue;
    }

    // Slug a partir del nombre
    const slugBase = p.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120);
    let slug = slugBase;
    let i = 2;
    while (await prisma.product.findUnique({ where: { slug }, select: { id: true } })) {
      slug = `${slugBase}-${i}`;
      i++;
    }

    // Resolver definiciones de atributos de la categoría
    const defs = await prisma.attributeDefinition.findMany({
      where: { categoryId },
      select: { id: true, key: true },
    });
    const defByKey = new Map(defs.map((d) => [d.key, d.id]));

    const attrs = Object.entries(p.attributes)
      .map(([key, value]) => {
        const attributeId = defByKey.get(key);
        if (!attributeId) {
          console.warn(`⚠ Atributo desconocido para ${p.name}: ${key}`);
          return null;
        }
        return {
          attributeId,
          value,
          scale: p.scale?.[key] ?? null,
          source: p.sourceName,
          sortOrder: 0,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (existing) {
      // Actualizar datos verificados sin duplicar (no toca imágenes existentes)
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          summary: p.summary ?? existing.summary,
          description: p.description ?? existing.description,
          status: ProductStatus.PUBLISHED,
          publishedAt: existing.publishedAt ?? new Date(),
        },
      });
      updated++;
      console.log(`↻ Actualizado: ${p.name}`);
      continue;
    }

    await prisma.product.create({
      data: {
        name: p.name,
        slug,
        brandId,
        categoryId,
        summary: p.summary ?? null,
        description: p.description ?? null,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        featured: false,
        images: {
          create: [
            {
              url: p.imageUrl,
              alt: p.imageAlt ?? p.name,
              source: p.imageSource ?? p.sourceName,
              sourceUrl: p.sourceUrl,
              kind: "PRODUCT",
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
        sources: {
          create: [{ kind: "MANUFACTURER", name: p.sourceName, url: p.sourceUrl, consultedAt: new Date() }],
        },
        attributes: { create: attrs },
        prosCons: {
          create: [
            ...(p.pros ?? []).map((text, idx) => ({ kind: "PRO" as const, text, sortOrder: idx })),
            ...(p.cons ?? []).map((text, idx) => ({ kind: "CON" as const, text, sortOrder: idx })),
          ],
        },
        prices: p.price
          ? { create: { amount: p.price.amount, currency: p.price.currency, source: p.price.source } }
          : undefined,
      },
    });
    created++;
    console.log(`✔ Creado: ${p.name} (${slug})`);
  }

  console.log(`\nResumen: ${created} creados, ${updated} actualizados, de ${data.products.length}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
