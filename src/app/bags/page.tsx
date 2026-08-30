import type { Metadata } from "next";
import CategoryPage from "@/components/catalog/CategoryPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fundas y estuches de tenis de mesa — catálogo",
  description:
    "Catálogo de fundas y estuches para raquetas de tenis de mesa: capacidad, material y protección. Butterfly, Stiga, Joola y más.",
  alternates: { canonical: "/bags" },
};

export default function BagsPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <CategoryPage
      categoryKey="bags"
      title="Fundas"
      description="Fundas, blísteres y cajas para proteger y transportar tu raqueta y accesorios."
      searchParams={props.searchParams}
    />
  );
}
