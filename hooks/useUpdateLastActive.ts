// hooks/useUserActivity.ts
"use client";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "./useCurrentUser";
import { useEffect } from "react";

export function useUserActivity() {
  const { user: currentUser } = useCurrentUser();
  const updateLastActive = useMutation(api.controllers.user.updateLastActive);

  // Update lastActive on mount and periodically
  useEffect(() => {
    if (!currentUser?._id) return;

    // Update immediately
    updateLastActive({ userId: currentUser?._id });

    // Update every 2 minutes while user is active
    const interval = setInterval(() => {
      updateLastActive({ userId: currentUser?._id });
    }, 120000);

    return () => clearInterval(interval);
  }, [currentUser?._id, updateLastActive]);

  // Update on user interactions
  const updateActivity = () => {
    if (currentUser?._id) {
      updateLastActive({ userId: currentUser?._id });
    }
  };

  return { updateActivity };
}
