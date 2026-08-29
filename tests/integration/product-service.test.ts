import { describe, it, expect, beforeAll, afterAll } from "vitest";
import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createProduct, generateUniqueSlug } from "@/lib/services/product.service";
import { getCompareProducts, CompareError } from "@/lib/services/compare.service";

// BD de test dedicada: tt_compare_test (ver vitest.config y DATABASE.md)
const DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgresql://tt_app:tt_app_dev@localhost:5432/tt_compare_test?schema=public";

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

let brandId: string;
let rubberCategoryId: string;
let bladeCategoryId: string;
let testProducts: string[] = [];

beforeAll(async () => {
  // Datos base de test: marca + categorías (se crean si la BD de test está vacía)
  const brand = await prisma.brand.create({
    data: { name: `TestBrand-${Date.now()}`, slug: `testbrand-${Date.now()}` },
  });
  brandId = brand.id;

  const upsertCategory = async (key: string, name: string, slug: string) => {
    const existing = await prisma.category.findUnique({ where: { key } });
    if (existing) return existing;
    return prisma.category.create({ data: { key, name, namePlural: `${name}s`, slug } });
  };

  const rubber = await upsertCategory("RUBBER", "Goma", "rubbers");
  const blade = await upsertCategory("BLADE", "Madero", "blades");
  rubberCategoryId = rubber.id;
  bladeCategoryId = blade.id;

  // Asegurar definiciones de atributos mínimas
  const ensureAttr = async (categoryId: string, key: string, name: string) => {
    const existing = await prisma.attributeDefinition.findUnique({
      where: { categoryId_key: { categoryId, key } },
    });
    if (!existing) {
      await prisma.attributeDefinition.create({
        data: { categoryId, key, name, valueType: "NUMBER", sortOrder: 1 },
      });
    }
  };
  await ensureAttr(rubberCategoryId, "speed", "Velocidad");
  await ensureAttr(rubberCategoryId, "control", "Control");
});

afterAll(async () => {
  for (const id of testProducts) {
    await prisma.product.deleteMany({ where: { id } }).catch(() => {});
  }
  await prisma.brand.deleteMany({ where: { id: brandId } }).catch(() => {});
  await prisma.$disconnect();
});

const baseGoma = (name: string) => ({
  name,
  brandId,
  categoryId: rubberCategoryId,
  status: "PUBLISHED" as const,
  featured: false,
  images: [{ url: "https://img.example.com/goma.jpg", isPrimary: true, kind: "PRODUCT" as const, sortOrder: 0 }],
  sources: [{ url: "https://example.com/fuente", name: "Fuente test", kind: "MANUFACTURER" as const }],
  attributes: [
    { key: "speed", value: "8" },
    { key: "control", value: "7" },
  ],
  pros: ["Test"],
  cons: ["Test"],
});

describe("servicio de productos (integración)", () => {
  it("crea una goma publicada con imagen principal (criterio de éxito)", async () => {
    const product = await createProduct(baseGoma("Test Goma A"));
    testProducts.push(product.id);
    expect(product.status).toBe("PUBLISHED");
    expect(product.images.length).toBe(1);
    expect(product.images[0].isPrimary).toBe(true);
    expect(product.attributes.length).toBe(2);
  });

  it("genera slugs únicos automáticamente", async () => {
    const p1 = await createProduct(baseGoma("Test Goma B"));
    testProducts.push(p1.id);
    const p2 = await createProduct(baseGoma("Test Goma B"));
    testProducts.push(p2.id);
    expect(p1.slug).toBe("test-goma-b");
    expect(p2.slug).toBe("test-goma-b-2");
  });

  it("no permite duplicar un slug existente", async () => {
    await expect(generateUniqueSlug("Test Goma B")).resolves.toBe("test-goma-b-3");
  });

  it("rechaza crear producto sin datos obligatorios", async () => {
    await expect(
      createProduct({ ...baseGoma("Test Goma C"), name: "" }),
    ).rejects.toThrow();
  });
});

describe("comparación (reglas críticas del prompt)", () => {
  it("permite comparar goma con goma", async () => {
    const a = await createProduct(baseGoma("Test Goma Comp 1"));
    testProducts.push(a.id);
    const b = await createProduct(baseGoma("Test Goma Comp 2"));
    testProducts.push(b.id);

    const result = await getCompareProducts([a.slug, b.slug]);
    expect(result.categoryKey).toBe("RUBBER");
    expect(result.products.length).toBe(2);
  });

  it("NO permite comparar goma con madero (mensaje claro)", async () => {
    const goma = await createProduct(baseGoma("Test Goma Cross"));
    testProducts.push(goma.id);

    const madero = await prisma.product.create({
      data: {
        name: "Test Madero Cross",
        slug: `test-madero-cross-${Date.now()}`,
        brandId,
        categoryId: bladeCategoryId,
        status: "PUBLISHED",
        images: { create: [{ url: "https://img.example.com/madero.jpg", isPrimary: true }] },
        sources: { create: [{ url: "https://example.com/fuente", name: "Fuente" }] },
      },
    });
    testProducts.push(madero.id);

    await expect(getCompareProducts([goma.slug, madero.slug])).rejects.toThrow(CompareError);
  });

  it("rechaza comparar menos de 2 productos", async () => {
    await expect(getCompareProducts(["solo-uno"])).rejects.toThrow(CompareError);
  });
});
