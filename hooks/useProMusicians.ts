// hooks/useProMusicians.ts - UPDATED WITH TRUST STARS INTEGRATION
import { useQuery } from "convex/react";
import { useMemo, useState, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { EnhancedMusician } from "@/types/musician";
import {
  getRateForGigType,
  getDisplayRate,
  hasRateForGigType,
  getAllRates,
} from "@/utils";
import { GigType, isValidGigType } from "@/convex/gigTypes";
import { useTrustScore } from "./useTrustScore"; // ADD THIS IMPORT

interface UseProMusiciansProps {
  city?: string;
  instrument?: string;
  genre?: string;
  limit?: number;
  minRating?: number;
  minTrustStars?: number; // NEW: Add trust filter
  minTrustScore?: number; // NEW: Add trust score filter
  tier?: "free" | "pro" | "premium" | "elite";
  gigType?: GigType | string;
  availableOnly?: boolean;
  sortBy?: "trust" | "rating" | "experience" | "recent" | "rate"; // NEW: Add sorting
}

// Trust-based eligibility thresholds
const TRUST_THRESHOLDS = {
  canBeBooked: 3.0, // Need 3.0+ stars to be directly bookable
  isVerified: 3.0, // Auto-verified at 3.0+ stars
  isReliable: 50, // Trust score ≥ 50 is reliable
  canHireDirectly: 4.0, // Users need 4.0+ stars to hire directly
};

// Debounce hook for search optimization
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

export const useProMusicians = (filters: UseProMusiciansProps = {}) => {
  // Convert string gigType to GigType if valid
  const processedFilters = useMemo(() => {
    const { gigType, ...rest } = filters;

    // Validate and convert gigType to GigType if it's a string
    let processedGigType: GigType | undefined;
    if (gigType) {
      if (isValidGigType(gigType)) {
        processedGigType = gigType as GigType;
      } else {
        console.warn(`Invalid gig type: ${gigType}`);
      }
    }

    return {
      ...rest,
      gigType: processedGigType,
    };
  }, [filters]);

  // Get current user's trust for eligibility checks
  const {
    trustStars: currentUserTrustStars,
    trustScore: currentUserTrustScore,
  } = useTrustScore();

  const queryFilters = useMemo(
    () => ({
      limit: 12,
      availableOnly: false,
      ...processedFilters,
    }),
    [
      processedFilters.city,
      processedFilters.instrument,
      processedFilters.genre,
      processedFilters.limit,
      processedFilters.minRating,
      processedFilters.minTrustStars, // Add trust filter
      processedFilters.minTrustScore, // Add trust score filter
      processedFilters.tier,
      processedFilters.gigType,
      processedFilters.availableOnly,
    ]
  );

  const musicians = useQuery(
    api.controllers.musicians.getProMusicians,
    queryFilters
  ) as EnhancedMusician[] | undefined;

  const featuredMusicians = useQuery(
    api.controllers.musicians.getFeaturedMusicians,
    { limit: queryFilters.limit }
  ) as EnhancedMusician[] | undefined;

  // Enhanced musicians with rate AND trust information
  const enhancedMusicians = useMemo(() => {
    if (!musicians || musicians.length === 0) {
      return [];
    }

    // Helper function to get trust tier
    const getTrustTier = (trustStars: number = 0.5): string => {
      if (trustStars >= 4.5) return "elite";
      if (trustStars >= 4.0) return "trusted";
      if (trustStars >= 3.0) return "verified";
      if (trustStars >= 2.0) return "basic";
      return "new";
    };

    // Helper function to get trust tier color
    const getTrustTierColor = (trustStars: number = 0.5): string => {
      if (trustStars >= 4.5)
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      if (trustStars >= 4.0)
        return "bg-green-500/10 text-green-600 border-green-500/20";
      if (trustStars >= 3.0)
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      if (trustStars >= 2.0)
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    };

    // Helper function to get trust tier description
    const getTrustTierDescription = (trustStars: number = 0.5): string => {
      if (trustStars >= 4.5) return "Elite - Top-rated professional";
      if (trustStars >= 4.0) return "Trusted - Highly reliable";
      if (trustStars >= 3.0) return "Verified - Established member";
      if (trustStars >= 2.0) return "Basic - Active member";
      return "New - Getting started";
    };

    const musiciansWithTrust = musicians.map((musician) => {
      // Get gig-type specific rate if gigType filter is applied
      const gigTypeRate = processedFilters.gigType
        ? getRateForGigType(
            musician.rate,
            processedFilters.gigType,
            musician.roleType
          )
        : null;

      // Fallback to general display rate
      const displayRate =
        gigTypeRate?.displayRate ||
        getDisplayRate(musician.rate, musician.roleType);

      // Trust information (with fallbacks)
      const trustStars = musician.trustStars || 0.5;
      const trustScore = musician.trustScore || 0;
      const trustTier = getTrustTier(trustStars);
      const trustTierColor = getTrustTierColor(trustStars);
      const trustTierDescription = getTrustTierDescription(trustStars);

      // Trust-based eligibility
      const canBeBookedDirectly = trustStars >= TRUST_THRESHOLDS.canBeBooked;
      const isAutoVerified = trustStars >= TRUST_THRESHOLDS.isVerified;
      const isReliable = trustScore >= TRUST_THRESHOLDS.isReliable;

      // Combine auto-verification with existing verification
      const isVerified = musician.verified || isAutoVerified;

      // Rate eligibility based on trust
      const rateConfidence = canBeBookedDirectly
        ? "high"
        : trustStars >= 2.0
          ? "medium"
          : "low";

      // Eligibility for current user to book this musician
      const canCurrentUserBook = currentUserTrustStars >= 2.0; // User needs 2.0+ stars to book anyone
      const canUserBookDirectly =
        currentUserTrustStars >= TRUST_THRESHOLDS.canHireDirectly &&
        canBeBookedDirectly;

      return {
        ...musician,
        // Ensure all required fields have fallbacks
        firstname: musician.firstname || "Musician",
        instrument: musician.instrument
          ? musician.instrument
          : musician.roleType === "dj"
            ? "Deejay"
            : musician.roleType === "mc"
              ? "EMCee"
              : musician.roleType === "vocalist"
                ? "Vocalist"
                : "Various Instruments",
        avgRating: musician.avgRating || 0,
        completedGigsCount: musician.completedGigsCount || 0,
        reliabilityScore: musician.reliabilityScore || 80,
        city: musician.city || "Various Locations",
        // Rate information
        displayRate,
        gigTypeRate,
        hasRateForGigType: processedFilters.gigType
          ? hasRateForGigType(musician.rate, processedFilters.gigType)
          : true,
        // Trust information
        trustScore,
        trustStars,
        trustTier,
        trustTierColor,
        trustTierDescription,
        // Trust-based eligibility
        canBeBookedDirectly,
        isVerified,
        isReliable,
        rateConfidence,
        // User-specific eligibility
        canCurrentUserBook,
        canUserBookDirectly,
        // Composite rating (combines avgRating with trustStars for display)
        compositeRating: ((musician.avgRating || 0) + trustStars) / 2,
      };
    });

    // Apply sorting if specified
    let sortedMusicians = [...musiciansWithTrust];

    if (processedFilters.sortBy) {
      sortedMusicians.sort((a, b) => {
        switch (processedFilters.sortBy) {
          case "trust":
            // Primary: trust stars, Secondary: trust score
            const aTrustStars = a.trustStars || 0.5;
            const bTrustStars = b.trustStars || 0.5;
            if (Math.abs(bTrustStars - aTrustStars) > 0.1) {
              return bTrustStars - aTrustStars;
            }
            // If stars are close, sort by trust score
            const aTrustScore = a.trustScore || 0;
            const bTrustScore = b.trustScore || 0;
            return bTrustScore - aTrustScore;

          case "rating":
            // Primary: composite rating (avgRating + trustStars)
            const aRating = a.compositeRating || 0;
            const bRating = b.compositeRating || 0;
            return bRating - aRating;

          case "experience":
            // Primary: gigs completed, Secondary: trust stars
            const aExp = a.completedGigsCount || 0;
            const bExp = b.completedGigsCount || 0;
            if (bExp !== aExp) {
              return bExp - aExp;
            }
            return (b.trustStars || 0.5) - (a.trustStars || 0.5);

          case "rate":
            // Sort by display rate (numeric part)
            const getRateValue = (rateStr: string) => {
              const match = rateStr.match(/(\d+)/);
              return match ? parseInt(match[1]) : 0;
            };
            const aRate = getRateValue(a.displayRate || "");
            const bRate = getRateValue(b.displayRate || "");
            return aRate - bRate; // Lowest rate first

          case "recent":
          default:
            // Default sorting: trust stars first, then composite rating
            const aStars = a.trustStars || 0.5;
            const bStars = b.trustStars || 0.5;
            if (Math.abs(bStars - aStars) > 0.1) {
              return bStars - aStars;
            }
            return (b.compositeRating || 0) - (a.compositeRating || 0);
        }
      });
    }

    return sortedMusicians;
  }, [
    musicians,
    processedFilters.gigType,
    processedFilters.sortBy,
    currentUserTrustStars,
  ]);

  return {
    musicians: enhancedMusicians,
    featuredMusicians: featuredMusicians || [],
    isLoading: musicians === undefined,
    isEmpty: musicians?.length === 0,
    // Trust information for the current user
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
