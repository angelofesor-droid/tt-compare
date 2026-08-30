import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuideLevelPage from "@/components/guides/GuideLevelPage";
import { LEVELS, getRubberRecommendations, type Level } from "@/lib/services/guide.service";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ level: string }>;
}

export function generateStaticParams() {
  return LEVELS.map((l) => ({ level: l.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { level } = await params;
  const lvl = LEVELS.find((l) => l.slug === level);
  if (!lvl) return { title: "Guía no encontrada" };
  return {
    title: `${lvl.title} — guía de compra de tenis de mesa`,
    description: lvl.summary,
    alternates: { canonical: `/guias/${lvl.slug}` },
  };
}

export default async function GuidePage({ params }: PageProps) {
  const { level } = await params;
  const lvl = LEVELS.find((l) => l.slug === level);
  if (!lvl) notFound();

  const recommendations = await getRubberRecommendations(lvl.key as Level);

  return (
    <GuideLevelPage
      level={lvl.key as Level}
      title={lvl.title}
      summary={lvl.summary}
      recommendations={recommendations}
    />
  );
}
