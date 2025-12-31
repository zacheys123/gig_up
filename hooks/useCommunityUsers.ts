// hooks/useTrendingMusicians.ts
import { api } from "@/convex/_generated/api";
import { TrendingMusician } from "@/types/trendingUser";
import { useQuery } from "convex/react";
import { useMemo, useCallback } from "react";
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

// Memoize calculation functions to prevent recreation on every render
const useTrendingMusicians = (): TrendingMusician[] => {
  // Fetch both data sources in parallel
  const trendingData = useQuery(
    api.controllers.ratings.getTrendingMusiciansWithRatings
  );
  const trustScores = useQuery(api.controllers.trustScore.getTrustLeaderboard, {
    limit: 20,
    role: "musician",
  });

  // Create a stable trust score map
  const trustScoreMap = useMemo(() => {
    const map = new Map<string, any>();
    if (trustScores && Array.isArray(trustScores)) {
      trustScores.forEach((item: any) => {
        if (item.userId && item.score !== undefined) {
          map.set(item.userId, item);
        }
      });
    }
    return map;
  }, [trustScores]);

  // Memoize the trust tier calculation
  const getTrustTierFromScore = useCallback((score: number): string => {
    if (score >= 80) return "elite";
    if (score >= 65) return "trusted";
    if (score >= 50) return "verified";
    if (score >= 30) return "basic";
    return "new";
  }, []);

  // Memoize the trust score calculation for a musician
  const calculateRoleSpecificTrustScore = useCallback(
    (musician: any): number => {
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
    },
    []
  );

  // Calculate profile points with memoization
  const calculateProfilePoints = useCallback((user: any): number => {
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
  }, []);

  // Transform data with useMemo to prevent recalculation on every render
  const transformedMusicians = useMemo(() => {
    if (!trendingData || !Array.isArray(trendingData)) {
      return [];
    }

    // Process in batches for better performance with large datasets
    return trendingData.map((musician: any) => {
      // Get trust score from dedicated system if available
      let trustScore = 0;
      let trustStars = 0.5;
      let trustTier = "new";

      const trustData = trustScoreMap.get(musician._id);
      if (trustData) {
        trustScore = trustData.score || 0;
        trustStars = scoreToStars(trustScore);
        trustTier = getTrustTierFromScore(trustScore);
      } else {
        // Fallback to calculated score
        trustScore = calculateRoleSpecificTrustScore(musician);
        trustStars = scoreToStars(trustScore);
        trustTier = getTrustTierFromScore(trustScore);
      }

      // Calculate client rating efficiently
      const reviews = musician.allreviews || [];
      const clientRating =
        reviews.length > 0
          ? reviews.reduce(
              (sum: number, review: any) => sum + (review.rating || 0),
              0
            ) / reviews.length
          : 0;

      // Calculate creation time once
      const creationTime = musician._creationTime;
      const accountAgeDays = creationTime
        ? Math.floor((Date.now() - creationTime) / (1000 * 60 * 60 * 24))
        : 0;

      const musicianData: TrendingMusician = {
        ...musician,
        rating: {
          overall: Math.max(clientRating, trustStars),
          trustScore,
          trustStars,
          trustTier,
          clientRating,
          reviewCount: reviews.length,
          lastUpdated: Date.now(),
          breakdown: {
            trust: {
              profileComplete: checkProfileCompleteness(musician),
              mpesaPhoneNumber: !!musician.mpesaPhoneNumber,
              accountAgeDays,
              completedGigs: musician.completedGigsCount || 0,
              avgRating: clientRating,
              followers: musician.followers?.length || 0,
              tier: musician.tier || "free",
              trustScore,
              trustStars,
            },
          },
        },
        trustScore,
        trustStars,
        trustTier,
      };

      return musicianData;
    });
  }, [
    trendingData,
    trustScoreMap,
    getTrustTierFromScore,
    calculateRoleSpecificTrustScore,
  ]);

  return transformedMusicians;
};

// Export as default
export default useTrendingMusicians;

// Optional: Create a more specific hook for sorted/filtered musicians
export const useSortedTrendingMusicians = (
  sortBy: "trust" | "rating" | "activity" = "trust"
) => {
  const musicians = useTrendingMusicians();

  const sortedMusicians = useMemo(() => {
    const musiciansCopy = [...musicians];

    switch (sortBy) {
      case "trust":
        return musiciansCopy.sort(
          (a, b) => (b.trustScore || 0) - (a.trustScore || 0)
        );
      case "rating":
        return musiciansCopy.sort(
          (a, b) => (b.rating?.overall || 0) - (a.rating?.overall || 0)
        );
      case "activity":
        return musiciansCopy.sort(
          (a, b) => (b.completedGigsCount || 0) - (a.completedGigsCount || 0)
        );
      default:
        return musiciansCopy;
    }
  }, [musicians, sortBy]);

  return sortedMusicians;
};

// Optional: Hook for paginated trending musicians
export const usePaginatedTrendingMusicians = (
  page: number = 1,
  itemsPerPage: number = 10
) => {
  const musicians = useTrendingMusicians();

  const paginatedMusicians = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return musicians.slice(startIndex, endIndex);
  }, [musicians, page, itemsPerPage]);

  const totalPages = Math.ceil(musicians.length / itemsPerPage);

  return {
    musicians: paginatedMusicians,
    totalPages,
    currentPage: page,
    totalCount: musicians.length,
  };
};

// Optional: Hook for getting a single musician's trust data
export const useMusicianTrustData = (userId: string) => {
  const musicians = useTrendingMusicians();

  return useMemo(() => {
    const musician = musicians.find((m) => m._id === userId);
    if (!musician) return null;

    return {
      trustScore: musician.trustScore,
      trustStars: musician.trustStars,
      trustTier: musician.trustTier,
      rating: musician.rating,
    };
  }, [musicians, userId]);
};
