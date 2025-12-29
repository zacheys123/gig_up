// hooks/useTrustScore.ts
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-react";
import { useState, useCallback } from "react";

// Define feature type based on your thresholds
type FeatureName =
  | "canCreateBand"
  | "canCompete"
  | "canBeDual"
  | "canVideoCall"
  | "canPostPremiumGigs"
  | "canAccessAnalytics"
  | "canVerifiedBadge"
  | "canPostBasicGigs"
  | "canMessageUsers"
  | "canHireTeams"
  | "canVerifyOthers"
  | "canModerate"
  | "canBetaFeatures";

export function useTrustScore() {
  const { userId: clerkId } = useAuth();
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);

  // Get trust score data - Now includes trustStars
  const trustData = useQuery(
    api.controllers.trustScore.getTrustScore,
    clerkId ? { clerkId } : "skip"
  );

  // Get all features
  const allFeatures = useQuery(
    api.controllers.trustScore.getUserFeatureEligibility,
    clerkId ? { clerkId } : "skip"
  );

  // Get improvements/tips
  const improvements = useQuery(
    api.controllers.trustScore.getTrustImprovements,
    clerkId ? { clerkId } : "skip"
  );

  // Get next feature to unlock
  const nextFeature = useQuery(
    api.controllers.trustScore.getNextFeatureToUnlock,
    clerkId ? { clerkId } : "skip"
  );

  // Type-safe canAccess
  const canAccess = useCallback(
    (feature: FeatureName): boolean => {
      if (!allFeatures) return false;
      return allFeatures[feature] || false;
    },
    [allFeatures]
  );

  // Get score needed for a feature
  const getScoreNeeded = useCallback((feature: FeatureName): number => {
    const thresholds: Record<FeatureName, number> = {
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
    return thresholds[feature];
  }, []);

  // Get star description
  const getStarDescription = useCallback((stars: number): string => {
    if (stars >= 4.5) return "Elite - Top-rated professional";
    if (stars >= 4.0) return "Trusted - Highly reliable";
    if (stars >= 3.0) return "Verified - Established member";
    if (stars >= 2.0) return "Basic - Active member";
    return "New - Getting started";
  }, []);

  return {
    // Core data - BOTH score and stars
    trustScore: trustData?.trustScore || 0, // 0-100 detailed score
    trustStars: trustData?.trustStars || 0.5, // 0.5-5.0 stars for display
    tier: trustData?.tier || "new",
    isProfileComplete: trustData?.isProfileComplete || false,
    breakdown: trustData?.breakdown,

    // Feature access (for convenience)
    canCreateBand: trustData?.featureEligibility?.canCreateBand || false,
    canCompete: trustData?.featureEligibility?.canCompete || false,
    canBeDual: trustData?.featureEligibility?.canBeDual || false,
    canVideoCall: trustData?.featureEligibility?.canVideoCall || false,
    canPostPremiumGigs:
      trustData?.featureEligibility?.canPostPremiumGigs || false,
    canAccessAnalytics:
      trustData?.featureEligibility?.canAccessAnalytics || false,
    canVerifiedBadge: trustData?.featureEligibility?.canVerifiedBadge || false,

    // Improvements data
    improvements: improvements || [],
    nextFeature: nextFeature || null,

    // Helper functions
    canAccess,
    getScoreNeeded,
    getStarDescription,

    // Star-specific helpers
    getStarsDescription: () => getStarDescription(trustData?.trustStars || 0.5),
    getStarsNeeded: (feature: FeatureName): number => {
      const starThresholds: Record<FeatureName, number> = {
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
      };
      return starThresholds[feature];
    },
  };
}
