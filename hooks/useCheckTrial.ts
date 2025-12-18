// hooks/useCheckTrial.ts - Enhanced version
"use client";
import { useEffect, useState, useMemo } from "react";
import { useSubscriptionStore } from "@/app/stores/useSubscriptionStore";
import { useUserStore } from "@/app/stores";
import { getTrialDurationDays, getTrialDurationMs } from "@/lib/trial";

const TRIAL_DURATION_DAYS = getTrialDurationDays();
const TRIAL_DURATION_MS = getTrialDurationMs();

export const useCheckTrial = () => {
  const { setShowTrialModal, setTrialRemainingDays } = useSubscriptionStore();
  const { user } = useUserStore();
  const [isFirstMonthEnd, setIsFirstMonthEnd] = useState<boolean>(false);
  const [daysLeft, setDaysLeft] = useState<number>(0);

  // Calculate isInGracePeriod based on user creation time
  const isInGracePeriod = useMemo(() => {
    if (!user?._creationTime) {
      console.log("❌ [TRIAL] No user creation time found");
      return false;
    }

    const userCreationTime = user._creationTime;
    const trialEndTime = userCreationTime + TRIAL_DURATION_MS;
    const currentTime = Date.now();
    const isInTrial = currentTime < trialEndTime;

    const calculatedDaysLeft = Math.ceil(
      (trialEndTime - currentTime) / (1000 * 60 * 60 * 24)
    );

    console.log("🔍 [TRIAL CALCULATION - useMemo]:", {
      userCreationTime: new Date(userCreationTime).toISOString(),
      trialEndTime: new Date(trialEndTime).toISOString(),
      currentTime: new Date(currentTime).toISOString(),
      timeUntilEnd: trialEndTime - currentTime,
      calculatedDaysLeft,
      isInTrial,
      userTier: user.tier,
    });

    return isInTrial;
  }, [user?._creationTime, user?.tier]);

  useEffect(() => {
    console.log("🔍 [TRIAL EFFECT] Running effect with user:", user?._id);

    if (!user?._creationTime) {
      console.log("❌ [TRIAL EFFECT] No user creation time");
      return;
    }

    // Skip trial logic if user is already on paid tier
    if (["pro", "premium", "elite"].includes(user.tier)) {
      console.log(
        "🔍 [TRIAL EFFECT] User is on paid tier, skipping trial logic"
      );
      setShowTrialModal(false);
      setTrialRemainingDays(null);
      setIsFirstMonthEnd(false);
      setDaysLeft(0);
      return;
    }

    const userCreationTime = user._creationTime;
    const trialEndTime = userCreationTime + TRIAL_DURATION_MS;
    const currentTime = Date.now();

    const trialEnded = currentTime >= trialEndTime;
    const remainingDays = Math.ceil(
      (trialEndTime - currentTime) / (1000 * 60 * 60 * 24)
    );

    console.log("🔍 [TRIAL EFFECT] Calculations:", {
      trialEnded,
      remainingDays,
      isInGracePeriod, // From useMemo
    });

    setIsFirstMonthEnd(trialEnded);
    setDaysLeft(remainingDays);

    if (remainingDays <= 0) {
      // Trial expired
      setShowTrialModal(true);
      setTrialRemainingDays(null);
    } else {
      // Still in trial
      setTrialRemainingDays(remainingDays);
      setShowTrialModal(false);
    }
  }, [
    user,
    user?._creationTime,
    user?.tier,
    setShowTrialModal,
    setTrialRemainingDays,
  ]);

  console.log("🔍 [TRIAL RESULT] Final values:", {
    isInGracePeriod,
    daysLeft,
    isFirstMonthEnd,
    userTier: user?.tier,
  });

  return {
    isFirstMonthEnd,
    setIsFirstMonthEnd,
    isInGracePeriod,
    daysLeft,
  };
};
