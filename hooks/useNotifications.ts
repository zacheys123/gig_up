// hooks/useNotifications.ts
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

export function useNotifications(limit?: number, unreadOnly?: boolean) {
  const { userId } = useAuth();

  const notifications = useQuery(
    api.controllers.notifications.getUserNotifications,
    userId ? { clerkId: userId, limit, unreadOnly } : "skip"
  );

  const unreadCount = useQuery(
    api.controllers.notifications.getUnreadCount,
    userId ? { clerkId: userId } : "skip"
  );

  return {
    notifications: notifications || [],
    unreadCount: unreadCount || 0,
    isLoading: notifications === undefined,
  };
}

export function useNotificationActions() {
  const markAsRead = useMutation(api.controllers.notifications.markAsRead);
  const markAllAsRead = useMutation(
    api.controllers.notifications.markAllAsRead
  );

  return {
    markAsRead,
    markAllAsRead,
  };
}
