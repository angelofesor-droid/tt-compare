import type { Metadata } from "next";
import CategoryPage from "@/components/catalog/CategoryPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gomas de tenis de mesa — catálogo y comparación",
  description:
    "Catálogo de gomas de tenis de mesa: grosor, dureza, velocidad, spin y control. Compara gomas de Butterfly, DHS, Stiga y más con datos verificados.",
  alternates: { canonical: "/rubbers" },
};

export default function RubbersPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <CategoryPage
      categoryKey="rubbers"
      title="Gomas"
      description="Gomas lisas, antispin, grano corto y grano largo. Velocidad, spin y control según tu estilo de juego."
      searchParams={props.searchParams}
    />
  );
}
