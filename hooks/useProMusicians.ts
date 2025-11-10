// hooks/useProMusicians.ts - COMPLETE UPDATED VERSION
import { useQuery } from "convex/react";
import { useMemo } from "react";
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

export const useProMusicians = (filters: UseProMusiciansProps = {}) => {
  const queryFilters = useMemo(
    () => ({
      limit: 12,
      minRating: 4.0,
      availableOnly: true,
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

  // Memoize results
  const enhancedMusicians = useMemo(() => {
    return musicians || [];
  }, [musicians]);

  const enhancedFeaturedMusicians = useMemo(() => {
    return featuredMusicians || [];
  }, [featuredMusicians]);

  return {
    musicians: enhancedMusicians,
    featuredMusicians: enhancedFeaturedMusicians,
    isLoading: musicians === undefined || featuredMusicians === undefined,
  };
};

export const useMusicianSearch = (
  searchQuery: string,
  city?: string,
  instrument?: string
) => {
  const searchParams = useMemo(
    () => (searchQuery ? { query: searchQuery, city, instrument } : "skip"),
    [searchQuery, city, instrument]
  );

  const results = useQuery(
    api.controllers.musicians.searchMusicians,
    searchParams
  ) as EnhancedMusician[] | undefined;

  const memoizedResults = useMemo(() => results || [], [results]);

  return {
    results: memoizedResults,
    isLoading: results === undefined,
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
