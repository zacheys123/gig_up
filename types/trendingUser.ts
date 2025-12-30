// types/trendingTypes.ts
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Trust score breakdown type
export interface TrustScoreBreakdown {
  profileComplete: boolean;
  mpesaPhoneNumber: boolean;
  accountAgeDays: number;
  completedGigs: number;
  avgRating: number;
  followers: number;
  tier: string;
  trustScore: number;
  trustStars: number;
}

// Trust score result type
export interface TrustScoreResult {
  trustScore: number; // 0-100
  trustStars: number; // 0.5-5.0
  tier: "new" | "basic" | "verified" | "trusted" | "elite";
  isProfileComplete: boolean;
  role: "musician" | "client" | "booker" | "unknown";
  breakdown: TrustScoreBreakdown;
}

// Combined rating with trust score
export interface CombinedRating {
  overall: number; // Combined score (0-5)
  trustScore: number; // Trust score (0-100)
  trustStars: number; // Trust stars (0.5-5.0)
  trustTier: string; // Trust tier
  clientRating: number; // Average client rating (1-5)
  reviewCount: number;
  lastUpdated: number;
  breakdown: {
    trust: TrustScoreBreakdown;
    performance?: {
      reliability: number;
      responseTime?: number;
      completionRate?: number;
    };
  };
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
  // Updated to use CombinedRating
  rating: CombinedRating;
  followersCount: number;
  trendingScore: number;
  roleType: string;
  followers: string[];
  followings: string[];
  availability?: "available" | "notavailable";
  experience?: string;
  genre?: string;
  allreviews: {
    _id: string;
    postedBy: string;
    postedTo: string;
    rating?: number;
    comment?: string;
    gigId?: string;
    updatedAt?: number;
    createdAt?: number;
  }[];
  // Trust score fields
  trustScore?: number;
  trustStars?: number;
  trustTier?: string;
  isProfileComplete?: boolean;
}

// For the component props
export interface TrendingMusiciansResponse {
  musicians: TrendingMusician[];
  totalCount: number;
  lastUpdated: number;
}
