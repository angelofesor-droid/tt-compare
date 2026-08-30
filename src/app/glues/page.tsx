import type { Metadata } from "next";
import CategoryPage from "@/components/catalog/CategoryPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pegamentos de tenis de mesa — catálogo",
  description:
    "Catálogo de pegamentos y adhesivos para gomas de tenis de mesa: agua, VOC libre y secado rápido. Butterfly, DHS, Stiga y más.",
  alternates: { canonical: "/glues" },
};

export default function GluesPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <CategoryPage
      categoryKey="glues"
      title="Pegamentos"
      description="Pegamentos y soluciones de pegado para gomas de tenis de mesa, de agua y VOC libre."
      searchParams={props.searchParams}
    />
  );
}
