// convex/trustScore.ts - KEEP BOTH SYSTEMS
import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";
import {
  calculateTrustScore,
  checkProfileCompleteness,
  FEATURE_SCORE_THRESHOLDS,
  FEATURE_STAR_THRESHOLDS,
  getFeatureEligibility,
  getTrustTier,
  getTrustTierFromScore,
  scoreToStars,
  updateUserTrust,
} from "../trustHelper";

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
