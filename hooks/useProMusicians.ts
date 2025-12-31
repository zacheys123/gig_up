// hooks/useProMusicians.ts - OPTIMIZED WITH TRUST INTEGRATION
import { useQuery } from "convex/react";
import { useMemo, useState, useEffect, useCallback } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { EnhancedMusician } from "@/types/musician";
import { getDisplayRate, hasRateForGigType } from "@/utils";
import { GigType, isValidGigType } from "@/convex/gigTypes";
import { useTrustScore } from "./useTrustScore";

interface UseProMusiciansProps {
  city?: string;
  instrument?: string;
  genre?: string;
  limit?: number;
  minRating?: number;
  minTrustStars?: number;
  minTrustScore?: number;
  tier?: "free" | "pro" | "premium" | "elite";
  gigType?: GigType | string;
  availableOnly?: boolean;
  sortBy?: "trust" | "rating" | "experience" | "recent" | "rate";
}

// Constants
const TRUST_THRESHOLDS = {
  canBeBooked: 3.0,
  isVerified: 3.0,
  isReliable: 50,
  canHireDirectly: 4.0,
  DEFAULT_LIMIT: 12,
} as const;

// Custom debounce hook
const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Trust tier helper (memoized)
const useTrustTier = () => {
  return useCallback(
    (
      trustStars: number = 0.5
    ): {
      tier: string;
      color: string;
      description: string;
    } => {
      if (trustStars >= 4.5)
        return {
          tier: "elite",
          color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
          description: "Elite - Top-rated professional",
        };
      if (trustStars >= 4.0)
        return {
          tier: "trusted",
          color: "bg-green-500/10 text-green-600 border-green-500/20",
          description: "Trusted - Highly reliable",
        };
      if (trustStars >= 3.0)
        return {
          tier: "verified",
          color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
          description: "Verified - Established member",
        };
      if (trustStars >= 2.0)
        return {
          tier: "basic",
          color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
          description: "Basic - Active member",
        };
      return {
        tier: "new",
        color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
        description: "New - Getting started",
      };
    },
    []
  );
};

export const useProMusicians = (filters: UseProMusiciansProps = {}) => {
  // Process and validate filters
  const processedFilters = useMemo(() => {
    const { gigType, ...rest } = filters;
    let processedGigType: GigType | undefined;

    if (gigType && isValidGigType(gigType)) {
      processedGigType = gigType as GigType;
    } else if (gigType) {
      console.warn(`Invalid gig type: ${gigType}`);
    }

    return {
      limit: TRUST_THRESHOLDS.DEFAULT_LIMIT,
      availableOnly: false,
      ...rest,
      gigType: processedGigType,
    };
  }, [filters]);

  // Trust score hook
  const {
    trustStars: currentUserTrustStars,
    trustScore: currentUserTrustScore,
  } = useTrustScore();

  // Memoize query filters
  const queryFilters = useMemo(
    () => ({
      limit: processedFilters.limit,
      availableOnly: processedFilters.availableOnly,
      city: processedFilters.city,
      instrument: processedFilters.instrument,
      genre: processedFilters.genre,
      minRating: processedFilters.minRating,
      minTrustStars: processedFilters.minTrustStars,
      minTrustScore: processedFilters.minTrustScore,
      tier: processedFilters.tier,
      gigType: processedFilters.gigType,
    }),
    [processedFilters]
  );

  // Queries
  const musicians = useQuery(
    api.controllers.musicians.getProMusicians,
    queryFilters
  ) as EnhancedMusician[] | undefined;

  const featuredMusicians = useQuery(
    api.controllers.musicians.getFeaturedMusicians,
    { limit: queryFilters.limit }
  ) as EnhancedMusician[] | undefined;

  // Trust tier helper
  const getTrustTier = useTrustTier();

  // Enhance musicians with trust data
  const enhancedMusicians = useMemo(() => {
    if (!musicians || musicians.length === 0) return [];

    const sortedMusicians = [...musicians].map((musician) => {
      const trustStars = musician.trustStars || 0.5;
      const trustScore = musician.trustScore || 0;
      const trustTierInfo = getTrustTier(trustStars);

      const avgRating = musician.avgRating || 0;
      const compositeRating = (avgRating + trustStars) / 2;

      const canBeBookedDirectly = trustStars >= TRUST_THRESHOLDS.canBeBooked;
      const isAutoVerified = trustStars >= TRUST_THRESHOLDS.isVerified;
      const isReliable = trustScore >= TRUST_THRESHOLDS.isReliable;

      return {
        ...musician,
        firstname: musician.firstname || "Musician",
        instrument:
          musician.instrument ||
          (musician.roleType === "dj"
            ? "Deejay"
            : musician.roleType === "mc"
              ? "EMCee"
              : musician.roleType === "vocalist"
                ? "Vocalist"
                : "Various Instruments"),
        avgRating,
        completedGigsCount: musician.completedGigsCount || 0,
        city: musician.city || "Various Locations",
        displayRate: getDisplayRate(musician.rate, musician.roleType),
        trustScore,
        trustStars,
        trustTier: trustTierInfo.tier,
        trustTierColor: trustTierInfo.color,
        trustTierDescription: trustTierInfo.description,
        canBeBookedDirectly,
        isVerified: musician.verified || isAutoVerified,
        isReliable,
        compositeRating,
        rateConfidence: canBeBookedDirectly
          ? "high"
          : trustStars >= 2.0
            ? "medium"
            : "low",
        canCurrentUserBook: currentUserTrustStars >= 2.0,
        canUserBookDirectly:
          currentUserTrustStars >= TRUST_THRESHOLDS.canHireDirectly &&
          canBeBookedDirectly,
      };
    });

    // Apply sorting
    if (processedFilters.sortBy) {
      sortedMusicians.sort((a, b) => {
        switch (processedFilters.sortBy) {
          case "trust":
            const aTrust = a.trustStars;
            const bTrust = b.trustStars;
            return Math.abs(bTrust - aTrust) > 0.1
              ? bTrust - aTrust
              : b.trustScore - a.trustScore;

          case "rating":
            return b.compositeRating - a.compositeRating;

          case "experience":
            const aExp = a.completedGigsCount;
            const bExp = b.completedGigsCount;
            return bExp !== aExp ? bExp - aExp : b.trustStars - a.trustStars;

          case "rate":
            const getRateValue = (rateStr: string) =>
              parseInt(rateStr.match(/(\d+)/)?.[1] || "999999");
            return (
              getRateValue(a.displayRate || "") -
              getRateValue(b.displayRate || "")
            );

          default:
            return b.trustStars - a.trustStars;
        }
      });
    }

    return sortedMusicians;
  }, [
    musicians,
    processedFilters.sortBy,
    processedFilters.gigType,
    currentUserTrustStars,
    getTrustTier,
  ]);

  return {
    musicians: enhancedMusicians,
    featuredMusicians: featuredMusicians || [],
    isLoading: musicians === undefined,
    isEmpty: enhancedMusicians.length === 0,
    currentUserTrustStars,
    currentUserTrustScore,
    trustThresholds: TRUST_THRESHOLDS,
  };
};

// Updated useMusicianSearch with trust integration
export const useMusicianSearch = (
  searchQuery: string,
  city?: string,
  instrument?: string,
  minTrustStars?: number // NEW: Add trust filter
) => {
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { trustStars: currentUserTrustStars } = useTrustScore();

  const searchParams = useMemo(
    () =>
      debouncedSearchQuery
        ? {
            query: debouncedSearchQuery,
            city,
            instrument,
          }
        : "skip",
    [debouncedSearchQuery, city, instrument]
  );

  const results = useQuery(
    api.controllers.musicians.searchMusicians,
    searchParams
  ) as EnhancedMusician[] | undefined;

  // Enhance results with rate AND trust display
  const enhancedResults = useMemo(() => {
    if (!results) return [];

    // Helper function for trust tier
    const getTrustTier = (trustStars: number = 0.5) => {
      if (trustStars >= 4.5) return "elite";
      if (trustStars >= 4.0) return "trusted";
      if (trustStars >= 3.0) return "verified";
      if (trustStars >= 2.0) return "basic";
      return "new";
    };

    return (
      results
        .map((musician) => ({
          ...musician,
          displayRate: getDisplayRate(musician.rate, musician.roleType),
          // Add trust information
          trustScore: musician.trustScore || 0,
          trustStars: musician.trustStars || 0.5,
          trustTier: getTrustTier(musician.trustStars || 0.5),
          canBeBookedDirectly:
            (musician.trustStars || 0.5) >= TRUST_THRESHOLDS.canBeBooked,
          isVerified:
            musician.verified ||
            (musician.trustStars || 0.5) >= TRUST_THRESHOLDS.isVerified,
          canCurrentUserBook: currentUserTrustStars >= 2.0,
        }))
        // Apply trust filter if specified
        .filter((musician) => {
          if (minTrustStars !== undefined) {
            return (musician.trustStars || 0.5) >= minTrustStars;
          }
          return true;
        })
        // Sort by trust stars by default
        .sort((a, b) => (b.trustStars || 0.5) - (a.trustStars || 0.5))
    );
  }, [results, minTrustStars, currentUserTrustStars]);

  return {
    results: enhancedResults,
    isLoading: results === undefined && debouncedSearchQuery !== "",
    isEmpty: enhancedResults.length === 0 && debouncedSearchQuery !== "",
  };
};

export const useMusicianById = (musicianId: Id<"users"> | null) => {
  const musician = useQuery(
    api.controllers.musicians.getMusicianById,
    musicianId ? { musicianId } : "skip"
  ) as EnhancedMusician | undefined;

  const { trustStars: currentUserTrustStars } = useTrustScore();

  const enhancedMusician = useMemo(() => {
    if (!musician) return null;

    // Helper function for trust tier
    const getTrustTier = (trustStars: number = 0.5) => {
      if (trustStars >= 4.5) return "elite";
      if (trustStars >= 4.0) return "trusted";
      if (trustStars >= 3.0) return "verified";
      if (trustStars >= 2.0) return "basic";
      return "new";
    };

    const trustStars = musician.trustStars || 0.5;
    const trustScore = musician.trustScore || 0;

    return {
      ...musician,
      displayRate: getDisplayRate(musician.rate, musician.roleType),
      allRates: musician.rate ? getAllRates(musician.rate) : [],
      // Trust information
      trustScore,
      trustStars,
      trustTier: getTrustTier(trustStars),
      canBeBookedDirectly: trustStars >= TRUST_THRESHOLDS.canBeBooked,
      isVerified:
        musician.verified || trustStars >= TRUST_THRESHOLDS.isVerified,
      isReliable: trustScore >= TRUST_THRESHOLDS.isReliable,
      canCurrentUserBook: currentUserTrustStars >= 2.0,
      canUserBookDirectly:
        currentUserTrustStars >= TRUST_THRESHOLDS.canHireDirectly &&
        trustStars >= TRUST_THRESHOLDS.canBeBooked,
    };
  }, [musician, currentUserTrustStars]);

  return {
    musician: enhancedMusician,
    isLoading: musician === undefined,
  };
};

// Updated useFilteredMusicians with trust integration
export const useFilteredMusicians = (
  musicians: EnhancedMusician[],
  filters: {
    city?: string;
    instrument?: string;
    gigType?: GigType | string;
    minRating?: number;
    minTrustStars?: number; // NEW
    minTrustScore?: number; // NEW
    tier?: string;
    hasRatesOnly?: boolean;
    sortBy?: "trust" | "rating" | "experience" | "recent" | "rate"; // NEW
  }
) => {
  const { trustStars: currentUserTrustStars } = useTrustScore();

  return useMemo(() => {
    if (!musicians.length) return [];

    // Process gigType to ensure it's valid
    let processedGigType: GigType | undefined;
    if (filters.gigType) {
      if (isValidGigType(filters.gigType)) {
        processedGigType = filters.gigType as GigType;
      }
    }

    // Helper function for composite rating
    const getCompositeRating = (musician: EnhancedMusician) => {
      return ((musician.avgRating || 0) + (musician.trustStars || 0.5)) / 2;
    };

    let filtered = musicians.filter((musician) => {
      // City filter
      if (filters.city && musician.city !== filters.city) {
        return false;
      }

      // Instrument filter
      if (filters.instrument && musician.instrument !== filters.instrument) {
        return false;
      }

      // Rating filter (now includes trust)
      if (filters.minRating) {
        const compositeRating = getCompositeRating(musician);
        if (compositeRating < filters.minRating) {
          return false;
        }
      }

      // Trust stars filter
      if (
        filters.minTrustStars &&
        (musician.trustStars || 0.5) < filters.minTrustStars
      ) {
        return false;
      }

      // Trust score filter
      if (
        filters.minTrustScore &&
        (musician.trustScore || 0) < filters.minTrustScore
      ) {
        return false;
      }

      // Tier filter
      if (filters.tier && musician.tier !== filters.tier) {
        return false;
      }

      // Gig type rate availability filter
      if (filters.hasRatesOnly && processedGigType) {
        if (!hasRateForGigType(musician.rate, processedGigType)) {
          return false;
        }
      }

      return true;
    });

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case "trust":
            const aTrustStars = a.trustStars || 0.5;
            const bTrustStars = b.trustStars || 0.5;
            if (Math.abs(bTrustStars - aTrustStars) > 0.1) {
              return bTrustStars - aTrustStars;
            }
            return (b.trustScore || 0) - (a.trustScore || 0);

          case "rating":
            return getCompositeRating(b) - getCompositeRating(a);

          case "experience":
            const aExp = a.completedGigsCount || 0;
            const bExp = b.completedGigsCount || 0;
            if (bExp !== aExp) {
              return bExp - aExp;
            }
            return (b.trustStars || 0.5) - (a.trustStars || 0.5);

          case "rate":
            const getRateValue = (rateStr: string) => {
              const match = rateStr?.match(/(\d+)/);
              return match ? parseInt(match[1]) : Infinity;
            };
            const aRate = getRateValue(a.displayRate || "");
            const bRate = getRateValue(b.displayRate || "");
            return aRate - bRate;

          case "recent":
          default:
            const aStars = a.trustStars || 0.5;
            const bStars = b.trustStars || 0.5;
            if (Math.abs(bStars - aStars) > 0.1) {
              return bStars - aStars;
            }
            return getCompositeRating(b) - getCompositeRating(a);
        }
      });
    }

    return filtered;
  }, [musicians, filters, currentUserTrustStars]);
};

// Updated useMusicianRate with trust context
export const useMusicianRate = (
  musician: EnhancedMusician | null,
  gigType?: GigType | string
) => {
  return useMemo(() => {
    if (!musician) return null;

    // Validate gigType
    let processedGigType: GigType | undefined;
    if (gigType) {
      if (isValidGigType(gigType)) {
        processedGigType = gigType as GigType;
      } else {
        console.warn(`Invalid gig type: ${gigType}`);
      }
    }

    const rateInfo = processedGigType
      ? getRateForGigType(musician.rate, processedGigType, musician.roleType)
      : null;

    const displayRate =
      rateInfo?.displayRate || getDisplayRate(musician.rate, musician.roleType);

    // Add trust context to rate
    const trustStars = musician.trustStars || 0.5;
    const canBeBookedDirectly = trustStars >= TRUST_THRESHOLDS.canBeBooked;
    const rateConfidence = canBeBookedDirectly
      ? "high"
      : trustStars >= 2.0
        ? "medium"
        : "low";

    return {
      rateInfo,
      displayRate,
      // Trust context
      trustStars,
      canBeBookedDirectly,
      rateConfidence,
      // Rate modifiers based on trust
      isRateTrustworthy: rateConfidence === "high",
      trustBasedDiscount: canBeBookedDirectly
        ? "Direct booking available"
        : "Contact for booking",
    };
  }, [musician, gigType]);
};

// NEW: Hook for trust-based musician recommendations
export const useTrustBasedRecommendations = (
  gigType?: GigType | string,
  limit: number = 6
) => {
  const { musicians, isLoading } = useProMusicians({
    gigType,
    limit: 20, // Get more to filter
    sortBy: "trust", // Sort by trust first
  });

  const recommendations = useMemo(() => {
    if (!musicians.length) return [];

    return musicians
      .filter((musician) => {
        // Filter for highly trusted musicians
        const trustStars = musician.trustStars || 0.5;
        const trustScore = musician.trustScore || 0;

        return (
          trustStars >= 3.5 && // At least 3.5 stars
          trustScore >= 60 && // At least 60 trust score
          musician.canBeBookedDirectly && // Can be booked directly
          musician.hasRateForGigType
        ); // Has rates for this gig type
      })
      .slice(0, limit);
  }, [musicians, gigType, limit]);

  return {
    recommendations,
    isLoading,
    isEmpty: recommendations.length === 0,
  };
};
