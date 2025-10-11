// hooks/useCheckTrial.ts
"use client";
import { UserProps } from "@/types/userTypes";
import { useEffect, useState } from "react";
import { useSubscriptionStore } from "@/app/stores/useSubscriptionStore";
import { useUserStore } from "@/app/stores";

export const useCheckTrial = () => {
  const { setShowTrialModal, setTrialRemainingDays } = useSubscriptionStore();
  const [isFirstMonthEnd, setIsFirstMonthEnd] = useState<boolean>(false);
  const { user } = useUserStore();
  useEffect(() => {
    if (!user?._creationTime) return;

    const signupDate = new Date(user?._creationTime);
    const trialEndDate = new Date(signupDate);
    trialEndDate.setMonth(trialEndDate.getMonth() + 1);
    const now = new Date();

    // Check if first month has ended
    const oneMonthLater = new Date(signupDate);
    oneMonthLater.setMonth(signupDate.getMonth() + 1);
    setIsFirstMonthEnd(now >= oneMonthLater);

    // Calculate the number of remaining full days (including today)
    const msInDay = 1000 * 60 * 60 * 24;
    const timeDiff = trialEndDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(timeDiff / msInDay);

    console.log({
      createdAt: user?._creationTime,
      now: new Date().toISOString(),
      trialEnds: trialEndDate.toISOString(),
      daysLeft,
      isFirstMonthEnd: now >= oneMonthLater,
    });

    // Skip trial logic if user is already on Pro tier
    if (user.tier === "pro") {
      setShowTrialModal(false);
      setTrialRemainingDays(null);
      return;
    }

    if (daysLeft <= 0) {
      // Trial expired
      setShowTrialModal(true);
      setTrialRemainingDays(null);
    } else {
      // Always set remaining days (will trigger modal logic)
      setTrialRemainingDays(daysLeft);
      setShowTrialModal(false);
    }
  }, [user, setShowTrialModal, setTrialRemainingDays]);

  return { isFirstMonthEnd, setIsFirstMonthEnd };
};
