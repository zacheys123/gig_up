// types/musician.ts
import { Id } from "@/convex/_generated/dataModel";
import { RateInfo } from "@/utils";

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
  isCompatible?: boolean;
  // Rates
  rate?: {
    baseRate?: string;
    rateType?:
      | "hourly"
      | "daily"
      | "per_session"
      | "per_gig"
      | "monthly"
      | "custom";
    currency?: string;
    categories?: Array<{
      name: string;
      rate: string;
      rateType?: string;
      description?: string;
    }>;
    negotiable?: boolean;
    depositRequired?: boolean;
    travelIncluded?: boolean;
    travelFee?: string;
    // Legacy fields
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

  displayRate: string;
  gigTypeRate?: RateInfo | null;
  hasRateForGigType?: boolean;

  // Compatibility fields
  gigTypeCompatibility?: number;
  isOptimalForGigType?: boolean;
}
