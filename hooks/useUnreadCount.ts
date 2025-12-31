// hooks/useUnreadCount.ts - OPTIMIZED
"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "./useCurrentUser";
import { useMemo } from "react";

interface UnreadCountsData {
  total: number;
  byChat: Record<string, number>;
}

export function useUnreadCount(): UnreadCountsData {
  const { user: currentUser } = useCurrentUser();

  // Memoize query args
  const queryArgs = useMemo(
    () => (currentUser?._id ? { userId: currentUser._id } : "skip"),
    [currentUser?._id]
  );

  const unreadData = useQuery(
    api.controllers.chat.getUnreadCounts,
    queryArgs
  ) as UnreadCountsData | undefined;

  // Use requestAnimationFrame for smoother updates
  useMemo(() => {
    let animationFrameId: number;

    const updateLoop = () => {
      // This creates a reference that forces periodic updates
      // without actual state changes
      animationFrameId = requestAnimationFrame(updateLoop);
    };

    animationFrameId = requestAnimationFrame(updateLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Return with default values
  return useMemo(() => unreadData || { total: 0, byChat: {} }, [unreadData]);
}

// Optional: Hook for specific chat unread count
export function useChatUnreadCount(chatId?: string): number {
  const unreadCounts = useUnreadCount();

  return useMemo(() => {
    if (!chatId) return 0;
    return unreadCounts.byChat[chatId] || 0;
  }, [unreadCounts, chatId]);
}
