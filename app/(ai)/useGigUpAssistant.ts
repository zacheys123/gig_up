// hooks/usegigUpAssistant.ts
import { useState, useCallback, useMemo } from "react";
import { useCurrentUser } from "../../hooks/useCurrentUser";

interface QuestionLimit {
  dailyLimit: number;
  resetMinutes: number;
}

// Configurable tier limits with reset times in MINUTES
const TIER_QUESTION_LIMITS = {
  free: { dailyLimit: 10, resetMinutes: 10 }, // Reset every 10 minutes
  pro: { dailyLimit: 100, resetMinutes: 5 }, // Reset every 5 minutes
  trial: { dailyLimit: 25, resetMinutes: 10 }, // Reset every 10 minutes
} as const;

export function usegigUpAssistant() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useCurrentUser();

  const getQuestionUsage = useCallback(() => {
    if (typeof window === "undefined")
      return { used: 0, limit: 10, resetTime: null, canAsk: true };

    const storageKey = `ai_questions_usage`;
    const usage = JSON.parse(
      localStorage.getItem(storageKey) || '{"count": 0, "resetTime": null}',
    );

    const userTier = user?.tier || "free";
    const limitConfig =
      TIER_QUESTION_LIMITS[userTier as keyof typeof TIER_QUESTION_LIMITS];
    const limit = limitConfig?.dailyLimit || 10;
    const resetMinutes = limitConfig?.resetMinutes || 10;

    // Check if reset time has passed
    const now = Date.now();
    if (usage.resetTime && now > usage.resetTime) {
      // Reset the count
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          count: 0,
          resetTime: now + resetMinutes * 60 * 1000,
        }),
      );
      return { used: 0, limit, resetTime: null, canAsk: true, resetMinutes };
    }

    return {
      used: usage.count || 0,
      limit,
      resetTime: usage.resetTime,
      canAsk: (usage.count || 0) < limit,
      resetMinutes,
    };
  }, [user?.tier]);

  const incrementQuestionCount = useCallback(() => {
    if (typeof window === "undefined") return;

    const storageKey = `ai_questions_usage`;
    const current = JSON.parse(
      localStorage.getItem(storageKey) || '{"count": 0}',
    );
    const userTier = user?.tier || "free";
    const resetMinutes =
      TIER_QUESTION_LIMITS[userTier as keyof typeof TIER_QUESTION_LIMITS]
        ?.resetMinutes || 10;

    const newCount = (current.count || 0) + 1;

    // If this is the first question or reset time has passed, set new reset time
    const resetTime =
      current.resetTime && Date.now() < current.resetTime
        ? current.resetTime
        : Date.now() + resetMinutes * 60 * 1000;

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        count: newCount,
        resetTime: resetTime,
      }),
    );

    return newCount;
  }, [user?.tier]);

  const getTimeUntilReset = useCallback(() => {
    const usage = getQuestionUsage();
    if (!usage.resetTime) return null;

    const now = Date.now();
    const timeLeft = usage.resetTime - now;

    if (timeLeft <= 0) return null;

    const minutes = Math.floor(timeLeft / (60 * 1000));
    const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);

    return { minutes, seconds, totalMs: timeLeft };
  }, [getQuestionUsage]);

  const askQuestion = async (
    question: string,
    platformVersion: string = "v2.0",
  ) => {
    const usage = getQuestionUsage();

    if (!usage.canAsk) {
      throw new Error("DAILY_LIMIT_EXCEEDED");
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          userRole: user?.isMusician
            ? "musician"
            : user?.isClient
              ? "client"
              : "guest",
          userTier: user?.tier || "free",
          platformVersion,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      incrementQuestionCount();

      // Ensure the response includes platformVersion for metadata
      return {
        ...data,
        platformVersion: data.platformVersion || platformVersion,
      };
    } catch (error) {
      console.error("AI Assistant error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize the question usage to prevent infinite re-renders
  const questionUsage = useMemo(() => getQuestionUsage(), [getQuestionUsage]);
  const timeUntilReset = useMemo(
    () => getTimeUntilReset(),
    [getTimeUntilReset],
  );

  return {
    askQuestion,
    isLoading,
    questionUsage,
    timeUntilReset,
    tierLimits: TIER_QUESTION_LIMITS,
  };
}
