// convex/trustScore.ts - KEEP BOTH SYSTEMS
import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

// ========== TYPE DEFINITIONS ==========
export type TrustTier = "new" | "basic" | "verified" | "trusted" | "elite";
export type UserRole = "musician" | "client" | "booker" | "unknown";

export interface TrustBreakdown {
  profileComplete: boolean;
  mpesaPhoneNumber: boolean;
  accountAgeDays: number;
  completedGigs: number;
  avgRating: number;
  followers: number;
  tier: string;
  trustScore: number; // Keep this
  trustStars: number; // Add this
}

export interface TrustScoreResult {
  trustScore: number; // Keep for calculations
  trustStars: number; // Add for display
  tier: TrustTier;
  isProfileComplete: boolean;
  role: UserRole;
  breakdown: TrustBreakdown;
}

export interface TrustScoreData {
  trustScore: number; // Detailed score (0-100)
  trustStars: number; // User-friendly stars (1-5)
  tier: TrustTier;
  lastUpdated: number;
  isProfileComplete: boolean;
  userRole: UserRole;
  roleSpecificData: {
    isMusician: boolean;
    isClient: boolean;
    isBooker: boolean;
    completedGigsCount: number;
    gigsPosted: number;
    artistsManaged: number;
    avgRating: number;
    earnings: number;
    totalSpent: number;
  };
  breakdown: TrustBreakdown;
  isCalculated?: boolean;
  featureEligibility: {
    canCreateBand: boolean;
    canCompete: boolean;
    canBeDual: boolean;
    canVideoCall: boolean;
    canPostPremiumGigs: boolean;
    canAccessAnalytics: boolean;
    canVerifiedBadge: boolean;
  };
} // ========== TYPE DEFINITIONS ==========

// Add these interfaces
export interface InitializeResponse {
  success: boolean;
  message?: string;
  score?: number;
  tier?: TrustTier;
}

export interface BulkInitializeResult {
  userId: Id<"users">;
  username?: string;
  score?: number;
  tier?: TrustTier;
  success: boolean;
  error?: string;
}

export interface BulkInitializeResponse {
  processed: number;
  successful: number;
  failed: number;
  results: BulkInitializeResult[];
}

export interface ImprovementTip {
  action: string;
  points: number;
  category: string;
  current?: number;
  max?: number;
}

// ========== DUAL SYSTEM THRESHOLDS ==========
// For calculations (0-100)
const FEATURE_SCORE_THRESHOLDS = {
  canPostBasicGigs: 10,
  canMessageUsers: 20,
  canVerifiedBadge: 40,
  canCompete: 45,
  canAccessAnalytics: 50,
  canPostPremiumGigs: 55,
  canBeDual: 60,
  canVideoCall: 65,
  canCreateBand: 70,
  canHireTeams: 75,
  canVerifyOthers: 80,
  canModerate: 85,
  canBetaFeatures: 90,
} as const;

// For display (1-5 stars) - derived from scores
const FEATURE_STAR_THRESHOLDS = {
  canPostBasicGigs: 1.0,
  canMessageUsers: 2.0,
  canVerifiedBadge: 3.0,
  canCompete: 3.5,
  canAccessAnalytics: 3.5,
  canPostPremiumGigs: 3.5,
  canBeDual: 4.0,
  canVideoCall: 4.0,
  canCreateBand: 4.5,
  canHireTeams: 4.5,
  canVerifyOthers: 5.0,
  canModerate: 5.0,
  canBetaFeatures: 5.0,
} as const;

// ========== CONVERSION FUNCTIONS ==========

// Convert score (0-100) to stars (1-5)
export function scoreToStars(score: number): number {
  const normalized = Math.min(Math.max(score, 0), 100);

  // Mapping that makes sense
  if (normalized >= 90) return 5.0; // Elite
  if (normalized >= 80) return 4.5; // Trusted+
  if (normalized >= 70) return 4.0; // Trusted
  if (normalized >= 60) return 3.5; // Verified+
  if (normalized >= 50) return 3.0; // Verified
  if (normalized >= 40) return 2.5; // Basic+
  if (normalized >= 30) return 2.0; // Basic
  if (normalized >= 20) return 1.5; // New+
  if (normalized >= 10) return 1.0; // New
  return 0.5; // Just joined
}

// Convert stars (1-5) back to approximate score
export function starsToScore(stars: number): number {
  if (stars >= 5.0) return 95;
  if (stars >= 4.5) return 85;
  if (stars >= 4.0) return 75;
  if (stars >= 3.5) return 65;
  if (stars >= 3.0) return 55;
  if (stars >= 2.5) return 45;
  if (stars >= 2.0) return 35;
  if (stars >= 1.5) return 25;
  if (stars >= 1.0) return 15;
  return 5;
}

// Get trust tier from either score or stars
export function getTrustTierFromScore(score: number): TrustTier {
  if (score >= 80) return "elite";
  if (score >= 65) return "trusted";
  if (score >= 50) return "verified";
  if (score >= 30) return "basic";
  return "new";
}

export function getTrustTierFromStars(stars: number): TrustTier {
  if (stars >= 4.5) return "elite";
  if (stars >= 4.0) return "trusted";
  if (stars >= 3.0) return "verified";
  if (stars >= 2.0) return "basic";
  return "new";
}

// Get star description
export function getStarDescription(stars: number): string {
  if (stars >= 4.5) return "Elite - Top-rated professional";
  if (stars >= 4.0) return "Trusted - Highly reliable";
  if (stars >= 3.0) return "Verified - Established member";
  if (stars >= 2.0) return "Basic - Active member";
  return "New - Getting started";
}

// Check feature eligibility with score
function getFeatureEligibility(score: number, user: Doc<"users">) {
  return {
    canCreateBand:
      user.isMusician && score >= FEATURE_SCORE_THRESHOLDS.canCreateBand,
    canCompete: score >= FEATURE_SCORE_THRESHOLDS.canCompete,
    canBeDual: score >= FEATURE_SCORE_THRESHOLDS.canBeDual,
    canVideoCall: score >= FEATURE_SCORE_THRESHOLDS.canVideoCall,
    canPostPremiumGigs: score >= FEATURE_SCORE_THRESHOLDS.canPostPremiumGigs,
    canAccessAnalytics: score >= FEATURE_SCORE_THRESHOLDS.canAccessAnalytics,
    canVerifiedBadge: score >= FEATURE_SCORE_THRESHOLDS.canVerifiedBadge,
    canPostBasicGigs: score >= FEATURE_SCORE_THRESHOLDS.canPostBasicGigs,
    canMessageUsers: score >= FEATURE_SCORE_THRESHOLDS.canMessageUsers,
    canHireTeams: score >= FEATURE_SCORE_THRESHOLDS.canHireTeams,
    canVerifyOthers: score >= FEATURE_SCORE_THRESHOLDS.canVerifyOthers,
    canModerate: score >= FEATURE_SCORE_THRESHOLDS.canModerate,
    canBetaFeatures: score >= FEATURE_SCORE_THRESHOLDS.canBetaFeatures,
  };
}
async function calculateTrustScore(
  ctx: any,
  userId: Id<"users">
): Promise<TrustScoreResult> {
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("User not found");

  // Calculate base score (including penalties)
  let score = await calculateRoleSpecificScore(ctx, user);

  // Apply profile completeness multiplier
  const isProfileComplete = checkProfileCompleteness(user);
  const profileMultiplier = isProfileComplete ? 1.0 : 0.7;
  score = Math.round(score * profileMultiplier);

  // Ensure score is within bounds (10-100)
  // Minimum 10 points for having an account
  score = Math.max(10, Math.min(100, score));

  const trustStars = scoreToStars(score);
  const tier = getTrustTierFromScore(score);

  let role: UserRole = "unknown";
  if (user.isMusician) role = "musician";
  else if (user.isClient) role = "client";
  else if (user.isBooker) role = "booker";

  return {
    trustScore: score,
    trustStars,
    tier,
    isProfileComplete,
    role,
    breakdown: {
      profileComplete: isProfileComplete,
      mpesaPhoneNumber: !!user.mpesaPhoneNumber,
      accountAgeDays: Math.floor(
        (Date.now() - user._creationTime) / (1000 * 60 * 60 * 24)
      ),
      completedGigs: user.completedGigsCount || 0,
      avgRating: user.avgRating || 0,
      followers: user.followers?.length || 0,
      tier: user.tier || "free",
      trustScore: score,
      trustStars,
    },
  };
}
// ========== CALCULATE USER TRUST ==========
async function calculateUserTrust(
  ctx: any,
  userId: Id<"users">
): Promise<TrustScoreResult> {
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("User not found");

  // Calculate score (0-100) using existing logic
  let trustScore = await calculateRoleSpecificScore(ctx, user);
  const isProfileComplete = checkProfileCompleteness(user);
  const profileMultiplier = isProfileComplete ? 1.0 : 0.7;
  trustScore = Math.round(trustScore * profileMultiplier);
  trustScore = Math.max(10, Math.min(100, trustScore));

  // Convert to stars for display
  const trustStars = scoreToStars(trustScore);
  const tier = getTrustTierFromScore(trustScore);

  let role: UserRole = "unknown";
  if (user.isMusician) role = "musician";
  else if (user.isClient) role = "client";
  else if (user.isBooker) role = "booker";

  return {
    trustScore,
    trustStars,
    tier,
    isProfileComplete,
    role,
    breakdown: {
      profileComplete: isProfileComplete,
      mpesaPhoneNumber: !!user.mpesaPhoneNumber,
      accountAgeDays: Math.floor(
        (Date.now() - user._creationTime) / (1000 * 60 * 60 * 24)
      ),
      completedGigs: user.completedGigsCount || 0,
      avgRating: user.avgRating || 0,
      followers: user.followers?.length || 0,
      tier: user.tier || "free",
      trustScore,
      trustStars,
    },
  };
}

// ========== UPDATE USER TRUST ==========
export async function updateUserTrust(
  ctx: any,
  userId: Id<"users">
): Promise<TrustScoreResult> {
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("User not found");

  const result = await calculateUserTrust(ctx, userId);
  const featureEligibility = getFeatureEligibility(result.trustScore, user);

  const updates: Partial<Doc<"users">> = {
    // Store BOTH
    trustScore: result.trustScore,
    trustStars: result.trustStars,
    trustScoreLastUpdated: Date.now(),
    trustTier: result.tier,
  };

  // AUTO-VERIFICATION: When score reaches 40
  if (featureEligibility.canVerifiedBadge && !user.verified) {
    updates.verified = true;
    updates.verifiedAt = Date.now();
    updates.verificationMethod = "trust_score_auto";

    const currentBadges = user.badges || [];
    if (!currentBadges.includes("verified")) {
      updates.badges = [...currentBadges, "verified"];
    }
  }

  // Track band creation milestone (score 70 for musicians)
  if (featureEligibility.canCreateBand && !user.bandCreationUnlockedAt) {
    updates.bandCreationUnlockedAt = Date.now();

    const currentBadges = user.badges || [];
    if (!currentBadges.includes("band_leader")) {
      updates.badges = [...currentBadges, "band_leader"];
    }
  }

  // Track video call milestone (score 65)
  if (featureEligibility.canVideoCall && !user.videoCallUnlockedAt) {
    updates.videoCallUnlockedAt = Date.now();
  }

  await ctx.db.patch(userId, updates);
  return result;
}

// ========== HELPER FUNCTIONS ==========
const TRUST_TIERS = {
  new: { minScore: 0, maxScore: 29 },
  basic: { minScore: 30, maxScore: 49 },
  verified: { minScore: 50, maxScore: 64 },
  trusted: { minScore: 65, maxScore: 79 },
  elite: { minScore: 80, maxScore: 100 },
} as const;

export function getTrustTier(score: number): TrustTier {
  if (score >= 90) return "elite";
  if (score >= 75) return "trusted";
  if (score >= 60) return "verified";
  if (score >= 40) return "basic";
  return "new";
}

export function checkProfileCompleteness(user: Doc<"users">): boolean {
  if (!user) return false;
  const basicComplete = !!(user?.firstname && user?.city && user?.phone);
  if (!basicComplete) return false;
  if (user?.isMusician) return !!user?.roleType;
  if (user?.isClient) return !!user?.clientType;
  if (user?.isBooker) return !!user?.bookerType;
  return true;
}

// Update the calculateRoleSpecificScore function to include all penalties:

async function calculateRoleSpecificScore(
  ctx: any,
  user: Doc<"users">
): Promise<number> {
  let score = 0;

  // ========== BASIC PROFILE (LOW WEIGHT - MAX 20 POINTS) ==========

  // Profile completion - LOW WEIGHT (max 25 points)
  if (user.onboardingComplete) score += 2; // Reduced from 5
  if (user.firstname) score += 2; // Reduced from 5
  if (user.city) score += 2; // Reduced from 5
  if (user.phone) score += 2; // Reduced from 5
  if (user.picture) score += 2; // Reduced from 5

  // Payment method - IMPORTANT (kept high)
  if (user.mpesaPhoneNumber) score += 15;

  // Account age - LOW WEIGHT
  const daysOld = (Date.now() - user._creationTime) / (1000 * 60 * 60 * 24);
  if (daysOld > 365)
    score += 5; // Reduced from 10
  else if (daysOld > 180)
    score += 3; // Reduced from 7
  else if (daysOld > 90)
    score += 2; // Reduced from 5
  else if (daysOld > 30)
    score += 1; // Reduced from 3
  else score += 0; // Reduced from 1

  // Recent activity - MEDIUM WEIGHT
  if (user.lastActive) {
    const daysSinceActive =
      (Date.now() - user.lastActive) / (1000 * 60 * 60 * 24);
    if (daysSinceActive < 1) score += 5;
    else if (daysSinceActive < 7)
      score += 3; // Reduced from 5
    else if (daysSinceActive < 30) score += 2; // Reduced from 3
  }

  // ========== CORE APP ACTIVITIES (HIGH WEIGHT) ==========

  if (user.isMusician) {
    // GIGS COMPLETED - HIGH WEIGHT (max 30 points)
    const completedGigs = user.completedGigsCount || 0;
    if (completedGigs >= 10) score += 30;
    else if (completedGigs >= 5) score += 20;
    else if (completedGigs >= 3) score += 15;
    else if (completedGigs >= 1) score += 10;
    else score += 0;

    // RATING - HIGH WEIGHT (max 15 points)
    if (user.avgRating) {
      if (user.avgRating >= 4.8) score += 15;
      else if (user.avgRating >= 4.5) score += 12;
      else if (user.avgRating >= 4.0) score += 8;
      else if (user.avgRating >= 3.5) score += 4;
      else if (user.avgRating > 0) score += 2;
    }

    // Profile details - MEDIUM WEIGHT
    if (user.talentbio) score += 3; // Reduced from 5
    if (user.musiciangenres?.length) score += 3; // Reduced from 5
    if (user.instrument) score += 3; // Reduced from 5

    // Performance stats - MEDIUM WEIGHT
    if (
      user.performanceStats?.responseTime &&
      user.performanceStats.responseTime < 24
    ) {
      score += 5;
    }
  } else if (user.isClient) {
    // GIG COMPLETION RATE - HIGH WEIGHT (max 25 points)
    if (user.gigsPosted && user.completedGigsCount && user.gigsPosted > 0) {
      const completionRate = user.completedGigsCount / user.gigsPosted;
      if (completionRate === 1)
        score += 25; // Increased from 20
      else if (completionRate >= 0.9)
        score += 20; // Increased from 15
      else if (completionRate >= 0.8)
        score += 15; // Increased from 15
      else if (completionRate >= 0.7)
        score += 10; // New tier
      else if (completionRate >= 0.6)
        score += 8; // Reduced from 10
      else if (completionRate >= 0.5)
        score += 5; // New tier
      else if (completionRate >= 0.4)
        score += 3; // Reduced from 5
      else if (completionRate >= 0.3)
        score += 2; // New tier
      else if (completionRate > 0) score += 1; // Reduced from 2
    }

    // CLIENT TYPE - MEDIUM WEIGHT
    if (user.clientType === "corporate_client")
      score += 8; // Reduced from 10
    else if (user.clientType === "venue_client")
      score += 6; // Reduced from 8
    else if (user.clientType === "event_planner_client")
      score += 5; // Reduced from 6
    else if (user.clientType === "individual_client") score += 3; // Reduced from 4

    // Organization - LOW WEIGHT
    if (user.organization) score += 3; // Reduced from 5

    // CLIENT RATING - HIGH WEIGHT (max 12 points)
    if (user.avgRating) {
      if (user.avgRating >= 4.9) score += 12;
      else if (user.avgRating >= 4.8) score += 10;
      else if (user.avgRating >= 4.5) score += 7;
      else if (user.avgRating >= 4.0) score += 4;
      else if (user.avgRating > 0) score += 2;
    }
  } else if (user.isBooker) {
    // Artists managed - HIGH WEIGHT
    const artistsCount = user.artistsManaged?.length || 0;
    if (artistsCount >= 10) score += 15;
    else if (artistsCount >= 5) score += 10;
    else if (artistsCount >= 3) score += 7;
    else if (artistsCount >= 1) score += 5;

    // Bands managed - HIGH WEIGHT
    const bandsCount = user.managedBands?.length || 0;
    if (bandsCount >= 5) score += 12;
    else if (bandsCount >= 3) score += 8;
    else if (bandsCount >= 1) score += 5;

    // Profile details - LOW WEIGHT
    if (user.bookerBio) score += 3; // Reduced from 5
    if (user.bookerSkills?.length) score += 3; // Reduced from 5
    if (user.agencyName) score += 3; // Reduced from 5
    if (user.companyName) score += 3; // Reduced from 5

    // Booking history - HIGH WEIGHT
    if (user.bookingHistory) {
      const successfulBookings = user.bookingHistory.filter(
        (b: any) => b.status === "completed"
      );
      if (successfulBookings.length >= 20) score += 15;
      else if (successfulBookings.length >= 10)
        score += 10; // Reduced from 10
      else if (successfulBookings.length >= 5)
        score += 7; // Reduced from 7
      else if (successfulBookings.length >= 3)
        score += 4; // Reduced from 4
      else if (successfulBookings.length > 0) score += 2; // Reduced from 2
    }
  }

  // ========== VIDEO CONTENT (NEW - HIGH WEIGHT) ==========

  // Check user's videos count and engagement
  // Check user's videos count and engagement
  if (user.clerkId) {
    const userVideos = await ctx.db
      .query("videos")
      .withIndex("by_userId", (q: any) => q.eq("userId", user.clerkId)) // Add :any type
      .collect();

    const videoCount = userVideos.length;
    const totalVideoLikes = userVideos.reduce(
      (sum: number, video: any) => sum + (video.likes || 0),
      0
    );
    const totalVideoViews = userVideos.reduce(
      (sum: number, video: any) => sum + (video.views || 0),
      0
    );

    // ... rest of your code
  }
  // ========== SOCIAL & REPUTATION ==========

  // Followers - MEDIUM WEIGHT
  const followerCount = user.followers?.length || 0;
  if (followerCount >= 100)
    score += 8; // Reduced from 10
  else if (followerCount >= 50)
    score += 5; // Reduced from 7
  else if (followerCount >= 20)
    score += 3; // Reduced from 4
  else if (followerCount >= 5) score += 1; // Reduced from 2

  // Subscription tier - MEDIUM WEIGHT
  if (user.tier === "elite")
    score += 10; // Reduced from 15
  else if (user.tier === "premium")
    score += 7; // Reduced from 10
  else if (user.tier === "pro")
    score += 5; // Same
  else if (user.tier === "free") score += 1; // Same

  // ========== PENALTIES ==========

  // Account status penalties
  if (user.isBanned) {
    score = 0;
    return score;
  }

  if (user.isSuspended) {
    score = Math.max(0, score - 30);
  }

  // Reports penalty
  const reportsPenalty = Math.min((user.reportsCount || 0) * 5, 30);
  score = Math.max(0, score - reportsPenalty);

  // Gig cancellation penalty - HIGHER FOR CORE ACTIVITY
  const cancelPenalty = Math.min((user.cancelgigCount || 0) * 5, 25); // Increased from 3
  score = Math.max(0, score - cancelPenalty);

  // Client spam penalty (only for clients)
  if (user.isClient && user.gigsPosted && user.completedGigsCount) {
    const spamRatio = user.gigsPosted / Math.max(user.completedGigsCount, 1);
    if (spamRatio > 5) {
      score = Math.max(0, score - 25); // Increased from 20
    } else if (spamRatio > 3) {
      score = Math.max(0, score - 15); // Increased from 10
    }
  }

  // Slow response penalty (for musicians)
  if (
    user.isMusician &&
    user.performanceStats?.responseTime &&
    user.performanceStats.responseTime > 72
  ) {
    score = Math.max(0, score - 8); // Increased from 5
  }

  // ========== FINAL BOUNDARIES ==========

  return Math.min(score, 100);
}
// ========== MUTATIONS ==========
export const updateUserTrustScore = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<TrustScoreResult> => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const result = await calculateTrustScore(ctx, args.userId);
    const featureEligibility = getFeatureEligibility(result.trustScore, user);

    const updates: Partial<Doc<"users">> = {
      trustScore: result.trustScore,
      trustStars: result.trustStars,
      trustScoreLastUpdated: Date.now(),
      trustTier: result.tier,
    };

    if (featureEligibility.canVerifiedBadge && !user.verified) {
      updates.verified = true;
      updates.verifiedAt = Date.now();
      updates.verificationMethod = "trust_score_auto";

      const currentBadges = user.badges || [];
      if (!currentBadges.includes("verified")) {
        updates.badges = [...currentBadges, "verified"];
      }
    }

    if (featureEligibility.canCreateBand && !user.bandCreationUnlockedAt) {
      updates.bandCreationUnlockedAt = Date.now();

      const currentBadges = user.badges || [];
      if (!currentBadges.includes("band_leader")) {
        updates.badges = [...currentBadges, "band_leader"];
      }
    }

    await ctx.db.patch(args.userId, updates);
    return result;
  },
});

export const triggerMyTrustScoreUpdate = mutation({
  args: { clerkId: v.string() }, // REQUIRED
  handler: async (ctx, args): Promise<TrustScoreResult> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");
    return await updateUserTrust(ctx, user._id);
  },
});

export const initializeUserTrustScore = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<InitializeResponse> => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    if (user.trustScore !== undefined && user.trustScore !== null) {
      return { success: false, message: "User already has trust score" };
    }

    const result = await calculateTrustScore(ctx, args.userId);
    const featureEligibility = getFeatureEligibility(result.trustScore, user);

    const updates: Partial<Doc<"users">> = {
      trustScore: result.trustScore,
      trustStars: result.trustStars,
      trustTier: result.tier,
      trustScoreLastUpdated: Date.now(),
    };

    if (featureEligibility.canVerifiedBadge && !user.verified) {
      updates.verified = true;
      updates.verifiedAt = Date.now();
      updates.verificationMethod = "trust_score_auto";
    }

    await ctx.db.patch(args.userId, updates);

    return {
      success: true,
      score: result.trustScore,
      tier: result.tier,
    };
  },
});

export const bulkInitializeTrustScores = mutation({
  args: {},
  handler: async (ctx): Promise<BulkInitializeResponse> => {
    const users = await ctx.db.query("users").collect();
    const results: BulkInitializeResult[] = [];

    for (const user of users) {
      try {
        if (user.trustScore === undefined || user.trustScore === null) {
          const scoreResult = await calculateTrustScore(ctx, user._id);
          const featureEligibility = getFeatureEligibility(
            scoreResult.trustScore,
            user
          );

          const updates: Partial<Doc<"users">> = {
            trustScore: scoreResult.trustScore,
            trustTier: scoreResult.tier,
            trustScoreLastUpdated: Date.now(),
          };

          if (featureEligibility.canVerifiedBadge && !user.verified) {
            updates.verified = true;
            updates.verifiedAt = Date.now();
            updates.verificationMethod = "trust_score_auto";
          }

          await ctx.db.patch(user._id, updates);

          results.push({
            userId: user._id,
            username: user.username,
            score: scoreResult.trustScore,
            tier: scoreResult.tier,
            success: true,
          });
        }
      } catch (error) {
        results.push({
          userId: user._id,
          username: user.username,
          error: error instanceof Error ? error.message : String(error),
          success: false,
        });
      }
    }

    return {
      processed: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  },
});

export const getTrustScore = query({
  args: {
    clerkId: v.string(), // REQUIRED: Use clerkId instead of identity
  },
  handler: async (ctx, args): Promise<TrustScoreData | null> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return null;

    // Calculate or get trust score
    if (user.trustScore === undefined || user.trustScore === null) {
      const calculated = await calculateTrustScore(ctx, user._id);
      return {
        trustScore: calculated.trustScore, // Use trustScore
        trustStars: calculated.trustStars, // Add this
        tier: calculated.tier,
        lastUpdated: Date.now(),
        isProfileComplete: calculated.isProfileComplete,
        userRole: calculated.role,
        roleSpecificData: {
          isMusician: user.isMusician,
          isClient: user.isClient,
          isBooker: user.isBooker ?? false,
          completedGigsCount: user.completedGigsCount || 0,
          gigsPosted: user.gigsPosted || 0,
          artistsManaged: user.artistsManaged?.length || 0,
          avgRating: user.avgRating || 0,
          earnings: user.earnings || 0,
          totalSpent: user.totalSpent || 0,
        },
        breakdown: calculated.breakdown,
        isCalculated: true,
        featureEligibility: getFeatureEligibility(calculated.trustScore, user),
      };
    }

    const trustScore = user.trustScore || 0;
    const trustStars = scoreToStars(trustScore); // Calculate stars
    const tier = getTrustTierFromScore(trustScore);
    const role: UserRole = user.isMusician
      ? "musician"
      : user.isClient
        ? "client"
        : user.isBooker
          ? "booker"
          : "unknown";

    return {
      trustScore,
      trustStars,
      tier,
      lastUpdated: user.trustScoreLastUpdated || Date.now(),
      isProfileComplete: checkProfileCompleteness(user),
      userRole: role,
      roleSpecificData: {
        isMusician: user.isMusician,
        isClient: user.isClient,
        isBooker: user.isBooker ?? false,
        completedGigsCount: user.completedGigsCount || 0,
        gigsPosted: user.gigsPosted || 0,
        artistsManaged: user.artistsManaged?.length || 0,
        avgRating: user.avgRating || 0,
        earnings: user.earnings || 0,
        totalSpent: user.totalSpent || 0,
      },
      breakdown: {
        profileComplete: checkProfileCompleteness(user),
        mpesaPhoneNumber: !!user.mpesaPhoneNumber,
        accountAgeDays: Math.floor(
          (Date.now() - user._creationTime) / (1000 * 60 * 60 * 24)
        ),
        completedGigs: user.completedGigsCount || 0,
        avgRating: user.avgRating || 0,
        followers: user.followers?.length || 0,
        tier: user.tier || "free",
        trustScore,
        trustStars,
      },
      featureEligibility: getFeatureEligibility(trustScore, user),
    };
  },
});

export const canUserAccessFeature = query({
  args: {
    clerkId: v.string(), // REQUIRED
    feature: v.union(
      v.literal("canCreateBand"),
      v.literal("canCompete"),
      v.literal("canBeDual"),
      v.literal("canVideoCall"), // ADD THIS
      v.literal("canPostPremiumGigs"),
      v.literal("canAccessAnalytics"),
      v.literal("canVerifiedBadge"),
      v.literal("canPostBasicGigs"),
      v.literal("canMessageUsers"),
      v.literal("canHireTeams"),
      v.literal("canVerifyOthers"),
      v.literal("canModerate"),
      v.literal("canBetaFeatures")
    ),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return false;

    const score = user.trustScore || 0;
    const featureEligibility = getFeatureEligibility(score, user);

    return featureEligibility[args.feature] || false;
  },
});
export const getUserFeatureEligibility = query({
  args: { clerkId: v.string() }, // REQUIRED
  handler: async (
    ctx,
    args
  ): Promise<ReturnType<typeof getFeatureEligibility>> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return getFeatureEligibility(0, {} as any);

    const score = user.trustScore || 0;
    return getFeatureEligibility(score, user);
  },
});

// UPDATED: getTrustImprovements now focuses on reaching feature thresholds
// UPDATED: getTrustImprovements now focuses on reaching feature thresholds
export const getTrustImprovements = query({
  args: { clerkId: v.string() }, // REQUIRED
  handler: async (ctx, args): Promise<ImprovementTip[]> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return [];

    const improvements: ImprovementTip[] = [];
    const currentScore = user.trustScore || 0;
    const currentStars = scoreToStars(currentScore); // Calculate stars
    const featureEligibility = getFeatureEligibility(currentScore, user);

    // Profile completeness improvements
    if (!user.firstname) {
      improvements.push({
        action: "Add first name",
        points: 10,
        category: "profile",
      });
    }
    if (!user.city) {
      improvements.push({
        action: "Add city",
        points: 10,
        category: "profile",
      });
    }
    if (!user.phone) {
      improvements.push({
        action: "Add phone number",
        points: 10,
        category: "profile",
      });
    }

    // Role-specific improvements
    if (user.isMusician) {
      if (!user.roleType) {
        improvements.push({
          action: "Set musician role",
          points: 10,
          category: "role",
        });
      }
      if ((user.completedGigsCount || 0) < 3) {
        improvements.push({
          action: `Complete ${3 - (user.completedGigsCount || 0)} more gigs`,
          points: 20,
          category: "experience",
          current: user.completedGigsCount || 0,
          max: 3,
        });
      }
      if (!user.talentbio) {
        improvements.push({
          action: "Add talent bio",
          points: 5,
          category: "profile",
        });
      }
    } else if (user.isClient) {
      if (!user.clientType) {
        improvements.push({
          action: "Specify client type",
          points: 10,
          category: "role",
        });
      }
      if ((user.gigsPosted || 0) < 2) {
        improvements.push({
          action: `Post ${2 - (user.gigsPosted || 0)} more gigs`,
          points: 15,
          category: "activity",
          current: user.gigsPosted || 0,
          max: 2,
        });
      }
    } else if (user.isBooker) {
      if (!user.bookerType) {
        improvements.push({
          action: "Specify booker type",
          points: 10,
          category: "role",
        });
      }
      if ((user.artistsManaged?.length || 0) < 3) {
        improvements.push({
          action: `Manage ${3 - (user.artistsManaged?.length || 0)} more artists`,
          points: 15,
          category: "experience",
          current: user.artistsManaged?.length || 0,
          max: 3,
        });
      }
    }

    // Feature threshold improvements - FIXED: Use FEATURE_SCORE_THRESHOLDS (0-100) not FEATURE_STAR_THRESHOLDS (1-5)
    if (!featureEligibility.canVerifiedBadge) {
      const pointsNeeded =
        FEATURE_SCORE_THRESHOLDS.canVerifiedBadge - currentScore;
      if (pointsNeeded > 0) {
        improvements.push({
          action: `Reach score ${FEATURE_SCORE_THRESHOLDS.canVerifiedBadge} for verification`,
          points: Math.ceil(pointsNeeded),
          category: "verification",
          current: currentScore,
          max: FEATURE_SCORE_THRESHOLDS.canVerifiedBadge,
        });
      }
    }

    if (user.isMusician && !featureEligibility.canCreateBand) {
      const pointsNeeded =
        FEATURE_SCORE_THRESHOLDS.canCreateBand - currentScore;
      if (pointsNeeded > 0) {
        improvements.push({
          action: `Reach score ${FEATURE_SCORE_THRESHOLDS.canCreateBand} to create bands`,
          points: Math.ceil(pointsNeeded),
          category: "features",
          current: currentScore,
          max: FEATURE_SCORE_THRESHOLDS.canCreateBand,
        });
      }
    }

    if (!featureEligibility.canCompete) {
      const pointsNeeded = FEATURE_SCORE_THRESHOLDS.canCompete - currentScore;
      if (pointsNeeded > 0) {
        improvements.push({
          action: `Reach score ${FEATURE_SCORE_THRESHOLDS.canCompete} to compete`,
          points: Math.ceil(pointsNeeded),
          category: "features",
          current: currentScore,
          max: FEATURE_SCORE_THRESHOLDS.canCompete,
        });
      }
    }

    if (!featureEligibility.canBeDual) {
      const pointsNeeded = FEATURE_SCORE_THRESHOLDS.canBeDual - currentScore;
      if (pointsNeeded > 0) {
        improvements.push({
          action: `Reach score ${FEATURE_SCORE_THRESHOLDS.canBeDual} for dual roles`,
          points: Math.ceil(pointsNeeded),
          category: "features",
          current: currentScore,
          max: FEATURE_SCORE_THRESHOLDS.canBeDual,
        });
      }
    }

    if (!featureEligibility.canVideoCall) {
      const pointsNeeded = FEATURE_SCORE_THRESHOLDS.canVideoCall - currentScore;
      if (pointsNeeded > 0) {
        improvements.push({
          action: `Reach score ${FEATURE_SCORE_THRESHOLDS.canVideoCall} for video calls`,
          points: Math.ceil(pointsNeeded),
          category: "features",
          current: currentScore,
          max: FEATURE_SCORE_THRESHOLDS.canVideoCall,
        });
      }
    }

    if (!featureEligibility.canPostPremiumGigs) {
      const pointsNeeded =
        FEATURE_SCORE_THRESHOLDS.canPostPremiumGigs - currentScore;
      if (pointsNeeded > 0) {
        improvements.push({
          action: `Reach score ${FEATURE_SCORE_THRESHOLDS.canPostPremiumGigs} for premium gigs`,
          points: Math.ceil(pointsNeeded),
          category: "features",
          current: currentScore,
          max: FEATURE_SCORE_THRESHOLDS.canPostPremiumGigs,
        });
      }
    }

    if (!featureEligibility.canAccessAnalytics) {
      const pointsNeeded =
        FEATURE_SCORE_THRESHOLDS.canAccessAnalytics - currentScore;
      if (pointsNeeded > 0) {
        improvements.push({
          action: `Reach score ${FEATURE_SCORE_THRESHOLDS.canAccessAnalytics} for analytics`,
          points: Math.ceil(pointsNeeded),
          category: "features",
          current: currentScore,
          max: FEATURE_SCORE_THRESHOLDS.canAccessAnalytics,
        });
      }
    }

    // Tier improvements
    const currentTier = getTrustTierFromScore(currentScore);

    if (currentTier === "new" && currentScore < 30) {
      improvements.push({
        action: `Reach 30 points for Basic tier`,
        points: 30 - currentScore,
        category: "tier",
        current: currentScore,
        max: 30,
      });
    }

    if (currentTier === "basic" && currentScore < 50) {
      improvements.push({
        action: `Reach 50 points for Verified tier`,
        points: 50 - currentScore,
        category: "tier",
        current: currentScore,
        max: 50,
      });
    }

    if (currentTier === "verified" && currentScore < 65) {
      improvements.push({
        action: `Reach 65 points for Trusted tier`,
        points: 65 - currentScore,
        category: "tier",
        current: currentScore,
        max: 65,
      });
    }

    if (currentTier === "trusted" && currentScore < 80) {
      improvements.push({
        action: `Reach 80 points for Elite tier`,
        points: 80 - currentScore,
        category: "tier",
        current: currentScore,
        max: 80,
      });
    }

    // Payment method - big points boost
    if (!user.mpesaPhoneNumber) {
      improvements.push({
        action: "Add M-Pesa payment method",
        points: 15,
        category: "verification",
      });
    }

    // Profile picture
    if (!user.picture) {
      improvements.push({
        action: "Add profile picture",
        points: 5,
        category: "profile",
      });
    }

    // Onboarding completion
    if (!user.onboardingComplete) {
      improvements.push({
        action: "Complete onboarding",
        points: 5,
        category: "profile",
      });
    }

    // Organization name for clients/bookers
    if (
      (user.isClient || user.isBooker) &&
      !user.organization &&
      !user.companyName
    ) {
      improvements.push({
        action: "Add organization/company name",
        points: 5,
        category: "profile",
      });
    }

    // Bio/description
    if (
      (user.isMusician && !user.talentbio) ||
      (user.isBooker && !user.bookerBio) ||
      (user.isClient && !user.talentbio)
    ) {
      improvements.push({
        action: "Add bio/description",
        points: 5,
        category: "profile",
      });
    }

    // Skills/genres for musicians
    if (user.isMusician && (!user.musiciangenres?.length || !user.instrument)) {
      improvements.push({
        action: "Add music genres and instrument",
        points: 10,
        category: "profile",
      });
    }

    // Skills for bookers
    if (user.isBooker && !user.bookerSkills?.length) {
      improvements.push({
        action: "Add booker skills",
        points: 5,
        category: "profile",
      });
    }

    // Followers boost
    if ((user.followers?.length || 0) < 5) {
      improvements.push({
        action: `Get ${5 - (user.followers?.length || 0)} more followers`,
        points: 2,
        category: "social",
        current: user.followers?.length || 0,
        max: 5,
      });
    }

    // Rating improvements
    if (user.avgRating && user.avgRating < 4.5) {
      if (user.isMusician && user.avgRating < 4.5) {
        improvements.push({
          action: `Improve rating to 4.5+`,
          points: 10,
          category: "performance",
          current: user.avgRating,
          max: 4.5,
        });
      }
      if (user.isClient && user.avgRating < 4.8) {
        improvements.push({
          action: `Improve rating to 4.8+`,
          points: 10,
          category: "performance",
          current: user.avgRating,
          max: 4.8,
        });
      }
    }

    return improvements.sort((a, b) => b.points - a.points);
  },
});

// UPDATED: getTrustLeaderboard - includes feature eligibility
export const getTrustLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
    role: v.optional(
      v.union(
        v.literal("musician"),
        v.literal("client"),
        v.literal("booker"),
        v.literal("all")
      )
    ),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .order("desc")
      .take(args.limit || 50);

    let filteredUsers = users.filter(
      (user) => user.trustScore && user.trustScore > 0
    );

    if (args.role && args.role !== "all") {
      filteredUsers = filteredUsers.filter((user) => {
        if (args.role === "musician") return user.isMusician;
        if (args.role === "client") return user.isClient;
        if (args.role === "booker") return user.isBooker;
        return true;
      });
    }

    return filteredUsers
      .map((user) => {
        const score = user.trustScore || 0;
        const featureEligibility = getFeatureEligibility(score, user);

        return {
          userId: user._id,
          name: user.firstname || user.username,
          score,
          tier: getTrustTier(score),
          role: user.isMusician
            ? "musician"
            : user.isClient
              ? "client"
              : user.isBooker
                ? "booker"
                : "unknown",
          city: user.city || "Unknown",
          completedGigs: user.completedGigsCount || 0,
          avgRating: user.avgRating || 0,
          earnings: user.earnings || 0,
          // Include some key feature eligibility
          features: {
            canCreateBand: featureEligibility.canCreateBand,
            canCompete: featureEligibility.canCompete,
            canBeDual: featureEligibility.canBeDual,
            isVerified: user.verified || false,
          },
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, args.limit || 10);
  },
});

// NEW: Get users eligible for a specific feature
export const getUsersEligibleForFeature = query({
  args: {
    feature: v.union(
      v.literal("canCreateBand"),
      v.literal("canCompete"),
      v.literal("canBeDual"),
      v.literal("canPostPremiumGigs")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .order("desc")
      .take(args.limit || 100);

    const threshold = FEATURE_STAR_THRESHOLDS[args.feature];

    return users
      .filter((user) => {
        const score = user.trustScore || 0;
        if (args.feature === "canCreateBand") {
          return user.isMusician && score >= threshold;
        }
        return score >= threshold;
      })
      .map((user) => ({
        userId: user._id,
        name: user.firstname || user.username,
        score: user.trustScore || 0,
        tier: getTrustTier(user.trustScore || 0),
        role: user.isMusician
          ? "musician"
          : user.isClient
            ? "client"
            : user.isBooker
              ? "booker"
              : "unknown",
      }))
      .slice(0, args.limit || 50);
  },
});
// NEW: Get next feature to unlock - FIXED to use score thresholds
export const getNextFeatureToUnlock = query({
  args: { clerkId: v.string() }, // REQUIRED
  handler: async (
    ctx,
    args
  ): Promise<{
    feature: string;
    threshold: number;
    currentScore: number;
    pointsNeeded: number;
  } | null> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return null;

    const currentScore = user.trustScore || 0;
    // Find the next feature threshold they haven't reached
    const featureEntries = Object.entries(FEATURE_SCORE_THRESHOLDS) as [
      // FIXED: Use SCORE thresholds
      keyof typeof FEATURE_SCORE_THRESHOLDS,
      number,
    ][];

    // Sort thresholds from lowest to highest
    const sortedFeatures = featureEntries.sort((a, b) => a[1] - b[1]);

    // Find the first threshold they haven't reached
    for (const [feature, threshold] of sortedFeatures) {
      if (currentScore < threshold) {
        // Special case: canCreateBand only applies to musicians
        if (feature === "canCreateBand" && !user.isMusician) {
          continue;
        }

        return {
          feature,
          threshold,
          currentScore,
          pointsNeeded: threshold - currentScore,
        };
      }
    }

    return null; // User has unlocked all features
  },
});
