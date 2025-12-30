import { api } from "@/convex/_generated/api";
import { TrendingMusician } from "@/types/trendingUser";
import { useQuery } from "convex/react";

// hooks/useTrendingMusicians.ts
export const useTrendingMusicians = (): TrendingMusician[] => {
  const musicians = useQuery(
    api.controllers.ratings.getTrendingMusiciansWithRatings
  );

  // Type guard to ensure proper typing
  if (!musicians || !Array.isArray(musicians)) {
    return [];
  }

  // Transform data to include trust scores
  const transformedMusicians = musicians.map((musician: any) => {
    // Calculate client rating from reviews
    const clientRating =
      musician.allreviews && musician.allreviews.length > 0
        ? musician.allreviews.reduce(
            (sum: number, review: any) => sum + (review.rating || 0),
            0
          ) / musician.allreviews.length
        : 0;

    // Get trust score if available, otherwise calculate a basic one
    const trustScore =
      musician.trustScore || calculateBasicTrustScore(musician);
    const trustStars = musician.trustStars || scoreToStars(trustScore);
    const trustTier = musician.trustTier || getTrustTierFromScore(trustScore);

    return {
      ...musician,
      rating: {
        overall: Math.max(clientRating, trustStars), // Use higher of client rating or trust stars
        trustScore,
        trustStars,
        trustTier,
        clientRating,
        reviewCount: musician.allreviews?.length || 0,
        lastUpdated: Date.now(),
        breakdown: {
          trust: {
            profileComplete:
              !!musician.firstname && !!musician.city && !!musician.phone,
            mpesaPhoneNumber: !!musician.mpesaPhoneNumber,
            accountAgeDays: musician._creationTime
              ? Math.floor(
                  (Date.now() - musician._creationTime) / (1000 * 60 * 60 * 24)
                )
              : 0,
            completedGigs: musician.completedGigsCount || 0,
            avgRating: clientRating,
            followers: musician.followers?.length || 0,
            tier: musician.tier || "free",
            trustScore,
            trustStars,
          },
        },
      },
      // Add trust fields directly to musician for easier access
      trustScore,
      trustStars,
      trustTier,
    };
  });

  return transformedMusicians as TrendingMusician[];
};

// Helper functions for trust scoring
function calculateBasicTrustScore(musician: any): number {
  let score = 0;

  // Basic profile (0-25 points)
  if (musician.firstname) score += 2;
  if (musician.city) score += 2;
  if (musician.phone) score += 2;
  if (musician.picture) score += 3;
  if (musician.mpesaPhoneNumber) score += 5;
  if (musician.roleType) score += 3;

  // Activity (0-40 points)
  const completedGigs = musician.completedGigsCount || 0;
  score += Math.min(completedGigs * 1.5, 20);

  // Quality (0-20 points)
  const clientRating = musician.avgRating || 0;
  if (clientRating >= 4.8) score += 15;
  else if (clientRating >= 4.5) score += 10;
  else if (clientRating >= 4.0) score += 5;
  else if (clientRating >= 3.5) score += 2;
  else if (clientRating > 0) score += 1;

  // Social (0-10 points)
  const followerCount = musician.followers?.length || 0;
  if (followerCount >= 100) score += 4;
  else if (followerCount >= 50) score += 2;
  else if (followerCount >= 20) score += 1;

  if (musician.tier === "elite") score += 5;
  else if (musician.tier === "premium") score += 3;
  else if (musician.tier === "pro") score += 2;
  else if (musician.tier === "free") score += 1;

  // Penalties
  if (musician.isBanned) return 0;
  if (musician.isSuspended) score -= 20;
  if (musician.reportsCount) score -= Math.min(musician.reportsCount * 3, 15);

  return Math.max(10, Math.min(score, 100));
}

function scoreToStars(score: number): number {
  if (score >= 90) return 5.0;
  if (score >= 80) return 4.5;
  if (score >= 70) return 4.0;
  if (score >= 60) return 3.5;
  if (score >= 50) return 3.0;
  if (score >= 40) return 2.5;
  if (score >= 30) return 2.0;
  if (score >= 20) return 1.5;
  if (score >= 10) return 1.0;
  return 0.5;
}

function getTrustTierFromScore(score: number): string {
  if (score >= 80) return "elite";
  if (score >= 65) return "trusted";
  if (score >= 50) return "verified";
  if (score >= 30) return "basic";
  return "new";
}
