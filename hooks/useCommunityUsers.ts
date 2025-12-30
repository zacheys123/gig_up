// hooks/useTrendingMusicians.ts
import { api } from "@/convex/_generated/api";
import { TrendingMusician } from "@/types/trendingUser";
import { useQuery } from "convex/react";
import {
  calculateActivityPoints,
  calculateContentPoints,
  calculateLongevityPoints,
  calculatePenalties,
  calculateQualityPoints,
  calculateSocialPoints,
  checkProfileCompleteness,
  scoreToStars,
} from "@/lib/trustScoreHelpers";

export const useTrendingMusicians = (): TrendingMusician[] => {
  const trendingData = useQuery(
    api.controllers.ratings.getTrendingMusiciansWithRatings
  );

  // Also fetch trust scores from the dedicated trust system
  const trustScores = useQuery(api.controllers.trustScore.getTrustLeaderboard, {
    limit: 20,
    role: "musician",
  });

  if (!trendingData || !Array.isArray(trendingData)) {
    return [];
  }

  // Create a map of trust scores for quick lookup
  const trustScoreMap = new Map<string, any>();
  if (trustScores) {
    trustScores.forEach((item: any) => {
      if (item.userId && item.score) {
        trustScoreMap.set(item.userId, item);
      }
    });
  }

  // Transform data using the proper trust scoring system
  const transformedMusicians = trendingData.map((musician: any) => {
    // Get trust score from the dedicated system if available
    let trustScore = 0;
    let trustStars = 0.5;
    let trustTier = "new";

    const trustData = trustScoreMap.get(musician._id);
    if (trustData) {
      trustScore = trustData.score || 0;
      trustStars = scoreToStars(trustScore);
      trustTier = getTrustTierFromScore(trustScore);
    } else {
      // Fallback to calculated score using the proper system
      trustScore = calculateRoleSpecificTrustScore(musician);
      trustStars = scoreToStars(trustScore);
      trustTier = getTrustTierFromScore(trustScore);
    }

    // Calculate client rating from reviews
    const clientRating =
      musician.allreviews && musician.allreviews.length > 0
        ? musician.allreviews.reduce(
            (sum: number, review: any) => sum + (review.rating || 0),
            0
          ) / musician.allreviews.length
        : 0;

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
            profileComplete: checkProfileCompleteness(musician),
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

// Helper function to calculate trust score using the proper system
function calculateRoleSpecificTrustScore(musician: any): number {
  let totalScore = 0;

  // Profile section (max 25)
  const profilePoints = calculateProfilePoints(musician);
  totalScore += profilePoints;

  // Longevity section (max 10)
  const longevityPoints = calculateLongevityPoints(musician);
  totalScore += longevityPoints;

  // Activity section (max 40)
  const activityPoints = calculateActivityPoints(musician);
  totalScore += activityPoints;

  // Quality section (max 20)
  const qualityPoints = calculateQualityPoints(musician);
  totalScore += qualityPoints;

  // Content section (max 15) - simplified for frontend
  const contentPoints = calculateContentPoints(
    musician,
    0, // videoCount - would need to fetch this
    0, // videoLikes
    false, // hasProfileVideo
    0 // gigVideoCount
  );
  totalScore += contentPoints;

  // Social section (max 10)
  const socialPoints = calculateSocialPoints(musician);
  totalScore += socialPoints;

  // Apply penalties
  const penalties = calculatePenalties(musician);
  totalScore = Math.max(0, totalScore - penalties);

  // Apply profile completeness multiplier
  const isProfileComplete = checkProfileCompleteness(musician);
  const profileMultiplier = isProfileComplete ? 1.0 : 0.7;
  totalScore = Math.round(totalScore * profileMultiplier);

  // Ensure score is within bounds (10-100)
  return Math.max(10, Math.min(100, totalScore));
}

// Helper function to get trust tier from score
function getTrustTierFromScore(score: number): string {
  if (score >= 80) return "elite";
  if (score >= 65) return "trusted";
  if (score >= 50) return "verified";
  if (score >= 30) return "basic";
  return "new";
}

// Import these helper functions from your trustScoreHelpers
function calculateProfilePoints(user: any): number {
  let points = 0;
  if (user.firstname) points += 2;
  if (user.lastname) points += 2;
  if (user.city) points += 2;
  if (user.phone) points += 2;
  if (user.picture) points += 3;
  if (user.mpesaPhoneNumber) points += 5;
  if (user.onboardingComplete) points += 2;
  if (user.roleType) points += 3;
  return Math.min(points, 25);
}

// ... (add other helper functions: calculateLongevityPoints, calculateActivityPoints, etc.)
