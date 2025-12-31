// hooks/useTrustScore.ts - OPTIMIZED
"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-react";
import { useCallback, useMemo } from "react";
import {
  FeatureName,
  getFeatureThresholdsForRole,
} from "@/lib/trustScoreHelpers";
import { useCurrentUser } from "./useCurrentUser";

export function useTrustScore() {
  const { userId: clerkId } = useAuth();
  const { user } = useCurrentUser();

  // Memoize query args
  const trustArgs = useMemo(() => (clerkId ? { clerkId } : "skip"), [clerkId]);

  // Queries
  const trustData = useQuery(
    api.controllers.trustScore.getTrustScore,
    trustArgs
  );
  const allFeatures = useQuery(
    api.controllers.trustScore.getUserFeatureEligibility,
    trustArgs
  );
  const improvementsData = useQuery(
    api.controllers.trustScore.getImprovementTips,
    trustArgs
  );

  // Memoize core data
  const trustScore = useMemo(() => trustData?.trustScore || 0, [trustData]);
  const trustStars = useMemo(() => trustData?.trustStars || 0.5, [trustData]);
  const tier = useMemo(() => trustData?.tier || "new", [trustData]);
  const isProfileComplete = useMemo(
    () => trustData?.isProfileComplete || false,
    [trustData]
  );

  // Memoize feature access
  const canAccess = useMemo(() => {
    const featureMap = allFeatures || {};
    return (feature: FeatureName): boolean => featureMap[feature] || false;
  }, [allFeatures]);

  // Memoize role features
  const roleFeatures = useMemo(() => {
    if (!user) return [];

    const thresholds = getFeatureThresholdsForRole(user);
    return Object.entries(thresholds)
      .map(([key, score]) => ({
        name: key
          .replace("can", "")
          .replace(/([A-Z])/g, " $1")
          .trim(),
        key: key as FeatureName,
        score,
      }))
      .sort((a, b) => a.score - b.score);
  }, [user]);

  // Memoize next feature
  const nextFeature = useMemo(() => {
    if (!trustData || !allFeatures || !user) return null;

    const currentScore = trustScore;

    for (const feature of roleFeatures) {
      if (!allFeatures[feature.key] && currentScore < feature.score) {
        return {
          feature: feature.name,
          key: feature.key,
          threshold: feature.score,
          pointsNeeded: feature.score - currentScore,
        };
      }
    }

    return null;
  }, [trustData, allFeatures, user, trustScore, roleFeatures]);

  // Individual feature checks (memoized)
  const canPostBasicGigs = useMemo(
    () => canAccess("canPostBasicGigs"),
    [canAccess]
  );
  const canMessageUsers = useMemo(
    () => canAccess("canMessageUsers"),
    [canAccess]
  );
  const canVerifiedBadge = useMemo(
    () => canAccess("canVerifiedBadge"),
    [canAccess]
  );
  const canCompete = useMemo(() => canAccess("canCompete"), [canAccess]);
  const canAccessAnalytics = useMemo(
    () => canAccess("canAccessAnalytics"),
    [canAccess]
  );
  const canPostPremiumGigs = useMemo(
    () => canAccess("canPostPremiumGigs"),
    [canAccess]
  );
  const canBeDual = useMemo(() => canAccess("canBeDual"), [canAccess]);
  const canVideoCall = useMemo(() => canAccess("canVideoCall"), [canAccess]);
  const canCreateBand = useMemo(() => canAccess("canCreateBand"), [canAccess]);
  const canHireTeams = useMemo(() => canAccess("canHireTeams"), [canAccess]);
  const canVerifyOthers = useMemo(
    () => canAccess("canVerifyOthers"),
    [canAccess]
  );
  const canModerate = useMemo(() => canAccess("canModerate"), [canAccess]);
  const canBetaFeatures = useMemo(
    () => canAccess("canBetaFeatures"),
    [canAccess]
  );

  // Helper functions (memoized)
  const getScoreNeeded = useCallback(
    (feature: FeatureName): number => {
      if (!user) return 999;
      const thresholds = getFeatureThresholdsForRole(user);
      return thresholds[feature] || 999;
    },
    [user]
  );

  const getStarsNeeded = useCallback(
    (feature: FeatureName): number => {
      const score = getScoreNeeded(feature);
      if (score >= 90) return 5.0;
      if (score >= 80) return 4.5;
      if (score >= 70) return 4.0;
      if (score >= 60) return 3.5;
      if (score >= 50) return 3.0;
      if (score >= 40) return 2.5;
      if (score >= 30) return 2.0;
      if (score >= 20) return 1.5;
      if (score >= 10) return 1.0;
      return 0.5;
    },
    [getScoreNeeded]
  );

  const getRoleFeatures = useCallback(() => roleFeatures, [roleFeatures]);

  const result = useMemo(
    () => ({
      trustScore,
      trustStars,
      tier,
      isProfileComplete,
      breakdown: trustData?.breakdown,
      nextFeature,
      improvements: improvementsData || [],
      canAccess,
      getScoreNeeded,
      getStarsNeeded,
      getRoleFeatures,
      canPostBasicGigs,
      canMessageUsers,
      canVerifiedBadge,
      canCompete,
      canAccessAnalytics,
      canPostPremiumGigs,
      canBeDual,
      canVideoCall,
      canCreateBand,
      canHireTeams,
      canVerifyOthers,
      canModerate,
      canBetaFeatures,
    }),
    [
      trustScore,
      trustStars,
      tier,
      isProfileComplete,
      trustData?.breakdown,
      nextFeature,
      improvementsData,
      canAccess,
      getScoreNeeded,
      getStarsNeeded,
      getRoleFeatures,
      canPostBasicGigs,
      canMessageUsers,
      canVerifiedBadge,
      canCompete,
      canAccessAnalytics,
      canPostPremiumGigs,
      canBeDual,
      canVideoCall,
      canCreateBand,
      canHireTeams,
      canVerifyOthers,
      canModerate,
      canBetaFeatures,
    ]
  );

  return result;
}
