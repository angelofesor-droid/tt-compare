import type { Metadata } from "next";
import CategoryPage from "@/components/catalog/CategoryPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Maderos de tenis de mesa — catálogo y comparación",
  description:
    "Catálogo de maderos de tenis de mesa: composición, capas, mango, velocidad y control. Compara maderos de Butterfly, Stiga, Joola y más.",
  alternates: { canonical: "/blades" },
};

export default function BladesPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <CategoryPage
      categoryKey="blades"
      title="Maderos"
      description="Maderos sin gomas: composición, capas, mango, velocidad y control para cada estilo de juego."
      searchParams={props.searchParams}
    />
  );
}
