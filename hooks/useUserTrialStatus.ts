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

      console.log("🔍 [USER TRIAL CALCULATION]:", {
        userId: user._id,
        userCreationTime: new Date(userCreationTime).toISOString(),
        trialEndTime: new Date(trialEndTime).toISOString(),
        currentTime: new Date(currentTime).toISOString(),
        daysRemaining: Math.ceil(
          (trialEndTime - currentTime) / (1000 * 60 * 60 * 24)
        ),
        isInTrial,
      });

      return isInTrial;
    },
    []
  );

  /**
   * Check if a user should be considered "active" (pro tier or in grace period)
   * This is the main validation function for filtering users
   */
  const isUserActive = useMemo(
    () => (user: User | null | undefined) => {
      if (!user) return false;

      // Exclude banned users
      if (user.isBanned === true) return false;

      // Include users who are either:
      // - Pro tier with active status, OR
      // - In grace period
      const isProActive = user.tier === "pro" && user.tierStatus === "active";
      const inGracePeriod = isUserInGracePeriod(user);

      return isProActive || inGracePeriod;
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
    getUserTrialDaysLeft,
    TRIAL_DURATION_DAYS,
  };
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
