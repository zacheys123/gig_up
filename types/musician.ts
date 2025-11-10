// types/musician.ts
import { Id } from "@/convex/_generated/dataModel";

export interface EnhancedMusician {
  _id: Id<"users">;
  firstname?: string;
  lastname?: string;
  username: string;
  email: string;
  picture?: string;
  city?: string;

  // Musician professional info
  instrument?: string;
  roleType?: string;
  experience?: string;
  talentbio?: string;
  verified?: boolean;

  // Performance metrics
  avgRating?: number;
  reliabilityScore?: number;
  completedGigsCount?: number;

  // Rates
  rate?: {
    regular?: string;
    function?: string;
    concert?: string;
    corporate?: string;
  };

  allreviews?: Array<{
    _id: string;
    postedBy: string;
    postedTo: string;
    rating?: number;
    comment?: string;
    gigId?: string;
    updatedAt?: number;
    createdAt?: number;
  }>;
  // Social & genres
  musiciangenres?: string[];
  followers?: string[];

  // Tier and status
  tier: "free" | "pro" | "premium" | "elite";
  isMusician: boolean;

  // Enhanced fields (added in queries)
  displayRate: string;
  gigTypeCompatibility?: number;
  isOptimalForGigType?: boolean;
}
