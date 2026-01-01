"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "./useCurrentUser";
import { useMemo } from "react";

interface UnreadCountsData {
  total: number;
  byChat: Record<string, number>;
}

export function useUnreadCount(): UnreadCountsData & { isLoading: boolean } {
  const { user: currentUser } = useCurrentUser();

  // Memoize query args
  const queryArgs = useMemo(
    () => (currentUser?._id ? { userId: currentUser._id } : "skip"),
    [currentUser?._id]
  );

  // useQuery returns undefined while loading
  const unreadData = useQuery(api.controllers.chat.getUnreadCounts, queryArgs);

  // Handle the data with proper typing
  const typedData = useMemo(() => {
    // Default to empty structure if no data
    if (!unreadData) {
      return {
        total: 0,
        byChat: {},
        isLoading: true,
      };
    }

    // Type assertion to UnreadCountsData
    return {
      ...(unreadData as UnreadCountsData),
      isLoading: false,
    };
  }, [unreadData]);

  return typedData;
}

// Optional: Hook for specific chat unread count
export function useChatUnreadCount(chatId?: string): {
  count: number;
  isLoading: boolean;
} {
  const unreadCounts = useUnreadCount();

  return useMemo(() => {
    if (!chatId) return { count: 0, isLoading: false };
    return {
      count: unreadCounts.byChat[chatId] || 0,
      isLoading: unreadCounts.isLoading,
    };
  }, [unreadCounts, chatId]);
}
