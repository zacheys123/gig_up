// hooks/useUserTrialStatus.ts
"use client";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useMemo } from "react";
import { useCurrentUser } from "./useCurrentUser";
import { Doc } from "@/convex/_generated/dataModel";
import { useCheckTrial } from "./useCheckTrial";
import { getTrialDurationDays, getTrialDurationMs } from "@/lib/trial";

type User = Doc<"users">;

const TRIAL_DURATION_DAYS = getTrialDurationDays();
const TRIAL_DURATION_MS = getTrialDurationMs();
export const useUserTrialStatus = () => {
  const isUserInGracePeriod = useMemo(
    () => (user: User | null | undefined) => {
      if (!user?._creationTime) {
        console.log(
          "❌ [USER TRIAL] No user creation time found for user:",
          user?._id
        );
        return false;
      }
      const userCreationTime = user._creationTime;
      const trialEndTime = userCreationTime + TRIAL_DURATION_MS;
      const currentTime = Date.now();
      const isInTrial = currentTime < trialEndTime;

      return isInTrial;
    },
    []
  );

  /**
   * STRICT FILTER: Check if a user should be considered "active"
   * - Must be either:
   *   1. On paid tier (pro/premium/elite) with active status, OR
   *   2. Currently in grace period
   * Users with expired trials and no paid subscription are FILTERED OUT
   */
  const isUserActive = useMemo(
    () => (user: User | null | undefined) => {
      if (!user) return false;

      // Exclude banned users
      if (user.isBanned === true) return false;

      // Define valid paid tiers
      const validPaidTiers = ["pro", "premium", "elite", "paid"];
      const userTier = (user.tier || "free").toLowerCase();
      const tierStatus = (user.tierStatus || "inactive").toLowerCase();

      // Check if user is on a paid tier with active status
      const isPaidActive =
        validPaidTiers.includes(userTier) && tierStatus === "active";

      // Check if user is in grace period
      const inGracePeriod = isUserInGracePeriod(user);

      // User is active ONLY if they meet one of these conditions
      return isPaidActive || inGracePeriod;
    },
    [isUserInGracePeriod]
  );

  /**
   * Check if user should be filtered out (inverse of isUserActive)
   */
  const shouldFilterUserOut = useMemo(
    () => (user: User | null | undefined) => {
      return !isUserActive(user);
    },
    [isUserActive]
  );

  /**
   * Get user's tier status for display
   */
  const getUserTierStatus = useMemo(
    () => (user: User | null | undefined) => {
      if (!user) return { status: "unknown", isValid: false };

      const userTier = (user.tier || "free").toLowerCase();
      const tierStatus = (user.tierStatus || "inactive").toLowerCase();
      const inGracePeriod = isUserInGracePeriod(user);

      if (
        ["pro", "premium", "elite", "paid"].includes(userTier) &&
        tierStatus === "active"
      ) {
        return { status: `paid-${userTier}`, isValid: true };
      }

      if (inGracePeriod) {
        return { status: "grace-period", isValid: true };
      }

      return { status: "expired-free", isValid: false };
    },
    [isUserInGracePeriod]
  );

  /**
   * Get remaining trial days for any user
   */
  const getUserTrialDaysLeft = useMemo(
    () =>
      (user: User | null | undefined): number => {
        if (!user?._creationTime) return 0;

        const userCreationTime = user._creationTime;
        const trialEndTime = userCreationTime + TRIAL_DURATION_MS;
        const currentTime = Date.now();

        if (currentTime >= trialEndTime) return 0;

        const msInDay = 1000 * 60 * 60 * 24;
        const timeDiff = trialEndTime - currentTime;
        return Math.ceil(timeDiff / msInDay);
      },
    []
  );

  return {
    isUserInGracePeriod,
    isUserActive,
    shouldFilterUserOut,
    getUserTierStatus,
    getUserTrialDaysLeft,
    TRIAL_DURATION_DAYS,
  };
};

// Also update the lib/trial utility function:
// lib/trial.ts or trial-config.ts
export const isUserActive = (user: User | null | undefined): boolean => {
  if (!user) return false;
  if (user.isBanned === true) return false;

  const TRIAL_DURATION_MS = getTrialDurationMs();

  // Check grace period
  const inGracePeriod = user?._creationTime
    ? Date.now() < user._creationTime + TRIAL_DURATION_MS
    : false;

  // Check paid tiers
  const validPaidTiers = ["pro", "premium", "elite", "paid"];
  const userTier = (user.tier || "free").toLowerCase();
  const tierStatus = (user.tierStatus || "inactive").toLowerCase();

  const isPaidActive =
    validPaidTiers.includes(userTier) && tierStatus === "active";

  return isPaidActive || inGracePeriod;
};

export const getUserTrialStatus = (user: User | null | undefined) => {
  if (!user?._creationTime) {
    return {
      isInGracePeriod: false,
      daysLeft: 0,
      isActive: false,
    };
  }

  const userCreationTime = user._creationTime;
  const trialEndTime = userCreationTime + TRIAL_DURATION_MS;
  const currentTime = Date.now();
  const isInGracePeriod = currentTime < trialEndTime;

  const msInDay = 1000 * 60 * 60 * 24;
  const timeDiff = trialEndTime - currentTime;
  const daysLeft = Math.max(0, Math.ceil(timeDiff / msInDay));

  const isProActive = user.tier === "pro" && user.tierStatus === "active";
  const isActive = isProActive || isInGracePeriod;

  return {
    isInGracePeriod,
    daysLeft,
    isActive,
    trialEndTime: new Date(trialEndTime),
  };
};
