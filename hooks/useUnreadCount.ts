// hooks/useUnreadCount.ts - Corrected version
"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "./useCurrentUser";
import { useEffect, useState } from "react";

interface UnreadCountsData {
  total: number;
  byChat: Record<string, number>;
}

export function useUnreadCount(): UnreadCountsData {
  const { user: currentUser } = useCurrentUser();
  const [forceUpdate, setForceUpdate] = useState(0);

  const unreadData = useQuery(
    api.controllers.chat.getUnreadCounts,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  // Return default values if no data
  const result: UnreadCountsData = unreadData || {
    total: 0,
    byChat: {},
  };

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setForceUpdate((prev) => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return result;
}
