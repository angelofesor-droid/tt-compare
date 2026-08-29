import { describe, it, expect } from "vitest";
import { productSchema } from "@/lib/validations/product";

const baseValid = {
  name: "Goma Test",
  brandId: "00000000-0000-4000-8000-000000000001",
  categoryId: "00000000-0000-4000-8000-000000000002",
  status: "DRAFT",
  images: [{ url: "https://img.example.com/goma.jpg", isPrimary: true }],
  sources: [{ url: "https://example.com/fuente", name: "Fuente" }],
  attributes: [],
  pros: [],
  cons: [],
};

describe("validación de producto (reglas críticas del prompt)", () => {
  it("acepta un producto DRAFT válido con imagen y fuente", () => {
    const res = productSchema.safeParse(baseValid);
    expect(res.success).toBe(true);
  });

  it("RECHAZA producto sin nombre", () => {
    const res = productSchema.safeParse({ ...baseValid, name: "" });
    expect(res.success).toBe(false);
  });

  it("RECHAZA producto sin marca", () => {
    const res = productSchema.safeParse({ ...baseValid, brandId: "" });
    expect(res.success).toBe(false);
  });

  it("RECHAZA producto sin categoría", () => {
    const res = productSchema.safeParse({ ...baseValid, categoryId: "" });
    expect(res.success).toBe(false);
  });

  it("RECHAZA publicar sin imagen principal (regla crítica)", () => {
    const res = productSchema.safeParse({
      ...baseValid,
      status: "PUBLISHED",
      images: [{ url: "https://img.example.com/goma.jpg", isPrimary: false }],
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      const msg = res.error.issues.map((i) => i.message).join(" ");
      expect(msg).toContain("imagen marcada como principal");
    }
  });

  it("RECHAZA slug inválido", () => {
    const res = productSchema.safeParse({
      ...baseValid,
      slug: "Con Mayúsculas y espacios",
    });
    expect(res.success).toBe(false);
  });

  it("acepta slug válido en minúsculas", () => {
    const res = productSchema.safeParse({
      ...baseValid,
      slug: "goma-test-01",
    });
    expect(res.success).toBe(true);
  });

  it("RECHAZA publicar sin fuentes", () => {
    const res = productSchema.safeParse({
      ...baseValid,
      status: "PUBLISHED",
      sources: [],
    });
    expect(res.success).toBe(false);
  });
});
