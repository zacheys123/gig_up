// hooks/useFeatureFlags.ts
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

// Simple consistent hashing for rollout
const getConsistentRollout = (featureKey: string, userId?: string): number => {
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

  const isFeatureEnabled = useCallback(
    (
      featureKey: FeatureFlagKey,
      userRole?: string,
      userTier: string = "free"
    ): boolean => {
      if (!featureFlags) return false;

      const flag = featureFlags.find((f) => f.id === featureKey);

      // Special handling for role registration flags
      if (FEATURE_GROUPS.ROLE_REGISTRATION.includes(featureKey)) {
        return flag ? flag.enabled && flag.rolloutPercentage > 0 : false;
      }

      // For all other flags, use full targeting logic
      if (!flag || !flag.enabled) return false;

      // GRACE PERIOD OVERRIDE: If user is in grace period, treat them as premium for tier checks
      const effectiveTier = isInGracePeriod ? "pro" : userTier;

      // 1. Check user tier targeting (with grace period override)
      if (flag.targetUsers && flag.targetUsers !== "all") {
        if (flag.targetUsers !== effectiveTier) {
          return false;
        }
      }

      // 2. Check user role targeting
      if (flag.targetRoles && flag.targetRoles.length > 0 && userRole) {
        if (
          !flag.targetRoles.includes("all") &&
          !flag.targetRoles.includes(userRole)
        ) {
          return false;
        }
      }

      // 3. Check rollout percentage
      if (flag.rolloutPercentage < 100) {
        const userRollout = getConsistentRollout(featureKey, userId);
        return userRollout < flag.rolloutPercentage;
      }

      return true;
    },
    [featureFlags, userId, isInGracePeriod]
  );

  const getFeatureFlag = useCallback(
    (featureKey: FeatureFlagKey) => {
      return featureFlags?.find((f) => f.id === featureKey);
    },
    [featureFlags]
  );

  // Get all available features for a user
  const getAvailableFeatures = useCallback(
    (userRole?: string, userTier?: string) => {
      if (!featureFlags) return [];

      return featureFlags.filter((flag) => {
        // Check if feature is enabled globally
        if (!flag.enabled) return false;

        // Apply grace period override for tier checks
        const effectiveTier = isInGracePeriod ? "pro" : userTier;

        // Check user tier targeting
        if (flag.targetUsers && flag.targetUsers !== "all") {
          if (flag.targetUsers !== effectiveTier) {
            return false;
          }
        }

        // Check user role targeting
        if (flag.targetRoles && flag.targetRoles.length > 0 && userRole) {
          if (
            !flag.targetRoles.includes("all") &&
            !flag.targetRoles.includes(userRole)
          ) {
            return false;
          }
        }

        // Check rollout percentage
        if (flag.rolloutPercentage < 100) {
          const userRollout = getConsistentRollout(flag.id, userId);
          return userRollout < flag.rolloutPercentage;
        }

        return true;
      });
    },
    [featureFlags, userId, isInGracePeriod]
  );

  // Get features by group
  const getFeaturesByGroup = useCallback(
    (group: FeatureGroup, userRole?: string, userTier?: string) => {
      const groupFeatures = FEATURE_GROUPS[group];
      return groupFeatures.filter((featureKey) =>
        isFeatureEnabled(featureKey, userRole, userTier)
      );
    },
    [isFeatureEnabled]
  );

  // Check if entire feature group is available
  const isFeatureGroupEnabled = useCallback(
    (group: FeatureGroup, userRole?: string, userTier?: string) => {
      const enabledFeatures = getFeaturesByGroup(group, userRole, userTier);
      return enabledFeatures.length > 0;
    },
    [getFeaturesByGroup]
  );

  // Memoized counts
  const enabledFlagsCount = useMemo(() => {
    return featureFlags?.filter((f) => f.enabled).length || 0;
  }, [featureFlags]);

  const isLoading = featureFlags === undefined;

  return {
    // Data
    featureFlags: featureFlags || [],
    isLoading,
    isInGracePeriod, // Expose grace period status

    // Core functions
    isFeatureEnabled,
    getFeatureFlag,

    // Feature discovery functions
    getAvailableFeatures,
    getFeaturesByGroup,
    isFeatureGroupEnabled,

    // Derived data
    enabledFlagsCount,
    totalFlagsCount: featureFlags?.length || 0,

    // Helper for enabled flags
    getEnabledFlags: useCallback(() => {
      return featureFlags?.filter((f) => f.enabled) || [];
    }, [featureFlags]),

    // Pre-defined flag checks (for convenience)
    isTeacherEnabled: useCallback(
      (userRole?: string, userTier?: string) =>
        isFeatureEnabled(FEATURE_FLAGS.TEACHER_ROLE, userRole, userTier),
      [isFeatureEnabled]
    ),
    isBookerEnabled: useCallback(
      (userRole?: string, userTier?: string) =>
        isFeatureEnabled(FEATURE_FLAGS.BOOKER_ROLE, userRole, userTier),
      [isFeatureEnabled]
    ),
    isBothEnabled: useCallback(
      (userRole?: string, userTier?: string) =>
        isFeatureEnabled(FEATURE_FLAGS.BOTH_ROLE, userRole, userTier),
      [isFeatureEnabled]
    ),
    isNormalGigCreationEnabled: useCallback(
      (userRole?: string, userTier?: string) =>
        isFeatureEnabled(FEATURE_FLAGS.NORMAL_GIG_CREATION, userRole, userTier),
      [isFeatureEnabled]
    ),
    isScratchCreationEnabled: useCallback(
      (userRole?: string, userTier?: string) =>
        isFeatureEnabled(FEATURE_FLAGS.SCRATCH_CREATION, userRole, userTier),
      [isFeatureEnabled]
    ),
    isAICreationEnabled: useCallback(
      (userRole?: string, userTier?: string) =>
        isFeatureEnabled(FEATURE_FLAGS.AI_CREATION, userRole, userTier),
      [isFeatureEnabled]
    ),

    isDeputyCreationEnabled: useCallback(
      (userRole?: string, userTier?: string) =>
        isFeatureEnabled(FEATURE_FLAGS.DEPUTY_CREATION, userRole, userTier),
      [isFeatureEnabled]
    ),
  };
};
