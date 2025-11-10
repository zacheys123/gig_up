// Essential musician fields for display and booking
export interface Musician {
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
