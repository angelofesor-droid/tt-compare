// Asigna la valoración editorial de Durabilidad a las gomas del catálogo real.
// La durabilidad NO la publican los fabricantes como número: es valoración editorial
// interna de Zona Tenis de Mesa (escala 1-10), diferenciada de las escalas del fabricante
// y registrada con su fuente. Criterio: conocimiento público general de la comunidad
// (tensores de superficie delicada = baja; cauchos duros/tacky = alta).
// Idempotente: solo asigna/actualiza según la tabla de marcas; no toca las ya asignadas.
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SCALE = "Valoración editorial Zona Tenis de Mesa (1-10)";
const SOURCE = "Valoración editorial Zona Tenis de Mesa";

// Valor base por marca (criterio editorial sobre el desgaste típico):
const byBrand: Record<string, number> = {
  Butterfly: 5, // tensores premium de superficie delicada
  DHS: 8,       // cauchos duros tacky, muy resistentes
  Yasaka: 7,    // durabilidad reconocida (Mark V histórica)
  Donic: 6,
  Xiom: 8,      // conocida por gran resistencia al desgaste
  Joola: 6,
  Stiga: 6,
};

// Overrides por nombre para ajustar casos concretos (ya establecidos + matices):
const overrides: Record<string, number> = {
  "Butterfly Tenergy 05": 4,
  "Butterfly Dignics 09C": 5,
  "Butterfly Tenergy 19": 5,
  "DHS Hurricane 3 NEO": 8,
  "DHS Hurricane 8": 8,
  "Stiga Mantra M": 6,
  "Yasaka Rakza 7": 7,
  "Joola Dynaryz AGR": 7,
  "Tibhar Hybrid K3": 6,
  "Tibhar Evolution MX-P": 7,
  "Andro Rasanter R47": 6,
  "Andro Hexer Powergrip": 6,
  "Donic Bluefire M2": 5,
  "Xiom Jekyll & Hyde V47.5": 7,
  "Xiom Jekyll & Hyde V52.5": 7,
  "Xiom Jekyll & Hyde X47.5": 7,
  "Xiom Omega VIII Pro": 7,
  "Xiom Omega VIII Euro (Europe)": 7,
  "Xiom Omega VIII China": 7,
  "Xiom Omega VIII Hybrid": 7,
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
    include: { brand: true, attributes: { where: { attributeId: durabilityDef.id } } },
  });

  let assigned = 0;
  let updated = 0;
  let skipped = 0;

  for (const r of rubbers) {
    const existing = r.attributes[0];
    const rating = overrides[r.name] ?? byBrand[r.brand.name];

    if (!rating) {
      // Sin regla para esta marca (Andro, Tibhar con otras gomas no cubiertas)
      if (!existing) { console.log(`· sin regla de durabilidad para: ${r.name}`); skipped++; }
      continue;
    }

    if (existing) {
      // Ya tiene valor: solo actualiza si hay override explícito distinto
      if (overrides[r.name] && Number(existing.value) !== overrides[r.name]) {
        await prisma.productAttributeValue.update({
          where: { id: existing.id },
          data: { value: String(rating), scale: SCALE, source: SOURCE },
        });
        updated++;
        console.log(`↻ ${rating}/10 → ${r.name}`);
      }
      continue;
    }

    await prisma.productAttributeValue.create({
      data: { productId: r.id, attributeId: durabilityDef.id, value: String(rating), scale: SCALE, source: SOURCE, sortOrder: 99 },
    });
    assigned++;
    console.log(`✔ ${rating}/10 → ${r.name}`);
  }
  console.log(`\nResumen: ${assigned} asignadas, ${updated} actualizadas, ${skipped} sin regla.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
