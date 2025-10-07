"use client";
import { useEffect, useState } from "react";
import useStore from "@/app/zustand/useStore";
import { useSubscription } from "./useSubscription";
import { User } from "@/types/userTypes";

// import { UserProps } from "@/types/userinterfaces";
// import { useSubscription } from "./useSubscription";

export const useCheckTrial = (user: User | null) => {
  const { setShowTrialModal, setTrialRemainingDays } = useStore();
  const { subscription } = useSubscription(user?.clerkId as string);
  const [isFirstMonthEnd, setisFirstMonthEnd] = useState<boolean>();
  const isPro = subscription?.subscription?.tier !== "free";

  useEffect(() => {
    if (!user?.createdAt || isPro) return;

    const signupDate = new Date(user.createdAt);
    const trialEndDate = new Date(signupDate);
    trialEndDate.setMonth(trialEndDate.getMonth() + 1);
    const now = new Date();

    const oneMonthLater = new Date(signupDate);
    oneMonthLater.setMonth(signupDate.getMonth() + 1);
    setisFirstMonthEnd(now >= oneMonthLater);

    // Calculate the number of remaining full days (including today)
    const msInDay = 1000 * 60 * 60 * 24;
    const timeDiff = trialEndDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(timeDiff / msInDay);

    console.log({
      createdAt: user?.createdAt,
      now: new Date().toISOString(),
      trialEnds: trialEndDate.toISOString(),
      daysLeft,
    });

    if (daysLeft <= 0) {
      // Trial expired
      setShowTrialModal(true);
      setTrialRemainingDays(null);
    } else {
      // Trial still active
      setTrialRemainingDays(daysLeft);
      const timeout = setTimeout(() => {
        setTrialRemainingDays(null);
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [user, isPro]);
  return { isFirstMonthEnd, setisFirstMonthEnd };
};
