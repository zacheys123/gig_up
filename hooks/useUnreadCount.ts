// hooks/useUnreadCount.ts - Enhanced version with real-time updates
"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "./useCurrentUser";
import { useEffect, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

export function useUnreadCount() {
  const { user: currentUser } = useCurrentUser();
  const [forceUpdate, setForceUpdate] = useState(0);

  const chats = useQuery(
    api.controllers.chat.getUserChats,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  // Calculate total unread count across all chats
  const totalUnreadCount =
    chats?.reduce((total, chat) => {
      return total + (chat.unreadCount || 0);
    }, 0) || 0;

  // Optional: Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setForceUpdate((prev) => prev + 1);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  return totalUnreadCount;
}
