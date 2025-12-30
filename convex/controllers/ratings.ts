// convex/controllers/user.ts
import { Doc, Id } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { calculateTrustScore } from "../trustHelper";
export const getMultipleMusicianRatings = query({
  args: { userIds: v.array(v.id("users")) },
  handler: async (ctx, args) => {
    const ratings: Record<string, any> = {};

    // Fetch all users in one go
    const users = await Promise.all(
      args.userIds.map((userId) => ctx.db.get(userId))
    );

    // Calculate ratings in parallel
    const ratingPromises = users.map(async (user) => {
      if (!user || !user.isMusician) return null;

      const rating = calculateComprehensiveRating(user);
      return { userId: user._id, rating };
    });

    const results = await Promise.all(ratingPromises);

    // Convert to record format
    results.forEach((result) => {
      if (result && result.rating) {
        ratings[result.userId] = result.rating;
      }
    });

    return ratings;
  },
});

// convex/controllers/user.ts - Update getTrendingMusiciansWithRatings
export const getTrendingMusiciansWithRatings = query({
  handler: async (ctx) => {
    // Fetch musicians with their trust scores
    const musicians = await ctx.db
      .query("users")
      .withIndex("by_is_musician", (q) => q.eq("isMusician", true))
      .collect();

    // Get trust scores for all musicians
    const musiciansWithTrust = await Promise.all(
      musicians.map(async (user) => {
        try {
          // Use the trust scoring system
          const trustScore = await calculateTrustScore(ctx, user._id);
          const trendingScore = calculateTrendingScore(user, trustScore);

          return {
            ...user,
            trustScore: trustScore.trustScore,
            trustStars: trustScore.trustStars,
            trustTier: trustScore.tier,
            trendingScore,
          };
        } catch (error) {
          console.error(`Error calculating trust for user ${user._id}:`, error);
          return {
            ...user,
            trustScore: 0,
            trustStars: 0.5,
            trustTier: "new",
            trendingScore: 0,
          };
        }
      })
    );

    // Sort by trending score
    musiciansWithTrust.sort((a, b) => b.trendingScore - a.trendingScore);

    return musiciansWithTrust.slice(0, 20).map((u) => ({
      _id: u._id,
      clerkId: u.clerkId,
      username: u.username,
      firstname: u.firstname,
      lastname: u.lastname,
      picture: u.picture,
      completedGigsCount: u.completedGigsCount || 0,
      tier: u.tier,
      instrument: u.instrument,
      city: u.city,
      isMusician: u.isMusician,
      isBooker: u.isBooker,
      rating: {
        trustScore: u.trustScore,
        trustStars: u.trustStars,
        trustTier: u.trustTier,
      },
      followersCount: u.followers?.length || 0,
      trendingScore: u.trendingScore,
      // Include additional fields needed for trust calculation
      allreviews: u.allreviews || [],
      mpesaPhoneNumber: u.mpesaPhoneNumber,
      roleType: u.roleType,
      onboardingComplete: u.onboardingComplete || false,
      // Add trust fields directly
      trustScore: u.trustScore,
      trustStars: u.trustStars,
      trustTier: u.trustTier,
    }));
  },
});

// Updated trending score calculation using comprehensive rating
const calculateTrendingScore = (user: any, rating: any): number => {
  let score = 0;

  // Use the comprehensive rating as base (40%)
  score += (rating.overall || 0) * 8; // Convert 0-5 to 0-40

  // Gig experience (25%)
  score += (user.completedGigsCount || 0) * 2;

  // Social proof (20%)
  score += (user.followers?.length || 0) * 1.5;

  // Activity and recency (15%)
  const activityScore = calculateActivityScore(user);
  score += activityScore * 0.15;

  return Math.round(score);
};

export const getMusicianRating = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || !user.isMusician) return null;

    return calculateComprehensiveRating(user);
  },
});

// Reusable comprehensive rating calculator
const calculateComprehensiveRating = (user: any) => {
  const weights = {
    // Experience & Activity (40%)
    gigExperience: 0.2,
    activityRecency: 0.1,
    platformUsage: 0.1,

    // Quality & Reliability (35%)
    reviewQuality: 0.15,
    reliability: 0.1,
    tierStatus: 0.1,

    // Social Proof & Engagement (25%)
    socialProof: 0.15,
    deputyEngagement: 0.1,
  };

  let totalScore = 0;
  let maxPossibleScore = 0;

  // 1. GIG EXPERIENCE (20%)
  const gigScore = calculateGigExperienceScore(user);
  totalScore += gigScore * weights.gigExperience;
  maxPossibleScore += 100 * weights.gigExperience;

  // 2. ACTIVITY RECENCY (10%)
  const activityScore = calculateActivityScore(user);
  totalScore += activityScore * weights.activityRecency;
  maxPossibleScore += 100 * weights.activityRecency;

  // 3. PLATFORM USAGE (10%)
  const platformScore = calculatePlatformUsageScore(user);
  totalScore += platformScore * weights.platformUsage;
  maxPossibleScore += 100 * weights.platformUsage;

  // 4. REVIEW QUALITY (15%)
  const reviewScore = calculateReviewQualityScore(user);
  totalScore += reviewScore * weights.reviewQuality;
  maxPossibleScore += 100 * weights.reviewQuality;

  // 5. RELIABILITY (10%)
  const reliabilityScore = calculateReliabilityScore(user);
  totalScore += reliabilityScore * weights.reliability;
  maxPossibleScore += 100 * weights.reliability;

  // 6. TIER STATUS (10%)
  const tierScore = calculateTierScore(user);
  totalScore += tierScore * weights.tierStatus;
  maxPossibleScore += 100 * weights.tierStatus;

  // 7. SOCIAL PROOF (15%)
  const socialScore = calculateSocialProofScore(user);
  totalScore += socialScore * weights.socialProof;
  maxPossibleScore += 100 * weights.socialProof;

  // 8. DEPUTY ENGAGEMENT (10%)
  const deputyScore = calculateDeputyEngagementScore(user);
  totalScore += deputyScore * weights.deputyEngagement;
  maxPossibleScore += 100 * weights.deputyEngagement;

  const finalRating =
    maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 5 : 0;

  return {
    overall: Math.round(finalRating * 10) / 10, // 0-5 scale, 1 decimal
    score: Math.round(totalScore), // Raw score 0-100
    breakdown: {
      gigExperience: Math.round(gigScore),
      activityRecency: Math.round(activityScore),
      platformUsage: Math.round(platformScore),
      reviewQuality: Math.round(reviewScore),
      reliability: Math.round(reliabilityScore),
      tierStatus: Math.round(tierScore),
      socialProof: Math.round(socialScore),
      deputyEngagement: Math.round(deputyScore),
    },
    reviewCount: user.allreviews?.length || 0,
    lastUpdated: Date.now(),
  };
};

// Individual scoring functions
const calculateGigExperienceScore = (user: any): number => {
  const gigs = user.completedGigsCount || 0;

  if (gigs >= 50) return 100; // Veteran
  if (gigs >= 20) return 80; // Experienced
  if (gigs >= 10) return 60; // Intermediate
  if (gigs >= 5) return 40; // Beginner
  if (gigs >= 1) return 20; // New
  return 0; // No experience
};

const calculateActivityScore = (user: any): number => {
  const now = Date.now();
  const lastActive = user.lastActive || 0;
  const daysSinceActive = (now - lastActive) / (1000 * 60 * 60 * 24);

  if (daysSinceActive <= 1) return 100; // Active today
  if (daysSinceActive <= 7) return 80; // Active this week
  if (daysSinceActive <= 30) return 60; // Active this month
  if (daysSinceActive <= 90) return 30; // Active last 3 months
  return 0; // Inactive
};

const calculatePlatformUsageScore = (user: any): number => {
  let score = 0;

  // Profile completeness
  if (user.picture) score += 15;
  if (user.bio) score += 15;
  if (user.instrument || user.roleType) score += 10;
  if (user.city) score += 10;

  // Platform engagement
  if (user.likedVideos?.length > 0) score += 10;
  if (user.savedGigs?.length > 0) score += 10;
  if (user.followings?.length > 0) score += 10;
  if (user.onboardingComplete) score += 20;

  return Math.min(score, 100);
};

const calculateReviewQualityScore = (user: any): number => {
  const reviews = user.allreviews || [];
  if (reviews.length === 0) return 50; // Neutral score for no reviews

  const totalRating = reviews.reduce(
    (sum: number, review: { rating: number }) => sum + (review.rating || 0),
    0
  );
  const averageRating = totalRating / reviews.length;

  // Weighted by number of reviews
  const ratingScore = averageRating * 15; // Max 75 points
  const volumeBonus = Math.min(reviews.length * 2, 25); // Max 25 points

  return Math.min(ratingScore + volumeBonus, 100);
};

const calculateReliabilityScore = (user: any): number => {
  let score = 50; // Base score

  // Reliability score from performance
  if (user.reliabilityScore) {
    score += (user.reliabilityScore - 2.5) * 10; // Convert 0-5 to score
  }

  // Gig completion rate bonus
  const completed = user.completedGigsCount || 0;
  const canceled = user.cancelgigCount || 0;
  const total = completed + canceled;

  if (total > 0) {
    const completionRate = completed / total;
    if (completionRate >= 0.95) score += 20;
    else if (completionRate >= 0.85) score += 10;
    else if (completionRate < 0.7) score -= 10;
  }

  // Badge bonuses
  if (user.badges?.includes("reliable")) score += 15;
  if (user.badges?.includes("early_completion")) score += 10;

  return Math.max(0, Math.min(score, 100));
};

const calculateTierScore = (user: any): number => {
  switch (user.tier) {
    case "elite":
      return 100;
    case "premium":
      return 85;
    case "pro":
      return 70;
    case "free":
      return 50;
    default:
      return 50;
  }
};

const calculateSocialProofScore = (user: any): number => {
  const followers = user.followers?.length || 0;
  const followings = user.followings?.length || 0;

  // Follower-based scoring
  let score = 0;
  if (followers >= 1000) score = 100;
  else if (followers >= 500) score = 85;
  else if (followers >= 200) score = 70;
  else if (followers >= 100) score = 60;
  else if (followers >= 50) score = 50;
  else if (followers >= 10) score = 30;
  else score = 10;

  // Engagement ratio bonus
  if (followings > 0) {
    const ratio = followers / followings;
    if (ratio > 2) score += 10; // More followers than following
  }

  return Math.min(score, 100);
};

const calculateDeputyEngagementScore = (user: any): number => {
  const backupCount = user.backUpCount || 0;
  const deputyRelationships =
    user.backUpFor?.filter((rel: any) => rel.status === "accepted").length || 0;

  let score = 0;
  if (backupCount >= 10 || deputyRelationships >= 5) score = 100;
  else if (backupCount >= 5 || deputyRelationships >= 3) score = 75;
  else if (backupCount >= 2 || deputyRelationships >= 1) score = 50;
  else score = 20;

  return score;
};
