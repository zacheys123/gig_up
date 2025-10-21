// hooks/useGlobalActivity.ts
"use client";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "./useCurrentUser";
import { useEffect, useCallback } from "react";

export function useGlobalActivity() {
  const { user: currentUser } = useCurrentUser();
  const updateLastActive = useMutation(api.controllers.user.updateLastActive);

  // Throttled update function
  const updateActivity = useCallback(() => {
    if (!currentUser?._id) return;

    // Update lastActive in Convex
    updateLastActive({ userId: currentUser?._id });
  }, [currentUser?._id, updateLastActive]);

  useEffect(() => {
    if (!currentUser?._id) return;

    // Update immediately on mount
    updateActivity();

    // Track user interactions
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
      "focus",
      "touchmove",
    ];

    // Throttle function to avoid too many updates
    let lastUpdate = 0;
    const throttledUpdate = () => {
      const now = Date.now();
      if (now - lastUpdate > 30000) {
        // Update at most every 30 seconds
        lastUpdate = now;
        updateActivity();
      }
    };

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, throttledUpdate, { passive: true });
    });

    // Periodic update (every 2 minutes) as backup
    const interval = setInterval(updateActivity, 120000);

    return () => {
      // Cleanup
      events.forEach((event) => {
        document.removeEventListener(event, throttledUpdate);
      });
      clearInterval(interval);
    };
  }, [currentUser?._id, updateActivity]);
}
