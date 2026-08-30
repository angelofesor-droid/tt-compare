// Normalización de valores de atributos para filtros del catálogo.
// Los valores crudos en BD son heterogéneos (escalas distintas por fabricante).
// Esta capa los reduce a "buckets" estándar comparables, sin perder la escala
// original en la ficha del producto.

function num(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const m = String(raw).match(/(\d+[.,]?\d*)/);
  return m ? parseFloat(m[1].replace(",", ".")) : null;
}

/** Grosor (gomas): agrupa en pasos de 0.1 mm de 1.0 a 2.0; todo lo que pase de 2.0 → "2.0 Max" */
export function normalizeThickness(raw: string | null | undefined): string | null {
  const v = num(raw);
  if (v == null) return null;
  if (v > 2.0) return "2.0 Max";
  return v.toFixed(1);
}

/** Dureza: grado numérico (32–55). Devuelve bucket + si la escala es china/DHS */
export function normalizeHardness(
  raw: string | null | undefined,
  scale?: string | null
): { value: string; china: boolean } | null {
  const v = num(raw);
  if (v == null) return null;
  // Redondear a 0.5 para agrupar (ej. 47.5)
  const rounded = Math.round(v * 2) / 2;
  const china = /dhs|china|chino|chinese/i.test((raw || "") + " " + (scale || ""));
  return { value: String(rounded), china };
}

/** Velocidad/Spin/Control: normaliza a escala 1–10 (si la escala es 100, divide por 10) */
export function normalizeRating(
  raw: string | null | undefined,
  scale?: string | null
): string | null {
  const v = num(raw);
  if (v == null) return null;
  const isHundred = /100|0-100|índice|0–100/i.test(scale || "") || v > 15;
  const out = isHundred ? v / 10 : v;
  const clamped = Math.max(1, Math.min(10, Math.round(out)));
  return String(clamped);
}

/** Tackiness: reduce a "Sticky" (muy pegajosa) o "Tacky" (ligera/híbrida) */
export function normalizeTackiness(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = String(raw).toLowerCase();
  if (/no pegajosa|no tacky|no adherente|anti/i.test(s)) return null; // sin adherencia: no se agrupa
  if (/muy pegajosa|pegajosa|sticky|alta.*adherencia|tacky/i.test(s)) return "Sticky";
  if (/adherente|grippy|ligeramente/i.test(s)) return "Tacky";
  return null;
}

/** Durabilidad: valor editorial 1–10 (ya está normalizada) */
export function normalizeDurability(raw: string | null | undefined): string | null {
  const v = num(raw);
  if (v == null) return null;
  const clamped = Math.max(1, Math.min(10, Math.round(v)));
  return String(clamped);
}

/** Aplica la normalización correcta según la clave del atributo. */
export function normalizeAttribute(
  key: string,
  raw: string | null | undefined,
  scale?: string | null
): string | null {
  switch (key) {
    case "thickness":
      return normalizeThickness(raw);
    case "hardness":
      return normalizeHardness(raw, scale)?.value ?? null;
    case "speed":
    case "spin":
    case "control":
      return normalizeRating(raw, scale);
    case "tackiness":
      return normalizeTackiness(raw);
    case "durability":
      return normalizeDurability(raw);
    default:
      return null;
  }
}

/** Devuelve si un atributo debe aparecer en el menú de filtros normalizados. */
export const FILTERABLE_KEYS = ["thickness", "hardness", "speed", "spin", "control", "tackiness", "durability"];

/** Indica si el atributo "weight" no debe aparecer (según decisión del usuario). */
export const WEIGHT_EXCLUDED = true;
