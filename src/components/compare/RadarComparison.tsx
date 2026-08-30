"use client";

// Gráfico de radar para comparación (SVG propio, sin dependencias).
// Regla de datos: solo se muestran atributos con la MISMA escala entre productos;
// los valores se normalizan al máximo del conjunto para la forma, y el valor real
// se conserva en la leyenda y en el tooltip.

export interface RadarPoint {
  slug: string;
  value: number; // normalizado 0-100
  label: string; // valor original + unidad
  raw: number; // valor numérico original
  unit?: string | null;
  scale?: string | null;
}

export interface RadarRow {
  key: string;
  name: string;
  points: RadarPoint[];
  max: number; // máximo original del conjunto (para normalizar)
}

export interface RadarProduct {
  slug: string;
  name: string;
  color: string;
}

const PALETTE = ["#e87b3f", "#5aa7d6", "#7bc98d", "#c08ad9"];

export default function RadarComparison({
  rows,
  products,
  hovered = null,
  onHover = null,
}: {
  rows: RadarRow[];
  products: RadarProduct[];
  hovered?: string | null;
  onHover?: ((slug: string | null) => void) | null;
}) {
  if (rows.length < 3 || products.length < 2) {
    return (
      <div className="panel p-6 text-center text-sm text-ink-low">
        No hay suficientes atributos numéricos para dibujar el gráfico de radar.
      </div>
    );
  }

  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const R = 120;
  const levels = 4;
  const n = rows.length;

  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const pointAt = (i: number, r: number) => ({
    x: cx + r * Math.cos(angle(i)),
    y: cy + r * Math.sin(angle(i)),
  });

  const colorFor = (slug: string) =>
    products.find((p) => p.slug === slug)?.color ?? PALETTE[0];

  // Polígono de un producto
  const polygonFor = (slug: string) => {
    const pts: string[] = [];
    rows.forEach((row, i) => {
      const point = row.points.find((p) => p.slug === slug);
      const r = R * ((point?.value ?? 0) / 100);
      const { x, y } = pointAt(i, r);
      pts.push(`${x},${y}`);
    });
    return pts.join(" ");
  };

  return (
    <div className="panel p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="sec-label">Análisis comparativo</h2>
        <p className="text-xs text-ink-faint">
          Forma normalizada dentro de la escala de cada fabricante (o al máximo de la comparación).
          Las escalas no son equivalentes entre marcas; los valores originales están en la leyenda y la tabla.
        </p>
      </div>

      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[340px_1fr]">
        {/* SVG radar */}
        <svg
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label="Gráfico de radar comparativo"
          className="mx-auto w-full max-w-[340px]"
        >
          {/* Grid concéntrico */}
          {Array.from({ length: levels }, (_, l) => {
            const r = (R * (l + 1)) / levels;
            const pts = rows.map((_, i) => {
              const { x, y } = pointAt(i, r);
              return `${x},${y}`;
            });
            return (
              <polygon
                key={l}
                points={pts.join(" ")}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
            );
          })}

          {/* Ejes radiales + labels */}
          {rows.map((row, i) => {
            const { x, y } = pointAt(i, R);
            const lx = cx + (R + 26) * Math.cos(angle(i));
            const ly = cy + (R + 26) * Math.sin(angle(i));
            const anchor =
              Math.abs(Math.cos(angle(i))) < 0.3
                ? "middle"
                : Math.cos(angle(i)) > 0
                  ? "start"
                  : "end";
            return (
              <g key={row.key}>
                <line
                  x1={cx}
                  y1={cy}
                  x2={x}
                  y2={y}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />
                <text
                  x={lx}
                  y={ly + 4}
                  textAnchor={anchor}
                  fontSize="11"
                  fill="#6b7380"
                  fontWeight="600"
                >
                  {row.name}
                </text>
              </g>
            );
          })}

          {/* Polígonos de productos (resaltan al pasar sobre la goma) */}
          {products.map((p) => {
            const isHovered = hovered === p.slug;
            const dimmed = hovered != null && !isHovered;
            return (
              <polygon
                key={p.slug}
                points={polygonFor(p.slug)}
                fill={colorFor(p.slug)}
                fillOpacity={isHovered ? 0.28 : 0.12}
                stroke={colorFor(p.slug)}
                strokeWidth={isHovered ? 3 : 2}
                strokeLinejoin="round"
                opacity={dimmed ? 0.25 : 1}
                style={{ transition: "opacity .2s" }}
                onMouseEnter={onHover ? () => onHover(p.slug) : undefined}
                onMouseLeave={onHover ? () => onHover(null) : undefined}
              />
            );
          })}

          {/* Puntos con tooltip */}
          {rows.map((row, i) =>
            row.points.map((pt) => {
              const r = R * (pt.value / 100);
              const { x, y } = pointAt(i, r);
              return (
                <circle
                  key={`${row.key}-${pt.slug}`}
                  cx={x}
                  cy={y}
                  r="3"
                  fill={colorFor(pt.slug)}
                >
                  <title>{`${products.find((p) => p.slug === pt.slug)?.name}: ${pt.label}`}</title>
                </circle>
              );
            }),
          )}
        </svg>

        {/* Leyenda con valores reales */}
        <div className="space-y-4">
          {products.map((p) => (
            <div key={p.slug} className="rounded-lg border border-metal/60 bg-deep/40 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: p.color }}
                  aria-hidden
                />
                {p.name}
              </p>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                {rows.map((row) => {
                  const pt = row.points.find((q) => q.slug === p.slug);
                  return (
                    <div key={row.key} className="flex items-baseline justify-between gap-2">
                      <dt className="spec-label">{row.name}</dt>
                      <dd className="spec-value">
                        {pt ? (
                          <>
                            {pt.raw}
                            {pt.unit ? ` ${pt.unit}` : ""}
                          </>
                        ) : (
                          <span className="text-ink-faint">—</span>
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
