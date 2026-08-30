import type { Metadata } from "next";
import CategoryPage from "@/components/catalog/CategoryPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pelotas de tenis de mesa — catálogo",
  description:
    "Catálogo de pelotas de tenis de mesa 40+ mm: clasificación ITTF, material y calidad. Butterfly, DHS, Nittaku, Stiga y más.",
  alternates: { canonical: "/balls" },
};

export default function BallsPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <CategoryPage
      categoryKey="balls"
      title="Pelotas"
      description="Pelotas de 40+ mm homologadas ITTF. Clasificación, material y rebote para juego reglamentario y entrenamiento."
      searchParams={props.searchParams}
    />
  );
}
