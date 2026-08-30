import { getCatalog } from "@/lib/services/catalog.service";
import { normalizeAttribute } from "@/lib/normalize";

export type Level = "beginner" | "intermediate" | "advanced";

export const LEVELS: { key: Level; name: string; slug: string; title: string; summary: string }[] = [
  {
    key: "beginner",
    name: "Principiante",
    slug: "principiante",
    title: "Guía para principiantes",
    summary: "Gomas y maderos con control y tolerancia al error, ideales para aprender y mejorar la técnica.",
  },
  {
    key: "intermediate",
    name: "Intermedio",
    slug: "intermedio",
    title: "Guía para jugadores intermedios",
    summary: "Equipamiento equilibrado: algo más de velocidad y efecto sin sacrificar el control.",
  },
  {
    key: "advanced",
    name: "Avanzado",
    slug: "avanzado",
    title: "Guía para jugadores avanzados",
    summary: "Gomas y maderos rápidos y con máximo efecto, para juego ofensivo de alto nivel.",
  },
];

const CRITERIA: Record<
  Level,
  { speed: [number, number]; control: [number, number]; order: "control" | "speed" }
> = {
  beginner: { speed: [1, 6], control: [7, 10], order: "control" },
  intermediate: { speed: [4, 7], control: [6, 10], order: "control" },
  advanced: { speed: [7, 10], control: [1, 10], order: "speed" },
};

interface Candidate {
  id: string;
  name: string;
  slug: string;
  brand: string;
  speed: number;
  control: number;
  spin: number;
  image: { url: string; alt: string | null } | null;
}

/** Recomendaciones de gomas por nivel (basadas en atributos normalizados 1–10). */
export async function getRubberRecommendations(level: Level, limit = 6): Promise<Candidate[]> {
  const { items } = await getCatalog("rubbers", { pageSize: 60 });
  const crit = CRITERIA[level];

  const scored = items
    .map((p) => {
      const get = (k: string) => {
        const a = p.attributes.find((x) => x.key === k);
        if (!a) return null;
        const n = normalizeAttribute(k, a.value, a.scale);
        return n ? parseFloat(n) : null;
      };
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        brand: p.brand.name,
        speed: get("speed"),
        control: get("control"),
        spin: get("spin"),
        image: p.image,
      };
    })
    .filter(
      (c): c is Candidate =>
        c.speed != null &&
        c.control != null &&
        c.speed >= crit.speed[0] &&
        c.speed <= crit.speed[1] &&
        c.control >= crit.control[0] &&
        c.control <= crit.control[1],
    );

  const orderField = crit.order === "control" ? "control" : "speed";
  scored.sort((a, b) => (b[orderField] ?? 0) - (a[orderField] ?? 0));
  return scored.slice(0, limit);
}
