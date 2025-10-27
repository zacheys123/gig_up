// hooks/useUnreadCount.ts - UPDATED
"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "./useCurrentUser";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useState } from "react";

interface UnreadCountsData {
  total: number;
  byChat: Record<string, number>; // ✅ Changed to string keys
}

export function useUnreadCount(): UnreadCountsData {
  const { user: currentUser } = useCurrentUser();
  const [refreshCounter, setRefreshCounter] = useState(0);

  const unreadData = useQuery(
    api.controllers.chat.getUnreadCounts,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  ) as UnreadCountsData | undefined; // ✅ Add type assertion

  // Force more frequent updates for real-time feel
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshCounter((prev) => prev + 1);
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Return with proper typing
  return unreadData || { total: 0, byChat: {} };
}
// now i have other  functionalities i want::for someone to actually clear their chat without clearing the database of cos ::i dont want where a user doesnt see chats because sommeone decided to clear chats::
