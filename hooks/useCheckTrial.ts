// hooks/useCheckTrial.ts
"use client";
import { UserProps } from "@/types/userTypes";
import { useEffect, useState } from "react";
import { useSubscriptionStore } from "@/app/stores/useSubscriptionStore";
import { useUserStore } from "@/app/stores";

export const useCheckTrial = () => {
  const { setShowTrialModal, setTrialRemainingDays } = useSubscriptionStore();
  const [isFirstMonthEnd, setIsFirstMonthEnd] = useState<boolean>(false);
  const [isInGracePeriod, setIsInGracePeriod] = useState<boolean>(false);
  const [daysLeft, setDaysLeft] = useState<number>(0);

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
    const firstMonthEnded = now >= oneMonthLater;
    setIsFirstMonthEnd(firstMonthEnded);

    // Calculate the number of remaining full days (including today)
    const msInDay = 1000 * 60 * 60 * 24;
    const timeDiff = trialEndDate.getTime() - now.getTime();
    const remainingDays = Math.ceil(timeDiff / msInDay);

    setDaysLeft(remainingDays);

    // Determine if user is in grace period
    const inGracePeriod = remainingDays > 0 && !firstMonthEnded;
    setIsInGracePeriod(inGracePeriod);

    console.log({
      createdAt: user?._creationTime,
      now: new Date().toISOString(),
      trialEnds: trialEndDate.toISOString(),
      daysLeft: remainingDays,
      isFirstMonthEnd: firstMonthEnded,
      isInGracePeriod: inGracePeriod,
    });

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
  }, [user, setShowTrialModal, setTrialRemainingDays]);

  return {
    isFirstMonthEnd,
    setIsFirstMonthEnd,
    isInGracePeriod,
    daysLeft,
  };
};
