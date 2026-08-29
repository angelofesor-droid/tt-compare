import { z } from "zod";

// ── Imagen ──
export const productImageSchema = z.object({
  url: z.string().url("URL de imagen inválida").or(z.string().min(1, "URL requerida")),
  alt: z.string().max(200).optional().nullable(),
  width: z.coerce.number().int().positive().optional().nullable(),
  height: z.coerce.number().int().positive().optional().nullable(),
  source: z.string().max(200).optional().nullable(),
  sourceUrl: z.string().url().optional().nullable().or(z.literal("")),
  kind: z.enum(["PRODUCT", "LOGO", "DIAGRAM"]).default("PRODUCT"),
  isPrimary: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});

// ── Fuente ──
export const productSourceSchema = z.object({
  kind: z.enum(["MANUFACTURER", "AUTHORIZED_DISTRIBUTOR", "RELIABLE"]).default("MANUFACTURER"),
  name: z.string().min(2, "El nombre de la fuente es obligatorio"),
  url: z.string().url("URL de fuente inválida"),
});

// ── Pros/Contras ──
export const prosConsSchema = z.object({
  kind: z.enum(["PRO", "CON"]),
  text: z.string().min(2).max(500),
});

// ── Atributo dinámico ──
export const attributeValueSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1, "El valor no puede estar vacío").max(200),
  unit: z.string().max(20).optional().nullable(),
  scale: z.string().max(200).optional().nullable(),
  source: z.string().max(200).optional().nullable(),
});

// ── Producto completo ──
export const productSchema = z
  .object({
    name: z.string().min(2, "El nombre es obligatorio (mínimo 2 caracteres)"),
    slug: z
      .string()
      .min(1)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido (solo minúsculas, números y guiones)")
      .optional(), // si no viene, se genera
    brandId: z.string().uuid("Selecciona una marca"),
    categoryId: z.string().uuid("Selecciona una categoría"),
    summary: z.string().max(300).optional().nullable(),
    description: z.string().max(10000).optional().nullable(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
    featured: z.boolean().default(false),
    seoTitle: z.string().max(70).optional().nullable(),
    seoDescription: z.string().max(160).optional().nullable(),
    images: z.array(productImageSchema).min(1, "Al menos una imagen es obligatoria"),
    sources: z.array(productSourceSchema).min(1, "Al menos una fuente es obligatoria"),
    pros: z.array(z.string().min(2).max(500)).default([]),
    cons: z.array(z.string().min(2).max(500)).default([]),
    attributes: z.array(attributeValueSchema).default([]),
    price: z
      .object({
        amount: z.coerce.number().positive("El precio debe ser positivo").optional(),
        currency: z.string().max(10).default("CLP"),
        source: z.string().max(200).optional().nullable(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Regla: PUBLISHED exige imagen principal
    if (data.status === "PUBLISHED") {
      const hasPrimary = data.images.some((img) => img.isPrimary);
      if (!hasPrimary) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["images"],
          message: "Un producto publicado debe tener una imagen marcada como principal.",
        });
      }
    }
  });

export type ProductInput = z.infer<typeof productSchema>;
