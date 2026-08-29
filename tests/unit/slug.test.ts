import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/utils/slug";

describe("slugify (regla del prompt: Butterfly Dignics 05 -> butterfly-dignics-05)", () => {
  it("convierte nombre a slug", () => {
    expect(slugify("Butterfly Dignics 05")).toBe("butterfly-dignics-05");
  });

  it("quita tildes", () => {
    expect(slugify("Goma Ágil")).toBe("goma-agil");
  });

  it("maneja caracteres especiales", () => {
    expect(slugify("Donic&Co! 100%")).toBe("donic-co-100");
  });

  it("recorta espacios", () => {
    expect(slugify("  Stiga  Offensive  ")).toBe("stiga-offensive");
  });

  it("devuelve vacío si no hay caracteres válidos", () => {
    expect(slugify("!!!")).toBe("");
  });
});
