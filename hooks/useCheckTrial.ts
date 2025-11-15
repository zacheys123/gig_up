// hooks/useCheckTrial.ts
"use client";
import { UserProps } from "@/types/userTypes";
import { useEffect, useState, useMemo } from "react";
import { useSubscriptionStore } from "@/app/stores/useSubscriptionStore";
import { useUserStore } from "@/app/stores";

// Trial configuration - same as in useTemplates
const TRIAL_DURATION_DAYS = 24; // 14-day trial
const TRIAL_DURATION_MS = TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;

export const useCheckTrial = () => {
  const { setShowTrialModal, setTrialRemainingDays } = useSubscriptionStore();
  const [isFirstMonthEnd, setIsFirstMonthEnd] = useState<boolean>(false);
  const [daysLeft, setDaysLeft] = useState<number>(0);

  const { user } = useUserStore();

  // Calculate isInGracePeriod based on user creation time - same logic as useTemplates
  const isInGracePeriod = useMemo(() => {
    if (!user?._creationTime) {
      console.log("❌ [TRIAL] No user creation time found");
      return false;
    }

    const userCreationTime = user._creationTime;
    const trialEndTime = userCreationTime + TRIAL_DURATION_MS;
    const currentTime = Date.now();
    const isInTrial = currentTime < trialEndTime;

    console.log("🔍 [TRIAL CALCULATION - useCheckTrial]:", {
      userCreationTime: new Date(userCreationTime).toISOString(),
      trialEndTime: new Date(trialEndTime).toISOString(),
      currentTime: new Date(currentTime).toISOString(),

      daysRemaining: Math.ceil(
        (trialEndTime - currentTime) / (1000 * 60 * 60 * 24)
      ),
      isInTrial,
    });

    return isInTrial;
  }, [user?._creationTime]);

  console.log(
    isInGracePeriod
      ? "✅ [TRIAL] User is in grace period"
      : "❌ [TRIAL] User is NOT in grace period"
  );
  useEffect(() => {
    if (!user?._creationTime) return;

    const signupDate = new Date(user?._creationTime);
    const trialEndDate = new Date(signupDate.getTime() + TRIAL_DURATION_MS); // Use same trial calculation
    const now = new Date();

    // Check if trial period has ended (using 14-day trial)
    const trialEnded = now >= trialEndDate;
    setIsFirstMonthEnd(trialEnded);

    // Calculate the number of remaining full days (including today)
    const msInDay = 1000 * 60 * 60 * 24;
    const timeDiff = trialEndDate.getTime() - now.getTime();
    const remainingDays = Math.ceil(timeDiff / msInDay);

    setDaysLeft(remainingDays);

    // Skip trial logic if user is already on Pro tier
    if (user.tier === "pro") {
      setShowTrialModal(false);
      setTrialRemainingDays(null);
      return;
    }

    if (remainingDays <= 0) {
      // Trial expired
      setShowTrialModal(true);
      setTrialRemainingDays(null);
    } else {
      // Always set remaining days (will trigger modal logic)
      setTrialRemainingDays(remainingDays);
      setShowTrialModal(false);
    }
  }, [user, setShowTrialModal, setTrialRemainingDays, isInGracePeriod]); // Add isInGracePeriod to dependencies

  return {
    isFirstMonthEnd,
    setIsFirstMonthEnd,
    isInGracePeriod, // Now using the same calculation as useTemplates
    daysLeft,
  };
};
