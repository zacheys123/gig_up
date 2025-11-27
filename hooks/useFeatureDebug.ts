// hooks/useFeatureFlagDebug.ts
"use client";

import { FEATURE_FLAGS } from "@/lib/controlled_blocking_features";
import { useFeatureFlags } from "./useFeatureFlag";

export const useFeatureFlagDebug = (
  userId?: string,
  userRole?: string,
  userTier?: string
) => {
  const { isFeatureEnabled, getFeatureFlag, featureFlags, isLoading } =
    useFeatureFlags(userId);

  const debugFeature = (featureKey: keyof typeof FEATURE_FLAGS) => {
    if (isLoading) {
      console.log("📡 Feature flags still loading...");
      return;
    }

    const flag = getFeatureFlag(FEATURE_FLAGS[featureKey]);
    const isEnabled = isFeatureEnabled(
      FEATURE_FLAGS[featureKey],
      userRole,
      userTier
    );

    console.group(`🔍 Debug: ${featureKey}`);
    console.log("📋 Feature Config:", flag);
    console.log("👤 User Context:", { userId, userRole, userTier });
    console.log("🎯 Targeting:", {
      targetUsers: flag?.targetUsers,
      targetRoles: flag?.targetRoles,
      rolloutPercentage: flag?.rolloutPercentage,
    });
    console.log("✅ Final Result:", isEnabled);
    console.groupEnd();

    return {
      flag,
      isEnabled,
      userContext: { userId, userRole, userTier },
    };
  };

  const debugAllFeatures = () => {
    if (isLoading) {
      console.log("📡 Feature flags still loading...");
      return;
    }

    console.group("🎛️ ALL FEATURE FLAGS DEBUG");

    Object.entries(FEATURE_FLAGS).forEach(([key, featureKey]) => {
      const flag = getFeatureFlag(featureKey);
      const isEnabled = isFeatureEnabled(featureKey, userRole, userTier);

      console.group(`🔍 ${key}`);
      console.log("📋 Flag:", flag);
      console.log("👤 User:", { role: userRole, tier: userTier });
      console.log("🎯 Targeting:", {
        targetUsers: flag?.targetUsers,
        targetRoles: flag?.targetRoles,
        rollout: `${flag?.rolloutPercentage}%`,
      });
      console.log("✅ Enabled:", isEnabled);

      if (!isEnabled) {
        console.warn("❌ Reasons it might be disabled:");
        if (!flag?.enabled) console.warn("  - Flag not enabled globally");
        if (
          flag?.targetUsers &&
          flag.targetUsers !== "all" &&
          flag.targetUsers !== userTier
        )
          console.warn(
            `  - Tier mismatch: user is ${userTier}, required ${flag.targetUsers}`
          );
        if (
          flag?.targetRoles &&
          !flag.targetRoles.includes("all") &&
          userRole &&
          !flag.targetRoles.includes(userRole)
        )
          console.warn(
            `  - Role mismatch: user is ${userRole}, required one of ${flag.targetRoles.join(", ")}`
          );
        if (flag?.rolloutPercentage && flag.rolloutPercentage < 100)
          console.warn(`  - Rollout limited to ${flag.rolloutPercentage}%`);
      }

      console.groupEnd();
    });

    console.groupEnd();
  };

  return {
    debugFeature,
    debugAllFeatures,
    featureFlags,
    isLoading,
  };
};
