// hooks/useProMusicians.ts - FIXED VERSION
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

interface UseProMusiciansProps {
  city?: string;
  instrument?: string;
  genre?: string;
  limit?: number;
  minRating?: number;
  tier?: "free" | "pro" | "premium" | "elite";
  gigType?: GigType | string; // Allow both GigType and string for flexibility
  availableOnly?: boolean;
}

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

  // Enhanced musicians with rate information
  const enhancedMusicians = useMemo(() => {
    if (!musicians || musicians.length === 0) {
      return [];
    }

    return musicians.map((musician) => {
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
        gigTypeRate, // Include the gig-type specific rate info
        hasRateForGigType: processedFilters.gigType
          ? hasRateForGigType(musician.rate, processedFilters.gigType)
          : true,
      };
    });
  }, [musicians, processedFilters.gigType]);

  return {
    musicians: enhancedMusicians,
    featuredMusicians: featuredMusicians || [],
    isLoading: musicians === undefined,
    isEmpty: musicians?.length === 0,
  };
};

// ... rest of your hooks remain the same
export const useMusicianSearch = (
  searchQuery: string,
  city?: string,
  instrument?: string
) => {
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

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

  // Enhance results with rate display
  const enhancedResults = useMemo(() => {
    if (!results) return [];

    return results.map((musician) => ({
      ...musician,
      displayRate: getDisplayRate(musician.rate, musician.roleType),
    }));
  }, [results]);

  return {
    results: enhancedResults,
    isLoading: results === undefined && debouncedSearchQuery !== "",
    isEmpty: results?.length === 0 && debouncedSearchQuery !== "",
  };
};

export const useMusicianById = (musicianId: Id<"users"> | null) => {
  const musician = useQuery(
    api.controllers.musicians.getMusicianById,
    musicianId ? { musicianId } : "skip"
  ) as EnhancedMusician | undefined;

  const enhancedMusician = useMemo(() => {
    if (!musician) return null;

    return {
      ...musician,
      displayRate: getDisplayRate(musician.rate, musician.roleType),
      allRates: musician.rate ? getAllRates(musician.rate) : [],
    };
  }, [musician]);

  return {
    musician: enhancedMusician,
    isLoading: musician === undefined,
  };
};

// Updated hook for advanced musician filtering that accepts string gigType
export const useFilteredMusicians = (
  musicians: EnhancedMusician[],
  filters: {
    city?: string;
    instrument?: string;
    gigType?: GigType | string;
    minRating?: number;
    tier?: string;
    hasRatesOnly?: boolean;
  }
) => {
  return useMemo(() => {
    if (!musicians.length) return [];

    // Process gigType to ensure it's valid
    let processedGigType: GigType | undefined;
    if (filters.gigType) {
      if (isValidGigType(filters.gigType)) {
        processedGigType = filters.gigType as GigType;
      }
    }

    return musicians.filter((musician) => {
      // City filter
      if (filters.city && musician.city !== filters.city) {
        return false;
      }

      // Instrument filter
      if (filters.instrument && musician.instrument !== filters.instrument) {
        return false;
      }

      // Rating filter
      if (filters.minRating && (musician.avgRating || 0) < filters.minRating) {
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
  }, [musicians, filters]);
};

// Hook to get rate information for a specific musician and gig type (accepts string)
export const useMusicianRate = (
  musician: EnhancedMusician | null,
  gigType?: GigType | string
) => {
  return useMemo(() => {
    if (!musician || !gigType) return null;

    // Validate gigType
    if (!isValidGigType(gigType)) return null;

    return getRateForGigType(
      musician.rate,
      gigType as GigType,
      musician.roleType
    );
  }, [musician, gigType]);
};
