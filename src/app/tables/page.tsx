import type { Metadata } from "next";
import CategoryPage from "@/components/catalog/CategoryPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mesas de tenis de mesa — catálogo y comparación",
  description:
    "Catálogo de mesas de tenis de mesa: indoor y outdoor, plegables, con ruedas y certificación ITTF. Compara mesas con datos verificados.",
  alternates: { canonical: "/tables" },
};

export default function TablesPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <CategoryPage
      categoryKey="tables"
      title="Mesas"
      description="Mesas de tenis de mesa: indoor y outdoor, plegables, con ruedas y certificación ITTF."
      searchParams={props.searchParams}
    />
  );
}
