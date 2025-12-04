// convex/notificationHelpers.ts
import { v } from "convex/values";

// Constants
const TRIAL_DURATION_MS = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds

/**
 * Check if a user can send or receive notifications
 * Users must be either Pro tier OR in grace period
 */
export const canUserSendOrReceiveNotifications = (user: any): boolean => {
  if (!user || !user.tier || !user._creationTime) {
    return false;
  }

  const isProPremiumElite = ["pro", "premium", "elite"].includes(user.tier);

  // If user is Pro/Premium/Elite, they can always send/receive
  if (isProPremiumElite) {
    return true;
  }

  // Free users: check grace period
  const creationTime = user._creationTime;
  const trialEndTime = creationTime + TRIAL_DURATION_MS;
  const isInGracePeriod = Date.now() < trialEndTime;

  return isInGracePeriod;
};

/**
 * Get detailed user notification status for debugging
 */
export const getUserNotificationStatus = (user: any) => {
  if (!user || !user.tier || !user._creationTime) {
    return { canSendReceive: false, error: "Missing user data" };
  }

  const isPro = user.tier === "pro";
  const creationTime = user._creationTime;
  const trialEndTime = creationTime + TRIAL_DURATION_MS;
  const currentTime = Date.now();
  const isInGracePeriod = currentTime < trialEndTime;
  const canSendReceive = isPro || isInGracePeriod;

  return {
    username: user.username,
    tier: user.tier,
    isPro,
    creationTime: new Date(creationTime).toISOString(),
    trialEndTime: new Date(trialEndTime).toISOString(),
    currentTime: new Date(currentTime).toISOString(),
    isInGracePeriod,
    canSendReceive,
    daysLeftInTrial: isInGracePeriod
      ? Math.ceil((trialEndTime - currentTime) / (1000 * 60 * 60 * 24))
      : 0,
  };
};
