// Almacén de selección de comparación (client-side, persistido en localStorage).
// Permite que al pulsar "Comparar" en cualquier ficha/tarjeta, el producto quede
// preseleccionado al llegar a /compare, y que la selección se acumule entre visitas.

const KEY = "tt_compare_selection";
const MAX = 4;

function safe(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readSelection(): string[] {
  const s = safe();
  if (!s) return [];
  try {
    const raw = s.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function writeSelection(slugs: string[]): void {
  const s = safe();
  if (!s) return;
  try {
    s.setItem(KEY, JSON.stringify(slugs.slice(0, MAX)));
  } catch {
    /* ignore */
  }
}

export function addToSelection(slug: string): void {
  const cur = readSelection();
  if (!cur.includes(slug)) writeSelection([...cur, slug]);
}

export function clearSelection(): void {
  const s = safe();
  if (!s) return;
  try {
    s.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
