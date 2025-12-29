// Client-side safe trust score utilities
export function checkProfileCompleteness(user: any): boolean {
  if (!user) return false;
  const basicComplete = !!(user?.firstname && user?.city && user?.phone);
  if (!basicComplete) return false;
  if (user?.isMusician) return !!user?.roleType;
  if (user?.isClient) return !!user?.clientType;
  if (user?.isBooker) return !!user?.bookerType;
  return true;
}

export function scoreToStars(score: number): number {
  const normalized = Math.min(Math.max(score, 0), 100);

  if (normalized >= 90) return 5.0;
  if (normalized >= 80) return 4.5;
  if (normalized >= 70) return 4.0;
  if (normalized >= 60) return 3.5;
  if (normalized >= 50) return 3.0;
  if (normalized >= 40) return 2.5;
  if (normalized >= 30) return 2.0;
  if (normalized >= 20) return 1.5;
  if (normalized >= 10) return 1.0;
  return 0.5;
}

// Client-side trust tier calculation
export function getTrustTierFromScore(score: number): string {
  if (score >= 80) return "elite";
  if (score >= 65) return "trusted";
  if (score >= 50) return "verified";
  if (score >= 30) return "basic";
  return "new";
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
