"use client";

import { useCurrentUser } from "./useCurrentUser";
import { useFeatureFlags } from "./useFeatureFlag";

export const useUserFeatureFlags = () => {
  const { user } = useCurrentUser();
  const baseFlags = useFeatureFlags(user?._id);

  // Auto-injects user context
  const isFeatureEnabled = (featureKey: string): boolean => {
    return baseFlags.isFeatureEnabled(
      featureKey,
      user?.roleType, // vocalist, teacher, etc.
      user?.tier || "free" // premium, pro, free
    );
  };

  return {
    ...baseFlags,
    isFeatureEnabled, // Override with user context
  };
};
