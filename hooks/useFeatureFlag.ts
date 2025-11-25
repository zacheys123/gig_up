"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo, useCallback } from "react";

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
  const isFeatureEnabled = useCallback(
    (
      featureKey: string,
      userRole?: string,
      userTier: string = "free"
    ): boolean => {
      if (!featureFlags) return false;

      const flag = featureFlags.find((f) => f.id === featureKey);

      // Special handling for role registration flags
      if (["teacher_role", "booker_role", "both_role"].includes(featureKey)) {
        return flag ? flag.enabled && flag.rolloutPercentage > 0 : false;
      }

      // For all other flags, use full targeting logic
      if (!flag || !flag.enabled) return false;

      // 1. Check user tier targeting ← THIS IS THE KEY PART!
      if (flag.targetUsers && flag.targetUsers !== "all") {
        if (flag.targetUsers !== userTier) {
          return false; // User tier doesn't match requirement
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
    [featureFlags, userId]
  );

  const getFeatureFlag = useCallback(
    (featureKey: string) => {
      return featureFlags?.find((f) => f.id === featureKey);
    },
    [featureFlags]
  );

  // NEW: Get all available features for a user
  const getAvailableFeatures = useCallback(
    (userRole?: string, userTier?: string) => {
      if (!featureFlags) return [];

      return featureFlags.filter((flag) => {
        // Check if feature is enabled globally
        if (!flag.enabled) return false;

        // Check user tier targeting
        if (flag.targetUsers && flag.targetUsers !== "all") {
          if (flag.targetUsers !== userTier) {
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
    [featureFlags, userId]
  );

  // NEW: Get features by category
  const getFeaturesByCategory = useCallback(() => {
    if (!featureFlags) return {};

    return featureFlags.reduce(
      (acc, flag) => {
        const category = flag.id.includes("teacher")
          ? "teacher"
          : flag.id.includes("booker")
            ? "booker"
            : flag.id.includes("file")
              ? "file"
              : "general";

        if (!acc[category]) acc[category] = [];
        acc[category].push(flag);
        return acc;
      },
      {} as Record<string, typeof featureFlags>
    );
  }, [featureFlags]);

  // Memoized counts
  const enabledFlagsCount = useMemo(() => {
    return featureFlags?.filter((f) => f.enabled).length || 0;
  }, [featureFlags]);

  const isLoading = featureFlags === undefined;

  return {
    // Data
    featureFlags: featureFlags || [],
    isLoading,

    // Core functions
    isFeatureEnabled,
    getFeatureFlag,

    // NEW: Feature discovery functions
    getAvailableFeatures,
    getFeaturesByCategory,

    // Derived data
    enabledFlagsCount,
    totalFlagsCount: featureFlags?.length || 0,

    // Helper for enabled flags
    getEnabledFlags: useCallback(() => {
      return featureFlags?.filter((f) => f.enabled) || [];
    }, [featureFlags]),
  };
};
