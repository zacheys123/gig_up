// types/trendingTypes.ts
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export interface RatingBreakdown {
  gigExperience: number;
  activityRecency: number;
  platformUsage: number;
  reviewQuality: number;
  reliability: number;
  tierStatus: number;
  socialProof: number;
  deputyEngagement: number;
}

export interface MusicianRating {
  overall: number;
  score: number;
  breakdown: RatingBreakdown;
  reviewCount: number;
  lastUpdated: number;
}

export interface TrendingMusician {
  _id: Id<"users">;
  clerkId: string;
  username: string;
  firstname?: string;
  lastname?: string;
  picture?: string;
  completedGigsCount: number;
  tier: "free" | "pro" | "premium" | "elite";
  instrument?: string;
  city?: string;
  isMusician: boolean;
  isBooker: boolean;
  rating: MusicianRating;
  followersCount: number;
  trendingScore: number;
  roleType: string;
  followers: string[];
  followings: string[];
}

// For the component props
export interface TrendingMusiciansResponse {
  musicians: TrendingMusician[];
  totalCount: number;
  lastUpdated: number;
} // hooks/useTrendingMusicians.ts

export const useTrendingMusicians = (): TrendingMusician[] => {
  const musicians = useQuery(
    api.controllers.ratings.getTrendingMusiciansWithRatings
  );

  // Type guard to ensure proper typing
  if (!musicians || !Array.isArray(musicians)) {
    return [];
  }

  return musicians as TrendingMusician[];
};

// Optional: Hook with loading state
export const useTrendingMusiciansWithState = (): {
  musicians: TrendingMusician[];
  isLoading: boolean;
  error: Error | null;
} => {
  const musicians = useQuery(
    api.controllers.ratings.getTrendingMusiciansWithRatings
  );

  return {
    musicians: (musicians as TrendingMusician[]) || [],
    isLoading: musicians === undefined,
    error: null,
  };
};
