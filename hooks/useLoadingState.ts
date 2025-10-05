// hooks/useLoadingState.ts
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useCurrentUser } from "./useCurrentUser";

export type LoadingState = "first-time" | "returning" | "authenticated" | "unauthenticated";

export function useLoadingState() {
  const { isLoaded: authLoaded, userId } = useAuth();
  const { user, isLoading: userLoading } = useCurrentUser();
  const [loadingState, setLoadingState] = useState<LoadingState>("returning");
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    // Check if this is the user's first visit
    const hasVisitedBefore = localStorage.getItem("hasVisitedBefore");
    
    if (!hasVisitedBefore) {
      setIsFirstVisit(true);
      localStorage.setItem("hasVisitedBefore", "true");
    }

    // Determine loading state based on auth and user data
    if (!authLoaded) {
      setLoadingState("returning");
      return;
    }

    if (!userId) {
      setLoadingState("unauthenticated");
      return;
    }

    if (userLoading) {
      setLoadingState(isFirstVisit ? "first-time" : "returning");
      return;
    }

    if (user) {
      setLoadingState("authenticated");
      return;
    }

    // If we have userId but no user data yet, show appropriate loader
    setLoadingState(isFirstVisit ? "first-time" : "returning");
  }, [authLoaded, userId, userLoading, user, isFirstVisit]);

  return {
    loadingState,
    isFirstVisit,
    isLoading: loadingState === "first-time" || loadingState === "returning",
  };
}