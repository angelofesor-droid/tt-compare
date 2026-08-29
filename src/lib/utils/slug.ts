/**
 * Utilidades de slug.
 * "Butterfly Dignics 05" -> "butterfly-dignics-05"
 */

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // no alfanumérico -> guion
    .replace(/^-+|-+$/g, "") // guiones al inicio/fin
    .slice(0, 120);
}
