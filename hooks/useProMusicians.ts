// hooks/useProMusicians.ts - OPTIMIZED VERSION WITH BETTER SEARCH
import { useQuery } from "convex/react";
import { useMemo, useState, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { EnhancedMusician } from "@/types/musician";

interface UseProMusiciansProps {
  city?: string;
  instrument?: string;
  genre?: string;
  limit?: number;
  minRating?: number;
  tier?: "free" | "pro" | "premium" | "elite";
  gigType?: string;
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
  const queryFilters = useMemo(
    () => ({
      limit: 12,
      availableOnly: false,
      ...filters,
    }),
    [
      filters.city,
      filters.instrument,
      filters.genre,
      filters.limit,
      filters.minRating,
      filters.tier,
      filters.gigType,
      filters.availableOnly,
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

  // Enhanced fallback data for empty results
  const enhancedMusicians = useMemo(() => {
    if (!musicians || musicians.length === 0) {
      return [];
    }
    return musicians.map((musician) => ({
      ...musician,
      // Ensure all required fields have fallbacks
      firstname: musician.firstname || "Musician",
      instrument: musician.instrument || "Various Instruments",
      avgRating: musician.avgRating || 0,
      completedGigsCount: musician.completedGigsCount || 0,
      reliabilityScore: musician.reliabilityScore || 80,
      city: musician.city || "Various Locations",
    }));
  }, [musicians]);

  return {
    musicians: enhancedMusicians,
    featuredMusicians: featuredMusicians || [],
    isLoading: musicians === undefined,
    isEmpty: musicians?.length === 0,
  };
};

export const useMusicianSearch = (
  searchQuery: string,
  city?: string,
  instrument?: string
) => {
  // Debounce search to avoid too many requests
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

  const memoizedResults = useMemo(() => results || [], [results]);

  return {
    results: memoizedResults,
    isLoading: results === undefined && debouncedSearchQuery !== "",
    isEmpty: results?.length === 0 && debouncedSearchQuery !== "",
  };
};

export const useMusicianById = (musicianId: Id<"users"> | null) => {
  const musician = useQuery(
    api.controllers.musicians.getMusicianById,
    musicianId ? { musicianId } : "skip"
  ) as EnhancedMusician | undefined;

  return {
    musician: musician || null,
    isLoading: musician === undefined,
  };
};

// New hook for advanced musician filtering
export const useFilteredMusicians = (
  musicians: EnhancedMusician[],
  filters: {
    city?: string;
    instrument?: string;
    gigType?: string;
    minRating?: number;
    tier?: string;
  }
) => {
  return useMemo(() => {
    if (!musicians.length) return [];

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

      return true;
    });
  }, [musicians, filters]);
};
