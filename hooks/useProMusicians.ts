// hooks/useProMusicians.ts
import { useQuery } from "convex/react";
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

export const useProMusicians = (filters: UseProMusiciansProps = {}) => {
  const musicians = useQuery(
    api.controllers.musicians.getProMusicians,
    filters
  );
  const featuredMusicians = useQuery(
    api.controllers.musicians.getFeaturedMusicians,
    {
      limit: filters.limit || 12,
    }
  );

  return {
    musicians: musicians || [],
    featuredMusicians: featuredMusicians || [],
    isLoading: musicians === undefined || featuredMusicians === undefined,
  };
};

export const useMusicianSearch = (
  searchQuery: string,
  city?: string,
  instrument?: string
) => {
  const results = useQuery(
    api.controllers.musicians.searchMusicians,
    searchQuery ? { query: searchQuery, city, instrument } : "skip"
  );

  return {
    results: results || [],
    isLoading: results === undefined,
  };
};

export const useMusicianById = (musicianId: Id<"users"> | null) => {
  const musician = useQuery(
    api.controllers.musicians.getMusicianById,
    musicianId ? { musicianId } : "skip"
  );

  return {
    musician,
    isLoading: musician === undefined,
  };
};
