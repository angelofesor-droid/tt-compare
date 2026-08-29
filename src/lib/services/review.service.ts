import prisma from "@/lib/prisma";

export interface ReviewSummary {
  count: number;
  avgRating: number | null; // 1-5
  avgDurability: number | null; // 1-10 (según usuarios, si existe)
  distribution: { stars: number; count: number }[]; // 5 → 1
}

export async function getProductReviewSummary(productId: string): Promise<ReviewSummary> {
  const reviews = await prisma.productReview.findMany({
    where: { productId },
    select: { rating: true, durabilityRating: true },
  });

  if (reviews.length === 0) {
    return { count: 0, avgRating: null, avgDurability: null, distribution: [] };
  }

  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const durRatings = reviews.map((r) => r.durabilityRating).filter((d): d is number => d !== null);
  const durSum = durRatings.reduce((a, b) => a + b, 0);

  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }));

  return {
    count: reviews.length,
    avgRating: Math.round((sum / reviews.length) * 10) / 10,
    avgDurability: durRatings.length > 0 ? Math.round((durSum / durRatings.length) * 10) / 10 : null,
    distribution,
  };
}

export async function getProductReviews(productId: string, limit = 10) {
  return prisma.productReview.findMany({
    where: { productId },
    orderBy: [{ isEditorial: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}
