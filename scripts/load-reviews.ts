// Carga reviews REALES citadas desde prisma/reviews.json (fuente: RevSpin).
// NUNCA inventa: cada review conserva su autor real, comentario literal y URL de origen.
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "node:fs";
import path from "node:path";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type ReviewInput = {
  productName: string;
  author: string;
  rating: number; // 1-5
  durabilityRating?: number | null; // 1-10 (gomas)
  title?: string | null;
  comment: string;
  source: string;
};

async function resolveProduct(name: string) {
  const brands = ["Butterfly", "DHS", "Stiga", "STIGA", "Joola", "Andro", "Tibhar", "Donic", "Yasaka"];

  // 1. Nombre exacto
  const direct = await prisma.product.findFirst({ where: { name } });
  if (direct) return direct;

  // 2. Sin prefijo de marca ("Butterfly Viscaria" -> "Viscaria")
  for (const b of brands) {
    if (name.startsWith(b + " ")) {
      return prisma.product.findFirst({ where: { name: name.slice(b.length + 1) } });
    }
  }

  // 3. Con prefijo de marca ("Viscaria" -> "Butterfly Viscaria")
  for (const b of brands) {
    const withBrand = await prisma.product.findFirst({ where: { name: `${b} ${name}` } });
    if (withBrand) return withBrand;
  }

  return null;
}

async function main() {
  const file = path.join(__dirname, "..", "prisma", "reviews.json");
  const data = JSON.parse(fs.readFileSync(file, "utf-8")) as { reviews: ReviewInput[] };
  console.log(`Reviews a cargar: ${data.reviews.length}`);

  let created = 0;
  let skipped = 0;
  const byProduct = new Map<string, number>();

  for (const r of data.reviews) {
    const product = await resolveProduct(r.productName);
    if (!product) {
      console.warn(`⚠ Producto no encontrado: ${r.productName}`);
      skipped++;
      continue;
    }

    const rating = Math.max(1, Math.min(5, Math.round(r.rating)));
    const durability = r.durabilityRating != null ? Math.max(1, Math.min(10, Math.round(r.durabilityRating))) : null;

    // Idempotente: si ya existe esa review (producto+autor), se actualiza
    const existing = await prisma.productReview.findFirst({
      where: { productId: product.id, author: r.author },
    });

    if (existing) {
      await prisma.productReview.update({
        where: { id: existing.id },
        data: { rating, durabilityRating: durability, comment: r.comment, source: r.source, title: r.title ?? null },
      });
    } else {
      await prisma.productReview.create({
        data: {
          productId: product.id,
          author: r.author,
          rating,
          durabilityRating: durability,
          comment: r.comment,
          source: r.source,
          title: r.title ?? null,
          isEditorial: false,
        },
      });
    }
    created++;
    byProduct.set(product.name, (byProduct.get(product.name) ?? 0) + 1);
  }

  console.log(`\nCargadas: ${created} (${skipped} omitidas).`);
  for (const [name, count] of byProduct) {
    console.log(`  ${count} reviews → ${name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
