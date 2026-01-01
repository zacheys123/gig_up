// hooks/useFeatureFlags.ts - OPTIMIZED
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo, useCallback } from "react";
import { FeatureFlagKey } from "@/lib/featureFlags";
import {
  FEATURE_FLAGS,
  FEATURE_GROUPS,
  FeatureGroup,
} from "@/lib/controlled_blocking_features";
import { useCheckTrial } from "./useCheckTrial";

// Simple consistent hashing for rollout (memoized)
const consistentRollout = (featureKey: string, userId?: string): number => {
  const seed = userId || Math.random().toString();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 100;
};

export const useFeatureFlags = (userId?: string) => {
  const featureFlags = useQuery(api.controllers.featureFlags.getFeatureFlags);
  const { isInGracePeriod } = useCheckTrial();

  // Memoize feature flags map for O(1) lookups
  const featureFlagsMap = useMemo(() => {
    if (!featureFlags) return new Map<string, any>();
    return new Map(featureFlags.map((f) => [f.id, f]));
  }, [featureFlags]);

  // Core feature check with caching
  const isFeatureEnabled = useCallback(
    (
      featureKey: FeatureFlagKey,
      userRole?: string,
      userTier: string = "free"
    ): boolean => {
      const flag = featureFlagsMap.get(featureKey);
      if (!flag || !flag.enabled) return false;

      // Special handling for role registration flags
      if (FEATURE_GROUPS.ROLE_REGISTRATION.includes(featureKey)) {
        return flag.rolloutPercentage > 0;
      }

      // Apply grace period override
      const effectiveTier = isInGracePeriod ? "pro" : userTier;

      // Tier targeting
      if (flag.targetUsers && flag.targetUsers !== "all") {
        if (flag.targetUsers !== effectiveTier) return false;
      }

      // Role targeting
      if (flag.targetRoles && flag.targetRoles.length > 0 && userRole) {
        if (
          !flag.targetRoles.includes("all") &&
          !flag.targetRoles.includes(userRole)
        ) {
          return false;
        }
      }

      // Rollout percentage
      if (flag.rolloutPercentage < 100) {
        const rolloutValue = consistentRollout(featureKey, userId);
        return rolloutValue < flag.rolloutPercentage;
      }

      return true;
    },
    [featureFlagsMap, userId, isInGracePeriod]
  );

  // Memoized helper functions
  const getFeatureFlag = useCallback(
    (featureKey: FeatureFlagKey) => {
      return featureFlagsMap.get(featureKey);
    },
    [featureFlagsMap]
  );

  const getAvailableFeatures = useCallback(
    (userRole?: string, userTier?: string) => {
      return Array.from(featureFlagsMap.values()).filter((flag) =>
        isFeatureEnabled(flag.id as FeatureFlagKey, userRole, userTier)
      );
    },
    [featureFlagsMap, isFeatureEnabled]
  );

  const getFeaturesByGroup = useCallback(
    (group: FeatureGroup, userRole?: string, userTier?: string) => {
      return FEATURE_GROUPS[group].filter((featureKey) =>
        isFeatureEnabled(featureKey, userRole, userTier)
      );
    },
    [isFeatureEnabled]
  );

  const isFeatureGroupEnabled = useCallback(
    (group: FeatureGroup, userRole?: string, userTier?: string) => {
      return getFeaturesByGroup(group, userRole, userTier).length > 0;
    },
    [getFeaturesByGroup]
  );

  // Pre-defined flag checks (memoized)
  const isTeacherEnabled = useMemo(
    () => (userRole?: string, userTier?: string) =>
      isFeatureEnabled(FEATURE_FLAGS.TEACHER_ROLE, userRole, userTier),
    [isFeatureEnabled]
  );

  const isBookerEnabled = useMemo(
    () => (userRole?: string, userTier?: string) =>
      isFeatureEnabled(FEATURE_FLAGS.BOOKER_ROLE, userRole, userTier),
    [isFeatureEnabled]
  );

  const isBothEnabled = useMemo(
    () => (userRole?: string, userTier?: string) =>
      isFeatureEnabled(FEATURE_FLAGS.BOTH_ROLE, userRole, userTier),
    [isFeatureEnabled]
  );

  const isNormalGigCreationEnabled = useMemo(
    () => (userRole?: string, userTier?: string) =>
      isFeatureEnabled(FEATURE_FLAGS.NORMAL_GIG_CREATION, userRole, userTier),
    [isFeatureEnabled]
  );

  const isScratchCreationEnabled = useMemo(
    () => (userRole?: string, userTier?: string) =>
      isFeatureEnabled(FEATURE_FLAGS.SCRATCH_CREATION, userRole, userTier),
    [isFeatureEnabled]
  );

  const isAICreationEnabled = useMemo(
    () => (userRole?: string, userTier?: string) =>
      isFeatureEnabled(FEATURE_FLAGS.AI_CREATION, userRole, userTier),
    [isFeatureEnabled]
  );

  const isDeputyCreationEnabled = useMemo(
    () => (userRole?: string, userTier?: string) =>
      isFeatureEnabled(FEATURE_FLAGS.DEPUTY_CREATION, userRole, userTier),
    [isFeatureEnabled]
  );

  // Derived data
  const enabledFlagsCount = useMemo(
    () => Array.from(featureFlagsMap.values()).filter((f) => f.enabled).length,
    [featureFlagsMap]
  );

  const result = useMemo(
    () => ({
      featureFlags: Array.from(featureFlagsMap.values()),
      isLoading: featureFlags === undefined,
      isInGracePeriod,
      isFeatureEnabled,
      getFeatureFlag,
      getAvailableFeatures,
      getFeaturesByGroup,
      isFeatureGroupEnabled,
      enabledFlagsCount,
      totalFlagsCount: featureFlagsMap.size,
      getEnabledFlags: () =>
        Array.from(featureFlagsMap.values()).filter((f) => f.enabled),
      isTeacherEnabled,
      isBookerEnabled,
      isBothEnabled,
      isNormalGigCreationEnabled,
      isScratchCreationEnabled,
      isAICreationEnabled,
      isDeputyCreationEnabled,
    }),
    [
      featureFlagsMap,
      featureFlags,
      isInGracePeriod,
      isFeatureEnabled,
      getFeatureFlag,
      getAvailableFeatures,
      getFeaturesByGroup,
      isFeatureGroupEnabled,
      enabledFlagsCount,
      isTeacherEnabled,
      isBookerEnabled,
      isBothEnabled,
      isNormalGigCreationEnabled,
      isScratchCreationEnabled,
      isAICreationEnabled,
      isDeputyCreationEnabled,
    ]
  );

  return result;
};
