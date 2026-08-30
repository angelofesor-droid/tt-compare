"use client";

import { useRouter } from "next/navigation";
import { addToSelection } from "@/lib/compare-store";

// Botón "Comparar": agrega el producto a la selección persistida y navega a /compare.
// Así el producto queda preseleccionado al llegar, sin tener que volver a marcarlo.
export default function CompareButton({
  slug,
  label = "Comparar",
  className = "",
}: {
  slug: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();

  function go() {
    addToSelection(slug);
    router.push("/compare");
  }

  return (
    <button type="button" onClick={go} className={className}>
      {label}
    </button>
  );
}
