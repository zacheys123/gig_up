// lib/utils/trial-config.ts
import { Doc } from "@/convex/_generated/dataModel";

type User = Doc<"users">;

// Configuration
export const getTrialDurationDays = (): number => {
  const envValue = process.env.NEXT_PUBLIC_TRIAL_DURATION;

  if (!envValue) {
    console.warn("NEXT_PUBLIC_TRIAL_DURATION not set, using default 7 days");
    return 7;
  }

  const days = parseInt(envValue);

  if (isNaN(days) || days <= 0) {
    console.warn(
      `Invalid NEXT_PUBLIC_TRIAL_DURATION: "${envValue}", using default 7 days`
    );
    return 7;
  }

  return days;
};

export const getTrialDurationMs = (): number => {
  return getTrialDurationDays() * 24 * 60 * 60 * 1000;
};

export interface TrialStatus {
  isInGracePeriod: boolean;
  daysLeft: number;
  isActive: boolean;
  trialEndTime: Date;
  isPro: boolean;
  hasTrialExpired: boolean;
  trialDurationDays: number;
}

/**
 * Comprehensive trial status utility function
 * Can be used anywhere in the app without hooks
 */
export const getUserTrialStatus = (
  user: User | null | undefined
): TrialStatus => {
  if (!user?._creationTime) {
    return {
      isInGracePeriod: false,
      daysLeft: 0,
      isActive: false,
      trialEndTime: new Date(),
      isPro: false,
      hasTrialExpired: true,
      trialDurationDays: getTrialDurationDays(),
    };
  }

  const TRIAL_DURATION_DAYS = getTrialDurationDays();
  const TRIAL_DURATION_MS = getTrialDurationMs();

  const userCreationTime = user._creationTime;
  const trialEndTime = userCreationTime + TRIAL_DURATION_MS;
  const currentTime = Date.now();
  const isInGracePeriod = currentTime < trialEndTime;

  const msInDay = 1000 * 60 * 60 * 24;
  const timeDiff = trialEndTime - currentTime;
  const daysLeft = Math.max(0, Math.ceil(timeDiff / msInDay));

  const isProActive = user.tier === "pro" && user.tierStatus === "active";
  const isActive = isProActive || isInGracePeriod;
  const hasTrialExpired = !isInGracePeriod && !isProActive;

  return {
    isInGracePeriod,
    daysLeft,
    isActive,
    trialEndTime: new Date(trialEndTime),
    isPro: user.tier === "pro",
    hasTrialExpired,
    trialDurationDays: TRIAL_DURATION_DAYS,
  };
};

/**
 * Check if user is active (pro or in trial) and not banned
 */
export const isUserActive = (user: User | null | undefined): boolean => {
  if (!user) return false;
  if (user.isBanned === true) return false;

  const trialStatus = getUserTrialStatus(user);
  return trialStatus.isActive;
};

/**
 * Get formatted trial information for display
 */
export const getTrialDisplayInfo = (user: User | null | undefined) => {
  const trialStatus = getUserTrialStatus(user);

  return {
    ...trialStatus,
    formattedEndDate: trialStatus.trialEndTime.toLocaleDateString(),
    statusText: trialStatus.isPro
      ? "Pro Plan"
      : trialStatus.isInGracePeriod
        ? `${trialStatus.daysLeft} days left`
        : "Trial Expired",
    isUrgent: trialStatus.daysLeft <= 3 && trialStatus.daysLeft > 0,
  };
};

/**
 * Check if user can perform action based on trial status
 */
export const canUserPerformAction = (
  user: User | null | undefined,
  action?: string
): boolean => {
  if (!user) return false;

  const trialStatus = getUserTrialStatus(user);

  // Banned users can't do anything
  if (user.isBanned) return false;

  // Pro users can do everything
  if (trialStatus.isPro) return true;

  // Trial users can do everything during trial
  if (trialStatus.isInGracePeriod) return true;

  // Expired trial users have limited access
  return false;
};

// Export constants for external use
export {
  getTrialDurationDays as TRIAL_DURATION_DAYS,
  getTrialDurationMs as TRIAL_DURATION_MS,
};
