// lib/trustScoreHelpers.ts
// Updated with new scoring system

// Section caps from the new system
export const SECTION_CAPS = {
  PROFILE: 25,
  ACTIVITY: 40,
  QUALITY: 20,
  CONTENT: 15,
  SOCIAL: 10,
  LONGEVITY: 10,
  TOTAL_MAX: 100,
} as const;

// Updated scoring constants
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

// Calculate points for checklist items based on new system
export function calculateProfilePoints(user: any): number {
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

export function calculateLongevityPoints(user: any): number {
  let points = 0;

  // Account age
  const daysOld = user._creationTime
    ? (Date.now() - user._creationTime) / (1000 * 60 * 60 * 24)
    : 0;

  if (daysOld > 730) points += 5;
  else if (daysOld > 365) points += 4;
  else if (daysOld > 180) points += 3;
  else if (daysOld > 90) points += 2;
  else if (daysOld > 30) points += 1;

  // Recent activity
  if (user.lastActive) {
    const daysSinceActive =
      (Date.now() - user.lastActive) / (1000 * 60 * 60 * 24);
    if (daysSinceActive < 1) points += 3;
    else if (daysSinceActive < 7) points += 2;
    else if (daysSinceActive < 30) points += 1;
  }

  return Math.min(points, SECTION_CAPS.LONGEVITY);
}

export function calculateActivityPoints(user: any): number {
  let points = 0;

  if (user.isMusician) {
    const completedGigs = user.completedGigsCount || 0;
    points += Math.min(
      completedGigs * SCORING_CONSTANTS.GIGS_COMPLETED_PER_POINT,
      SCORING_CONSTANTS.GIGS_COMPLETED_MAX
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
        (b: any) => b.status === "completed"
      ).length;
      points += Math.min(successfulBookings * 0.5, 10);
    }
  }

  return Math.min(points, SECTION_CAPS.ACTIVITY);
}

export function calculateQualityPoints(user: any): number {
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

export function calculateContentPoints(
  user: any,
  videoCount: number = 0,
  videoLikes: number = 0,
  hasProfileVideo: boolean = false,
  gigVideoCount: number = 0
): number {
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
  if (videoCount >= 1) points += 2;
  if (videoCount >= 3) points += 2;
  if (videoCount >= 5) points += 1;

  if (videoLikes >= 5) points += 1;
  if (videoLikes >= 20) points += 1;
  if (videoLikes >= 50) points += 1;

  if (hasProfileVideo) points += SCORING_CONSTANTS.PROFILE_VIDEO;

  if (gigVideoCount >= 1) points += 1;
  if (gigVideoCount >= 3) points += 1;

  return Math.min(points, SECTION_CAPS.CONTENT);
}

export function calculateSocialPoints(user: any): number {
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

// Calculate penalties (negative points)
export function calculatePenalties(user: any): number {
  let penalty = 0;

  if (user.isBanned) return 100; // Max penalty

  if (user.isSuspended) penalty += 20;

  const reportsPenalty = Math.min((user.reportsCount || 0) * 3, 15);
  penalty += reportsPenalty;

  const cancelPenalty = Math.min((user.cancelgigCount || 0) * 2, 10);
  penalty += cancelPenalty;

  // Client spam
  if (user.isClient && user.gigsPosted && user.completedGigsCount) {
    const spamRatio = user.gigsPosted / Math.max(user.completedGigsCount, 1);
    if (spamRatio > 5) penalty += 10;
    else if (spamRatio > 3) penalty += 5;
  }

  // Slow responses for musicians
  if (
    user.isMusician &&
    user.performanceStats?.responseTime &&
    user.performanceStats.responseTime > 72
  ) {
    penalty += 5;
  }

  return penalty;
}

// Convert score to stars (0-100 to 0.5-5.0)
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

// Get trust tier from score
export function getTrustTierFromScore(score: number): string {
  if (score >= 80) return "elite";
  if (score >= 65) return "trusted";
  if (score >= 50) return "verified";
  if (score >= 30) return "basic";
  return "new";
}

// Check profile completeness
export function checkProfileCompleteness(user: any): boolean {
  if (!user) return false;
  const basicComplete = !!(user?.firstname && user?.city && user?.phone);
  if (!basicComplete) return false;
  if (user?.isMusician) return !!user?.roleType;
  if (user?.isClient) return !!user?.clientType;
  if (user?.isBooker) return !!user?.bookerType;
  return true;
}
// Feature eligibility thresholds for client-side
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
