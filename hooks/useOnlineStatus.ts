// hooks/useOnlineStatus.ts - ENHANCED WITH HISTORY
import { useMemo, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useOnlineStatus(userId?: string) {
  const userPresence = useQuery(
    api.presence.getUserPresence,
    userId ? { userId } : "skip"
  );

  // Track previous online state
  const wasOnlineRef = useRef<boolean>(false);

  const result = useMemo(() => {
    if (!userId) {
      return {
        isOnline: false,
        lastActiveText: "",
        wasOnline: false,
      };
    }

    const now = Date.now();
    const FIVE_MINUTES = 5 * 60 * 1000;

    const lastSeen = userPresence?.lastSeen;
    const isOnline =
      userPresence?.isOnline ||
      (lastSeen ? now - lastSeen < FIVE_MINUTES : false);

    let lastActiveText = "";
    if (lastSeen) {
      const diff = now - lastSeen;

      if (isOnline) {
        lastActiveText = "online";
      } else if (diff < FIVE_MINUTES) {
        lastActiveText = "just now";
      } else if (diff < 60 * 60 * 1000) {
        const minutes = Math.floor(diff / (60 * 1000));
        lastActiveText = `${minutes}m ago`;
      } else if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        lastActiveText = `${hours}h ago`;
      } else {
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        lastActiveText = `${days}d ago`;
      }
    }

    const wasOnline = wasOnlineRef.current;
    wasOnlineRef.current = isOnline;

    return {
      isOnline,
      lastActiveText: lastActiveText || "offline",
      wasOnline,
    };
  }, [userId, userPresence]);

  return result;
}
