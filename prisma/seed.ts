import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
