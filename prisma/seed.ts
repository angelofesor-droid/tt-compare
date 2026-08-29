import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { ProductStatus } from "../src/generated/prisma/enums";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

// ─────────────────────────── Categorías ───────────────────────────

const categories = [
  {
    key: "RUBBER",
    name: "Goma",
    namePlural: "Gomas",
    slug: "rubbers",
    description:
      "Gomas de tenis de mesa: gomas lisas, antispin, grano corto y grano largo. Velocidad, spin y control según el estilo de juego.",
    sortOrder: 1,
  },
  {
    key: "BLADE",
    name: "Madero",
    namePlural: "Maderos",
    slug: "blades",
    description:
      "Maderos de tenis de mesa: palas sin gomas. Composición, capas, velocidad y control para cada estilo de juego.",
    sortOrder: 2,
  },
  {
    key: "TABLE",
    name: "Mesa",
    namePlural: "Mesas",
    slug: "tables",
    description:
      "Mesas de tenis de mesa: indoor y outdoor, plegables, con ruedas y certificación ITTF.",
    sortOrder: 3,
  },
] as const;

// ─────────────────────────── Marcas ───────────────────────────

const brands = [
  { name: "Butterfly", slug: "butterfly", country: "Japón", website: "https://www.butterfly-global.com" },
  { name: "DHS", slug: "dhs", country: "China", website: "https://www.dhs-sports.com" },
  { name: "Stiga", slug: "stiga", country: "Suecia", website: "https://www.stigasports.com" },
  { name: "Joola", slug: "joola", country: "Alemania", website: "https://www.joola.com" },
  { name: "Andro", slug: "andro", country: "Alemania", website: "https://www.andro.de" },
  { name: "Tibhar", slug: "tibhar", country: "Alemania", website: "https://www.tibhar.com" },
  { name: "Donic", slug: "donic", country: "Alemania", website: "https://www.donic.com" },
  { name: "Yasaka", slug: "yasaka", country: "Suecia/Japón", website: "https://www.yasaka.se" },
] as const;

// ─────────────────────────── Atributos por categoría ───────────────────────────
// valueType: NUMBER | TEXT | ENUM | BOOLEAN
// filterable: aparece como filtro en el catálogo
// comparable: aparece en la tabla de comparación
// showOnCard: se muestra en la ProductCard

type Attr = {
  key: string;
  name: string;
  valueType: "NUMBER" | "TEXT" | "ENUM" | "BOOLEAN";
  unit?: string;
  options?: string[];
  scaleName?: string;
  filterable?: boolean;
  comparable?: boolean;
  showOnCard?: boolean;
  sortOrder: number;
};

const attributesByCategory: Record<string, Attr[]> = {
  RUBBER: [
    { key: "thickness", name: "Grosor", valueType: "NUMBER", unit: "mm", filterable: true, showOnCard: true, sortOrder: 1 },
    { key: "hardness", name: "Dureza", valueType: "NUMBER", unit: "°", scaleName: "Escala fabricante", filterable: true, sortOrder: 2 },
    { key: "speed", name: "Velocidad", valueType: "NUMBER", scaleName: "Escala fabricante", filterable: true, showOnCard: true, sortOrder: 3 },
    { key: "spin", name: "Spin", valueType: "NUMBER", scaleName: "Escala fabricante", filterable: true, showOnCard: true, sortOrder: 4 },
    { key: "control", name: "Control", valueType: "NUMBER", scaleName: "Escala fabricante", filterable: true, showOnCard: true, sortOrder: 5 },
    { key: "tackiness", name: "Tackiness", valueType: "TEXT", options: ["Alto", "Medio", "Bajo", "Ninguno"], filterable: true, sortOrder: 6 },
    { key: "weight", name: "Peso", valueType: "NUMBER", unit: "g", filterable: true, sortOrder: 7 },
    { key: "color", name: "Color", valueType: "ENUM", options: ["Rojo", "Negro"], sortOrder: 8 },
    { key: "technology", name: "Tecnología", valueType: "TEXT", sortOrder: 9 },
    { key: "surfaceType", name: "Tipo de superficie", valueType: "ENUM", options: ["Lisa", "Grano corto", "Grano largo", "Antispin"], filterable: true, sortOrder: 10 },
  ],
  BLADE: [
    { key: "weight", name: "Peso", valueType: "NUMBER", unit: "g", filterable: true, showOnCard: true, sortOrder: 1 },
    { key: "layers", name: "Capas", valueType: "NUMBER", unit: "", filterable: true, showOnCard: true, sortOrder: 2 },
    { key: "composition", name: "Composición", valueType: "TEXT", sortOrder: 3 },
    { key: "handle", name: "Mango", valueType: "ENUM", options: ["FL", "ST", "AN", "CS"], filterable: true, showOnCard: true, sortOrder: 4 },
    { key: "speed", name: "Velocidad", valueType: "NUMBER", scaleName: "Escala fabricante", filterable: true, showOnCard: true, sortOrder: 5 },
    { key: "control", name: "Control", valueType: "NUMBER", scaleName: "Escala fabricante", filterable: true, showOnCard: true, sortOrder: 6 },
    { key: "stiffness", name: "Rigidez", valueType: "NUMBER", scaleName: "Escala fabricante", sortOrder: 7 },
    { key: "flexibility", name: "Flexibilidad", valueType: "TEXT", sortOrder: 8 },
    { key: "balance", name: "Balance", valueType: "TEXT", sortOrder: 9 },
    { key: "thickness", name: "Grosor", valueType: "NUMBER", unit: "mm", sortOrder: 10 },
    { key: "dimensions", name: "Dimensiones", valueType: "TEXT", sortOrder: 11 },
    { key: "technology", name: "Tecnología", valueType: "TEXT", sortOrder: 12 },
  ],
  TABLE: [
    { key: "dimensions", name: "Dimensiones", valueType: "TEXT", showOnCard: true, sortOrder: 1 },
    { key: "thickness", name: "Grosor del tablero", valueType: "NUMBER", unit: "mm", filterable: true, showOnCard: true, sortOrder: 2 },
    { key: "surface", name: "Superficie", valueType: "TEXT", sortOrder: 3 },
    { key: "weight", name: "Peso", valueType: "NUMBER", unit: "kg", filterable: true, sortOrder: 4 },
    { key: "indoorOutdoor", name: "Indoor/Outdoor", valueType: "ENUM", options: ["Indoor", "Outdoor", "Ambas"], filterable: true, showOnCard: true, sortOrder: 5 },
    { key: "foldable", name: "Plegable", valueType: "BOOLEAN", filterable: true, sortOrder: 6 },
    { key: "wheels", name: "Ruedas", valueType: "BOOLEAN", filterable: true, sortOrder: 7 },
    { key: "brakes", name: "Frenos", valueType: "BOOLEAN", filterable: true, sortOrder: 8 },
    { key: "storage", name: "Sistema de almacenamiento", valueType: "TEXT", sortOrder: 9 },
    { key: "certification", name: "Certificación", valueType: "TEXT", filterable: true, sortOrder: 10 },
  ],
};

// ─────────────────────────── Productos demo ───────────────────────────
// REGLA (master prompt §64): los datos demo deben estar CLARAMENTE identificados.
// Estos productos NO son reales: son para probar el sistema. El nombre incluye "(demo)",
// la imagen es un placeholder y la fuente dice "Datos demo".

type DemoSpec = {
  slug: string;
  name: string;
  brandSlug: string;
  categoryKey: string;
  summary: string;
  description: string;
  featured?: boolean;
  price?: { amount: number; currency: string; source: string };
  attributes: { key: string; value: string }[];
  pros: string[];
  cons: string[];
};

const demoProducts: DemoSpec[] = [
  {
    slug: "demo-goma-speed",
    name: "Goma demo Speed (demo)",
    brandSlug: "butterfly",
    categoryKey: "RUBBER",
    summary: "Producto DEMO de goma para probar el sistema. No es un producto real.",
    description:
      "Este es un producto de demostración creado por el seed de desarrollo. Sus datos no corresponden a ningún producto real y deben reemplazarse o eliminarse antes de usar el catálogo en producción.",
    featured: true,
    price: { amount: 45000, currency: "CLP", source: "Precio demo" },
    attributes: [
      { key: "thickness", value: "2.1" },
      { key: "hardness", value: "45" },
      { key: "speed", value: "8.5" },
      { key: "spin", value: "8.0" },
      { key: "control", value: "7.0" },
      { key: "tackiness", value: "Medio" },
      { key: "weight", value: "48" },
      { key: "color", value: "Rojo" },
      { key: "surfaceType", value: "Lisa" },
      { key: "technology", value: "Tecnología demo" },
    ],
    pros: ["Producto demo para probar la ficha", "Velocidad media-alta"],
    cons: ["NO es un producto real", "Solo para desarrollo"],
  },
  {
    slug: "demo-goma-control",
    name: "Goma demo Control (demo)",
    brandSlug: "dhs",
    categoryKey: "RUBBER",
    summary: "Producto DEMO de goma de control para probar el sistema. No es real.",
    description:
      "Producto de demostración. Datos de ejemplo para validar filtros, comparación y fichas. Debe eliminarse antes de producción.",
    attributes: [
      { key: "thickness", value: "1.8" },
      { key: "hardness", value: "38" },
      { key: "speed", value: "6.0" },
      { key: "spin", value: "7.0" },
      { key: "control", value: "9.0" },
      { key: "tackiness", value: "Alto" },
      { key: "weight", value: "45" },
      { key: "color", value: "Negro" },
      { key: "surfaceType", value: "Lisa" },
    ],
    pros: ["Alto control", "Ideal para probar comparaciones"],
    cons: ["Datos demo", "No comercializable"],
  },
  {
    slug: "demo-madero-allround",
    name: "Madero demo Allround (demo)",
    brandSlug: "stiga",
    categoryKey: "BLADE",
    summary: "Producto DEMO de madero allround para probar el sistema. No es real.",
    description: "Madero de demostración. Datos de ejemplo para probar la ficha de maderos.",
    price: { amount: 38000, currency: "CLP", source: "Precio demo" },
    attributes: [
      { key: "weight", value: "85" },
      { key: "layers", value: "5" },
      { key: "composition", value: "Madera natural (demo)" },
      { key: "handle", value: "FL" },
      { key: "speed", value: "6" },
      { key: "control", value: "8" },
      { key: "stiffness", value: "5" },
      { key: "flexibility", value: "Media" },
      { key: "balance", value: "Neutro" },
      { key: "thickness", value: "6.0" },
    ],
    pros: ["Balance clásico", "Demo completo de atributos"],
    cons: ["Datos demo"],
  },
  {
    slug: "demo-madero-offensive",
    name: "Madero demo Offensive (demo)",
    brandSlug: "joola",
    categoryKey: "BLADE",
    summary: "Producto DEMO de madero ofensivo para probar el sistema. No es real.",
    description: "Madero de demostración para probar la comparación entre maderos.",
    attributes: [
      { key: "weight", value: "88" },
      { key: "layers", value: "7" },
      { key: "composition", value: "Madera + carbono (demo)" },
      { key: "handle", value: "ST" },
      { key: "speed", value: "9" },
      { key: "control", value: "5" },
      { key: "stiffness", value: "8" },
      { key: "flexibility", value: "Baja" },
      { key: "balance", value: "Hacia la punta" },
      { key: "thickness", value: "6.5" },
    ],
    pros: ["Rápido", "Permite probar comparación de maderos"],
    cons: ["Datos demo", "Difícil de controlar (demo)"],
  },
  {
    slug: "demo-mesa-indoor",
    name: "Mesa demo Indoor (demo)",
    brandSlug: "andro",
    categoryKey: "TABLE",
    summary: "Producto DEMO de mesa indoor para probar el sistema. No es real.",
    description: "Mesa de demostración para probar la ficha de mesas.",
    price: { amount: 220000, currency: "CLP", source: "Precio demo" },
    attributes: [
      { key: "dimensions", value: "274 x 152.5 cm" },
      { key: "thickness", value: "19" },
      { key: "surface", value: "MDF lacado (demo)" },
      { key: "weight", value: "75" },
      { key: "indoorOutdoor", value: "Indoor" },
      { key: "foldable", value: "true" },
      { key: "wheels", value: "true" },
      { key: "brakes", value: "true" },
      { key: "storage", value: "Plegado vertical (demo)" },
      { key: "certification", value: "ITTF (demo)" },
    ],
    pros: ["Certificación demo", "Plegable"],
    cons: ["Datos demo"],
  },
  {
    slug: "demo-mesa-outdoor",
    name: "Mesa demo Outdoor (demo)",
    brandSlug: "tibhar",
    categoryKey: "TABLE",
    summary: "Producto DEMO de mesa outdoor para probar el sistema. No es real.",
    description: "Mesa de demostración para probar la comparación de mesas.",
    attributes: [
      { key: "dimensions", value: "274 x 152.5 cm" },
      { key: "thickness", value: "14" },
      { key: "surface", value: "Resina anti-UV (demo)" },
      { key: "weight", value: "90" },
      { key: "indoorOutdoor", value: "Outdoor" },
      { key: "foldable", value: "true" },
      { key: "wheels", value: "true" },
      { key: "brakes", value: "false" },
      { key: "certification", value: "ITTF (demo)" },
    ],
    pros: ["Resistente a la intemperie (demo)"],
    cons: ["Datos demo", "Sin frenos"],
  },
];

async function seedDemoProducts() {
  const brands = await prisma.brand.findMany({ select: { id: true, slug: true } });
  const categories = await prisma.category.findMany({ select: { id: true, key: true } });
  const brandBySlug = new Map(brands.map((b) => [b.slug, b.id]));
  const categoryByKey = new Map(categories.map((c) => [c.key, c.id]));

  for (const spec of demoProducts) {
    const brandId = brandBySlug.get(spec.brandSlug);
    const categoryId = categoryByKey.get(spec.categoryKey);
    if (!brandId || !categoryId) {
      console.warn(`⚠ Demo ${spec.slug}: falta marca o categoría, se omite.`);
      continue;
    }

    const existing = await prisma.product.findUnique({ where: { slug: spec.slug } });
    if (existing) {
      console.log(`· Demo ya existe: ${spec.slug}`);
      continue;
    }

    // Resolver definiciones de atributos de la categoría
    const defs = await prisma.attributeDefinition.findMany({
      where: { categoryId },
      select: { id: true, key: true },
    });
    const defByKey = new Map(defs.map((d) => [d.key, d.id]));

    await prisma.product.create({
      data: {
        name: spec.name,
        slug: spec.slug,
        brandId,
        categoryId,
        summary: spec.summary,
        description: spec.description,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        featured: spec.featured ?? false,
        images: {
          create: [
            {
              url: `https://placehold.co/600x600/0f2b46/ffffff.png?text=${encodeURIComponent(spec.name.split(" (demo)")[0])}`,
              alt: `Imagen placeholder del producto demo ${spec.name}`,
              source: "Datos demo — no es una imagen real",
              sourceUrl: "https://example.com/demo",
              kind: "PRODUCT",
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
        sources: {
          create: [
            {
              kind: "RELIABLE",
              name: "Datos demo (no reales)",
              url: "https://example.com/demo",
              consultedAt: new Date(),
            },
          ],
        },
        attributes: {
          create: spec.attributes.map((a, idx) => {
            const attributeId = defByKey.get(a.key);
            if (!attributeId) {
              console.warn(`⚠ Demo ${spec.slug}: atributo desconocido '${a.key}', se omite.`);
              return undefined as never;
            }
            return {
              attributeId,
              value: a.value,
              source: "Demo",
              sortOrder: idx,
            };
          }).filter(Boolean),
        },
        prosCons: {
          create: [
            ...spec.pros.map((text, idx) => ({ kind: "PRO" as const, text, sortOrder: idx })),
            ...spec.cons.map((text, idx) => ({ kind: "CON" as const, text, sortOrder: idx })),
          ],
        },
        prices: spec.price
          ? { create: { amount: spec.price.amount, currency: spec.price.currency, source: spec.price.source } }
          : undefined,
      },
    });
    console.log(`✔ Producto demo: ${spec.name}`);
  }
}

// ─────────────────────────── Seed ───────────────────────────

async function main() {
  // Categorías (upsert idempotente por key)
  for (const c of categories) {
    await prisma.category.upsert({
      where: { key: c.key },
      update: { name: c.name, namePlural: c.namePlural, slug: c.slug, description: c.description, sortOrder: c.sortOrder },
      create: { ...c },
    });
    console.log(`✔ Categoría: ${c.key} (${c.slug})`);
  }

  // Marcas
  for (const b of brands) {
    await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name, country: b.country, website: b.website },
      create: { ...b },
    });
    console.log(`✔ Marca: ${b.name}`);
  }

  // Atributos por categoría
  for (const [categoryKey, attrs] of Object.entries(attributesByCategory)) {
    const category = await prisma.category.findUnique({ where: { key: categoryKey } });
    if (!category) throw new Error(`Categoría no encontrada: ${categoryKey}`);

    for (const a of attrs) {
      await prisma.attributeDefinition.upsert({
        where: { categoryId_key: { categoryId: category.id, key: a.key } },
        update: {
          name: a.name,
          valueType: a.valueType,
          unit: a.unit ?? null,
          options: a.options ? a.options : undefined,
          scaleName: a.scaleName ?? null,
          filterable: a.filterable ?? false,
          comparable: a.comparable ?? true,
          showOnCard: a.showOnCard ?? false,
          sortOrder: a.sortOrder,
        },
        create: {
          categoryId: category.id,
          ...a,
          options: a.options ? a.options : undefined,
          filterable: a.filterable ?? false,
          comparable: a.comparable ?? true,
          showOnCard: a.showOnCard ?? false,
        },
      });
    }
    console.log(`✔ Atributos ${categoryKey}: ${attrs.length} definidos`);
  }

  console.log("\nSeed completado. Categorías, marcas y atributos listos.");
  await seedDemoProducts();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
