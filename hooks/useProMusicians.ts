// hooks/useProMusicians.ts - OPTIMIZED
import { useQuery } from "convex/react";
import { useMemo } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface UseProMusiciansProps {
  city?: string;
  instrument?: string;
  genre?: string;
  limit?: number;
  minRating?: number;
  tier?: "free" | "pro" | "premium" | "elite";
}

// Memoize default filters to prevent unnecessary re-renders
const DEFAULT_FILTERS = {
  limit: 12,
  minRating: 4.0,
};

export const useProMusicians = (filters: UseProMusiciansProps = {}) => {
  // Merge with default filters and memoize
  const queryFilters = useMemo(
    () => ({
      ...DEFAULT_FILTERS,
      ...filters,
    }),
    [
      filters.city,
      filters.instrument,
      filters.genre,
      filters.limit,
      filters.minRating,
      filters.tier,
    ]
  );

  const musicians = useQuery(
    api.controllers.musicians.getProMusicians,
    queryFilters
  );

  const featuredMusicians = useQuery(
    api.controllers.musicians.getFeaturedMusicians,
    { limit: queryFilters.limit }
  );

  // Memoize results to prevent unnecessary re-renders
  const memoizedMusicians = useMemo(() => musicians || [], [musicians]);
  const memoizedFeaturedMusicians = useMemo(
    () => featuredMusicians || [],
    [featuredMusicians]
  );

  const isLoading = musicians === undefined || featuredMusicians === undefined;

  return {
    musicians: memoizedMusicians,
    featuredMusicians: memoizedFeaturedMusicians,
    isLoading,
  };
};

export const useMusicianSearch = (
  searchQuery: string,
  city?: string,
  instrument?: string
) => {
  // Memoize search parameters
  const searchParams = useMemo(
    () => (searchQuery ? { query: searchQuery, city, instrument } : "skip"),
    [searchQuery, city, instrument]
  );

  const results = useQuery(
    api.controllers.musicians.searchMusicians,
    searchParams
  );

  // Memoize results
  const memoizedResults = useMemo(() => results || [], [results]);

  return {
    results: memoizedResults,
    isLoading: results === undefined,
  };
};

export const useMusicianById = (musicianId: Id<"users"> | null) => {
  const queryParams = useMemo(
    () => (musicianId ? { musicianId } : "skip"),
    [musicianId]
  );

  const musician = useQuery(
    api.controllers.musicians.getMusicianById,
    queryParams
  );

  return {
    musician,
    isLoading: musician === undefined,
  };
};
