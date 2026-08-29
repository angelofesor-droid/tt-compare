// Asigna la valoración editorial de Durabilidad a las gomas del catálogo real.
// La durabilidad NO la publican los fabricantes como número: es valoración editorial
// interna de Zona Tenis de Mesa (escala 1-10), diferenciada de las escalas del fabricante
// y registrada con su fuente. Criterio: conocimiento público general de la comunidad
// (tensores de superficie delicada = baja; cauchos duros/tacky = alta).
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SCALE = "Valoración editorial Zona Tenis de Mesa (1-10)";
const SOURCE = "Valoración editorial Zona Tenis de Mesa";

// goma -> durabilidad (1-10)
const ratings: Record<string, number> = {
  "Butterfly Tenergy 05": 4, // superficie delicada, se daña con facilidad
  "DHS Hurricane 3 NEO": 8, // caucho duro, muy resistente al desgaste
  "Stiga Mantra M": 6,
  "Joola Dynaryz AGR": 7,
  "Andro Rasanter R47": 6,
  "Tibhar Hybrid K3": 6,
  "Donic Bluefire M2": 5,
  "Yasaka Rakza 7": 7, // reconocida por su durabilidad
};

async function main() {
  const category = await prisma.category.findUnique({ where: { key: "RUBBER" } });
  if (!category) throw new Error("Categoría RUBBER no encontrada");

  const durabilityDef = await prisma.attributeDefinition.findUnique({
    where: { categoryId_key: { categoryId: category.id, key: "durability" } },
  });
  if (!durabilityDef) throw new Error("Atributo durability no definido — corre el seed primero");

  const rubbers = await prisma.product.findMany({
    where: { categoryId: category.id, status: "PUBLISHED" },
    select: { id: true, name: true },
  });

  let updated = 0;
  for (const r of rubbers) {
    const rating = ratings[r.name];
    if (!rating) {
      console.log(`· sin valor editorial para: ${r.name}`);
      continue;
    }
    await prisma.productAttributeValue.upsert({
      where: { productId_attributeId: { productId: r.id, attributeId: durabilityDef.id } },
      update: { value: String(rating), scale: SCALE, source: SOURCE },
      create: { productId: r.id, attributeId: durabilityDef.id, value: String(rating), scale: SCALE, source: SOURCE, sortOrder: 99 },
    });
    updated++;
    console.log(`✔ Durabilidad ${rating}/10 → ${r.name}`);
  }
  console.log(`\nResumen: ${updated} gomas con durabilidad editorial.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
