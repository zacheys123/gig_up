// ========== DUAL SYSTEM THRESHOLDS ==========

import { Doc, Id } from "./_generated/dataModel";
import {
  TrustScoreResult,
  TrustTier,
  UserRole,
} from "./controllers/trustScore";

// Section caps from the new system (copied here for Convex use)
export const SECTION_CAPS = {
  PROFILE: 25,
  ACTIVITY: 40,
  QUALITY: 20,
  CONTENT: 15,
  SOCIAL: 10,
  LONGEVITY: 10,
  TOTAL_MAX: 100,
} as const;

// Scoring constants (copied here for Convex use)
export const SCORING_CONSTANTS = {
  // Profile completion
  FIRSTNAME: 2,
  LASTNAME: 2,
  CITY: 2,
  PHONE: 2,
  PICTURE: 3,
  MPESA: 5,
  ONBOARDING: 2,
  ROLE_TYPE: 3,

  // Longevity
  ACCOUNT_AGE_MAX: 5,
  RECENT_ACTIVITY_MAX: 3,

  // Activity (Musician)
  GIGS_COMPLETED_PER_POINT: 1.5,
  GIGS_COMPLETED_MAX: 20,

  // Quality (Musician)
  RATING_4_8: 15,
  RATING_4_5: 10,
  RATING_4_0: 5,
  RATING_3_5: 2,
  RATING_MIN: 1,

  // Quality (Client)
  COMPLETION_RATE_100: 15,
  COMPLETION_RATE_90: 10,
  COMPLETION_RATE_80: 7,
  COMPLETION_RATE_70: 4,
  COMPLETION_RATE_60: 2,
  COMPLETION_RATE_MIN: 1,

  // Content
  BIO: 3,
  ORGANIZATION: 2,
  SKILLS: 2,
  INSTRUMENT: 1,
  VIDEO_PRESENCE: 2,
  VIDEO_ENGAGEMENT: 3,
  PROFILE_VIDEO: 2,
  GIG_VIDEO: 2,

  // Social
  FOLLOWERS_100: 4,
  FOLLOWERS_50: 2,
  FOLLOWERS_20: 1,
  FOLLOWERS_5: 1,

  TIER_ELITE: 5,
  TIER_PREMIUM: 3,
  TIER_PRO: 2,
  TIER_FREE: 1,
} as const;

// For calculations (0-100)
export const FEATURE_SCORE_THRESHOLDS = {
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
export const FEATURE_STAR_THRESHOLDS = {
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
// convex/trustHelper.ts - Update getFeatureEligibility function

// Add role-specific thresholds at the top:

export type FeatureName =
  | "canPostBasicGigs"
  | "canMessageUsers"
  | "canVerifiedBadge"
  | "canCompete"
  | "canAccessAnalytics"
  | "canPostPremiumGigs"
  | "canBeDual"
  | "canVideoCall"
  | "canCreateBand"
  | "canHireTeams"
  | "canVerifyOthers"
  | "canModerate"
  | "canBetaFeatures";

// Default thresholds (fallback)
const DEFAULT_THRESHOLDS: Record<FeatureName, number> = {
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
};

// Simple role threshold overrides
export const ROLE_THRESHOLD_OVERRIDES = {
  musician: {
    canPostBasicGigs: 10,
    canMessageUsers: 20,
    canVerifiedBadge: 40,
    canCompete: 45,
    canAccessAnalytics: 50,
    canPostPremiumGigs: 55,
    canBeDual: 60,
    canVideoCall: 65,
    canCreateBand: 70,
    canVerifyOthers: 75,
    canModerate: 80,
    canBetaFeatures: 85,
  },
  teacher: {
    canPostBasicGigs: 10,
    canMessageUsers: 15,
    canVerifiedBadge: 35,
    canAccessAnalytics: 45,
    canPostPremiumGigs: 50,
    canVideoCall: 55,
    canBeDual: 60,
    canCreateBand: 65,
    canBetaFeatures: 70,
    canModerate: 75,
  },
  client: {
    canPostBasicGigs: 10,
    canMessageUsers: 15,
    canVerifiedBadge: 30,
    canAccessAnalytics: 40,
    canPostPremiumGigs: 45,
    canBeDual: 50,
    canHireTeams: 55,
    canVideoCall: 60,
    canBetaFeatures: 70,
    canModerate: 75,
  },
  booker: {
    canMessageUsers: 10,
    canVerifiedBadge: 25,
    canHireTeams: 30,
    canAccessAnalytics: 35,
    canPostPremiumGigs: 40,
    canVideoCall: 45,
    canBetaFeatures: 50,
    canVerifyOthers: 55,
    canModerate: 60,
  },
};

// Get user role
function getUserRole(
  user: Doc<"users">,
): keyof typeof ROLE_THRESHOLD_OVERRIDES {
  if (user.isMusician) {
    return user.roleType === "teacher" ? "teacher" : "musician";
  }
  if (user.isClient) return "client";
  if (user.isBooker) return "booker";
  return "musician";
}

// Get threshold for a feature (role-specific)
function getFeatureThreshold(feature: FeatureName, user: Doc<"users">): number {
  const role = getUserRole(user);
  const roleThresholds = ROLE_THRESHOLD_OVERRIDES[role];

  // Return role-specific threshold if it exists, otherwise use default
  return (
    roleThresholds[feature as keyof typeof roleThresholds] ||
    DEFAULT_THRESHOLDS[feature]
  );
}

// Check if feature is available for role
function isFeatureAvailableForRole(
  feature: FeatureName,
  user: Doc<"users">,
): boolean {
  const role = getUserRole(user);
  const roleThresholds = ROLE_THRESHOLD_OVERRIDES[role];

  // Feature is available if it exists in role thresholds
  return feature in roleThresholds;
}

// SIMPLIFIED getFeatureEligibility function
export function getFeatureEligibility(score: number, user: Doc<"users">) {
  const result: Record<FeatureName, boolean> = {} as Record<
    FeatureName,
    boolean
  >;

  // Check each feature
  const features: FeatureName[] = [
    "canPostBasicGigs",
    "canMessageUsers",
    "canVerifiedBadge",
    "canCompete",
    "canAccessAnalytics",
    "canPostPremiumGigs",
    "canBeDual",
    "canVideoCall",
    "canCreateBand",
    "canHireTeams",
    "canVerifyOthers",
    "canModerate",
    "canBetaFeatures",
  ];

  for (const feature of features) {
    // Only check if feature is available for this role
    if (isFeatureAvailableForRole(feature, user)) {
      const threshold = getFeatureThreshold(feature, user);
      result[feature] = score >= threshold;
    } else {
      result[feature] = false; // Not available for this role
    }
  }

  return result;
}

// ========== HELPER FUNCTIONS (for Convex) ==========

// Calculate points for profile section
function calculateProfilePoints(user: Doc<"users">): number {
  let points = 0;
  if (user.firstname) points += SCORING_CONSTANTS.FIRSTNAME;
  if (user.lastname) points += SCORING_CONSTANTS.LASTNAME;
  if (user.city) points += SCORING_CONSTANTS.CITY;
  if (user.phone) points += SCORING_CONSTANTS.PHONE;
  if (user.picture) points += SCORING_CONSTANTS.PICTURE;
  if (user.mpesaPhoneNumber) points += SCORING_CONSTANTS.MPESA;
  if (user.onboardingComplete) points += SCORING_CONSTANTS.ONBOARDING;

  if (user.isMusician && user.roleType) points += SCORING_CONSTANTS.ROLE_TYPE;
  if (user.isClient && user.clientType) points += SCORING_CONSTANTS.ROLE_TYPE;
  if (user.isBooker && user.bookerType) points += SCORING_CONSTANTS.ROLE_TYPE;

  return Math.min(points, SECTION_CAPS.PROFILE);
}

// Calculate points for longevity section

// Calculate points for activity section
function calculateActivityPoints(user: Doc<"users">): number {
  let points = 0;

  if (user.isMusician) {
    const completedGigs = user.completedGigsCount || 0;
    points += Math.min(
      completedGigs * SCORING_CONSTANTS.GIGS_COMPLETED_PER_POINT,
      SCORING_CONSTANTS.GIGS_COMPLETED_MAX,
    );

    if (
      user.performanceStats?.responseTime &&
      user.performanceStats.responseTime < 24
    ) {
      points += 3;
    }
  } else if (user.isClient) {
    const gigsPosted = user.gigsPosted || 0;
    points += Math.min(gigsPosted * 0.5, 10);
  } else if (user.isBooker) {
    const artistsCount = user.artistsManaged?.length || 0;
    points += Math.min(artistsCount * 1, 10);

    const bandsCount = user.managedBands?.length || 0;
    points += Math.min(bandsCount * 1.5, 10);

    if (user.bookingHistory) {
      const successfulBookings = user.bookingHistory.filter(
        (b: any) => b.status === "completed",
      ).length;
      points += Math.min(successfulBookings * 0.5, 10);
    }
  }

  return Math.min(points, SECTION_CAPS.ACTIVITY);
}

// Calculate points for quality section
function calculateQualityPoints(user: Doc<"users">): number {
  let points = 0;

  if (user.isMusician) {
    if (user.avgRating) {
      if (user.avgRating >= 4.8) points += SCORING_CONSTANTS.RATING_4_8;
      else if (user.avgRating >= 4.5) points += SCORING_CONSTANTS.RATING_4_5;
      else if (user.avgRating >= 4.0) points += SCORING_CONSTANTS.RATING_4_0;
      else if (user.avgRating >= 3.5) points += SCORING_CONSTANTS.RATING_3_5;
      else if (user.avgRating > 0) points += SCORING_CONSTANTS.RATING_MIN;
    }
  } else if (user.isClient) {
    const gigsPosted = user.gigsPosted || 0;
    const completedGigs = user.completedGigsCount || 0;

    if (gigsPosted > 0) {
      const completionRate = completedGigs / gigsPosted;
      if (completionRate === 1) points += SCORING_CONSTANTS.COMPLETION_RATE_100;
      else if (completionRate >= 0.9)
        points += SCORING_CONSTANTS.COMPLETION_RATE_90;
      else if (completionRate >= 0.8)
        points += SCORING_CONSTANTS.COMPLETION_RATE_80;
      else if (completionRate >= 0.7)
        points += SCORING_CONSTANTS.COMPLETION_RATE_70;
      else if (completionRate >= 0.6)
        points += SCORING_CONSTANTS.COMPLETION_RATE_60;
      else if (completionRate > 0)
        points += SCORING_CONSTANTS.COMPLETION_RATE_MIN;
    }

    if (user.avgRating) {
      if (user.avgRating >= 4.9) points += 5;
      else if (user.avgRating >= 4.8) points += 3;
      else if (user.avgRating >= 4.5) points += 2;
      else if (user.avgRating >= 4.0) points += 1;
    }
  }

  return Math.min(points, SECTION_CAPS.QUALITY);
}

// Calculate points for content section
async function calculateContentPoints(
  ctx: any,
  user: Doc<"users">,
): Promise<number> {
  let points = 0;

  // Bio/description
  if (user.isMusician && user.talentbio) points += SCORING_CONSTANTS.BIO;
  if (user.isBooker && user.bookerBio) points += SCORING_CONSTANTS.BIO;
  if (user.isClient && (user.organization || user.companyName))
    points += SCORING_CONSTANTS.ORGANIZATION;

  // Skills/genres
  if (user.isMusician && user.musiciangenres?.length)
    points += SCORING_CONSTANTS.SKILLS;
  if (user.isMusician && user.instrument)
    points += SCORING_CONSTANTS.INSTRUMENT;
  if (user.isBooker && user.bookerSkills?.length)
    points += SCORING_CONSTANTS.SKILLS;

  // Video content
  if (user.clerkId) {
    try {
      const userVideos = await ctx.db
        .query("videos")
        .withIndex("by_userId", (q: any) => q.eq("userId", user.clerkId))
        .collect();

      const videoCount = userVideos.length;
      const totalVideoLikes = userVideos.reduce(
        (sum: number, video: any) => sum + (video.likes || 0),
        0,
      );

      // Video presence
      if (videoCount >= 1) points += 2;
      if (videoCount >= 3) points += 2;
      if (videoCount >= 5) points += 1;

      // Video engagement
      if (totalVideoLikes >= 5) points += 1;
      if (totalVideoLikes >= 20) points += 1;
      if (totalVideoLikes >= 50) points += 1;

      // Profile video
      const hasProfileVideo = userVideos.some(
        (video: any) => video.isProfileVideo,
      );
      if (hasProfileVideo) points += SCORING_CONSTANTS.PROFILE_VIDEO;

      // Gig videos
      const gigVideoCount = userVideos.filter(
        (video: any) =>
          video.videoType === "gig" || video.videoType === "promo",
      ).length;
      if (gigVideoCount >= 1) points += 1;
      if (gigVideoCount >= 3) points += 1;
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  }

  return Math.min(points, SECTION_CAPS.CONTENT);
}

// Calculate points for social section
function calculateSocialPoints(user: Doc<"users">): number {
  let points = 0;

  // Followers
  const followerCount = user.followers?.length || 0;
  if (followerCount >= 5) points += SCORING_CONSTANTS.FOLLOWERS_5;
  if (followerCount >= 20) points += SCORING_CONSTANTS.FOLLOWERS_20;
  if (followerCount >= 50) points += SCORING_CONSTANTS.FOLLOWERS_50;
  if (followerCount >= 100) points += SCORING_CONSTANTS.FOLLOWERS_100;

  // Subscription tier
  if (user.tier === "elite") points += SCORING_CONSTANTS.TIER_ELITE;
  else if (user.tier === "premium") points += SCORING_CONSTANTS.TIER_PREMIUM;
  else if (user.tier === "pro") points += SCORING_CONSTANTS.TIER_PRO;
  else if (user.tier === "free") points += SCORING_CONSTANTS.TIER_FREE;

  return Math.min(points, SECTION_CAPS.SOCIAL);
}

// Calculate penalties
// Calculate penalties based on user model
function calculatePenalties(user: Doc<"users">): number {
  let penalty = 0;

  // 1. ACCOUNT STATUS PENALTIES (Severe)
  if (user.isBanned) return 100; // Max penalty - banned users get 0 score
  if (user.isSuspended) penalty += 20;

  // 2. COMMUNITY REPORTS (Trust issues)
  const reportsPenalty = Math.min((user.reportsCount || 0) * 3, 15);
  penalty += reportsPenalty;

  // Additional penalty for reportedCount if available
  if (user.reportedCount) {
    penalty += Math.min(user.reportedCount * 2, 10);
  }

  // 3. GIG CANCELLATIONS (Reliability issues)
  const cancelPenalty = Math.min((user.cancelgigCount || 0) * 2, 10);
  penalty += cancelPenalty;

  // 4. NO-SHOWS (Critical reliability issue)
  if (user.noShowCount) {
    penalty += Math.min(user.noShowCount * 5, 20);
  }

  // 5. CLIENT SPAM (Low-quality posting)
  if (user.isClient && user.gigsPosted && user.completedGigsCount) {
    const spamRatio = user.gigsPosted / Math.max(user.completedGigsCount, 1);
    if (spamRatio > 5) penalty += 10;
    else if (spamRatio > 3) penalty += 5;
  }

  // 6. SLOW RESPONSES (Unprofessional for musicians)
  if (
    user.isMusician &&
    user.performanceStats?.responseTime &&
    user.performanceStats.responseTime > 72
  ) {
    penalty += 5;
  }

  // 7. PAYMENT ISSUES (Financial reliability)
  if (user.latePaymentsCount) {
    penalty += Math.min(user.latePaymentsCount * 3, 15);
  }

  // 8. DISPUTES (Conflict issues)
  if (user.disputesCount) {
    penalty += Math.min(user.disputesCount * 4, 12);
  }

  // 9. WARNINGS (Administrative issues)
  if (user.warningCount) {
    penalty += Math.min(user.warningCount * 2, 8);
  }

  // 10. LOW RATING PENALTY (Quality issues)
  if (user.avgRating && user.avgRating < 3.0) {
    const ratingPenalty = Math.floor((3.0 - user.avgRating) * 10);
    penalty += Math.min(ratingPenalty, 15);
  }

  // 11. LOW COMPLETION RATE (For clients)
  if (user.isClient && user.gigsPosted && user.completedGigsCount) {
    const completionRate =
      user.completedGigsCount / Math.max(user.gigsPosted, 1);
    if (completionRate < 0.5) {
      const completionPenalty = Math.floor((0.5 - completionRate) * 20);
      penalty += Math.min(completionPenalty, 10);
    }
  }

  // 13. SUSPENSION HISTORY
  if (user.suspensionReason) {
    penalty += 5; // Additional penalty for having suspension history
  }

  // 14. ACTION HISTORY PENALTY (Multiple offenses)
  if (user.actionHistory && user.actionHistory.length > 0) {
    const recentActions = user.actionHistory.filter(
      (action: any) => Date.now() - action.timestamp < 90 * 24 * 60 * 60 * 1000,
    ).length;
    penalty += Math.min(recentActions * 2, 8);
  }

  // 15. INACTIVITY PENALTY (if not recently active)
  if (user.lastActive) {
    const daysSinceActive =
      (Date.now() - user.lastActive) / (1000 * 60 * 60 * 24);
    if (daysSinceActive > 90)
      penalty += 5; // 3+ months inactive
    else if (daysSinceActive > 30) penalty += 2; // 1-3 months inactive
  }

  return penalty;
}

// Also update the calculateLongevityPoints function to avoid double-counting inactivity:
function calculateLongevityPoints(user: Doc<"users">): number {
  let points = 0;

  // Account age
  const daysOld = (Date.now() - user._creationTime) / (1000 * 60 * 60 * 24);
  if (daysOld > 730)
    points += 5; // 2+ years
  else if (daysOld > 365)
    points += 4; // 1-2 years
  else if (daysOld > 180)
    points += 3; // 6-12 months
  else if (daysOld > 90)
    points += 2; // 3-6 months
  else if (daysOld > 30) points += 1; // 1-3 months

  // Recent activity (REWARD for being active, but inactivity penalty is separate)
  if (user.lastActive) {
    const daysSinceActive =
      (Date.now() - user.lastActive) / (1000 * 60 * 60 * 24);
    if (daysSinceActive < 1)
      points += 3; // Active today
    else if (daysSinceActive < 7)
      points += 2; // Active this week
    else if (daysSinceActive < 30) points += 1; // Active this month
    // No points for inactive beyond 30 days - penalty handled separately
  }

  return Math.min(points, SECTION_CAPS.LONGEVITY);
}

// Check profile completeness
export function checkProfileCompleteness(user: Doc<"users">): boolean {
  if (!user) return false;
  const basicComplete = !!(user?.firstname && user?.city && user?.phone);
  if (!basicComplete) return false;
  if (user?.isMusician) return !!user?.roleType;
  if (user?.isClient) return !!user?.clientType;
  if (user?.isBooker) return !!user?.bookerType;
  return true;
}

// ========== MAIN CALCULATION FUNCTIONS ==========

export async function calculateRoleSpecificScore(
  ctx: any,
  user: Doc<"users">,
): Promise<number> {
  let totalScore = 0;
  let penalty = 0;

  // Calculate points for each section
  const profilePoints = calculateProfilePoints(user);
  const longevityPoints = calculateLongevityPoints(user);
  const activityPoints = calculateActivityPoints(user);
  const qualityPoints = calculateQualityPoints(user);
  const contentPoints = await calculateContentPoints(ctx, user);
  const socialPoints = calculateSocialPoints(user);

  // Calculate penalties
  penalty = calculatePenalties(user);

  // Sum all positive points
  totalScore =
    profilePoints +
    longevityPoints +
    activityPoints +
    qualityPoints +
    contentPoints +
    socialPoints;

  // Apply penalties (subtract from total)
  totalScore = Math.max(0, totalScore - penalty);

  // Ensure total doesn't exceed maximum
  totalScore = Math.min(totalScore, SECTION_CAPS.TOTAL_MAX);

  return totalScore;
}

export async function calculateUserTrust(
  ctx: any,
  userId: Id<"users">,
): Promise<TrustScoreResult> {
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("User not found");

  // Calculate score (0-100) using new section-based logic
  let trustScore = await calculateRoleSpecificScore(ctx, user);

  // Apply profile completeness multiplier
  const isProfileComplete = checkProfileCompleteness(user);
  const profileMultiplier = isProfileComplete ? 1.0 : 0.7;
  trustScore = Math.round(trustScore * profileMultiplier);

  // Ensure score is within bounds (10-100)
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
        (Date.now() - user._creationTime) / (1000 * 60 * 60 * 24),
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

export async function updateUserTrust(
  ctx: any,
  userId: Id<"users">,
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
// convex/helpers/trustScoreHelpers.ts (or wherever your updateUserTrust is)

// Helper function to apply trust score penalty/bonus
export const applyTrustScoreUpdate = async (
  ctx: any,
  userId: Id<"users">,
  penaltyAmount: number,
  reason: string,
  context: string,
): Promise<void> => {
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("User not found");

  // If penalty, also update cancellation count
  if (penaltyAmount < 0) {
    await ctx.db.patch(userId, {
      cancellationCount: (user.cancellationCount || 0) + 1,
      lastCancellation: Date.now(),
      updatedAt: Date.now(),
    });
  }

  // Now update the trust score using your existing function
  await updateUserTrust(ctx, userId);

  // Log the penalty/bonus in trust history
  const trustHistoryEntry = {
    timestamp: Date.now(),
    amount: penaltyAmount,
    reason,
    context,
  };

  await ctx.db.insert("trustScoreHistory", {
    userId,
    ...trustHistoryEntry,
  });
};
// ========== LEGACY COMPATIBILITY ==========
export async function calculateTrustScore(
  ctx: any,
  userId: Id<"users">,
): Promise<TrustScoreResult> {
  return calculateUserTrust(ctx, userId);
}

const TRUST_TIERS = {
  new: { minScore: 0, maxScore: 29 },
  basic: { minScore: 30, maxScore: 49 },
  verified: { minScore: 50, maxScore: 64 },
  trusted: { minScore: 65, maxScore: 79 },
  elite: { minScore: 80, maxScore: 100 },
} as const;

export function getTrustTier(score: number): TrustTier {
  return getTrustTierFromScore(score);
}
