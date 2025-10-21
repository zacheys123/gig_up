// hooks/useNotificationSystem.ts - UPDATED VERSION
"use client";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export interface ToastNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  image?: string;
  actionUrl?: string;
  metadata?: any;
  createdAt: number;
}

interface NotificationSystemContextType {
  // Toasts
  toasts: ToastNotification[];
  addToast: (notification: Omit<ToastNotification, "id">) => void;
  removeToast: (id: string) => void;

  // Notifications
  notifications: any[];
  unreadCount: number;
  isLoading: boolean;

  // Actions
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => void;
}

const NotificationSystemContext = createContext<
  NotificationSystemContextType | undefined
>(undefined);

// Frontend mapping
const notificationTypeToSettingMap = {
  profile_view: "profileViews",
  new_follower: "followRequests",
  follow_request: "followRequests",
  follow_accepted: "followRequests",
  like: "profileViews",
  new_review: "profileViews",
  review_received: "profileViews",
  share: "profileViews",
  new_message: "newMessages",
  gig_invite: "gigInvites",
  gig_application: "bookingRequests",
  gig_approved: "bookingConfirmations",
  gig_rejected: "bookingRequests",
  gig_cancelled: "bookingRequests",
  gig_reminder: "gigReminders",
  system_alert: "systemUpdates",
} as const;

export const useNotificationSystem = () => {
  const context = useContext(NotificationSystemContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationSystem must be used within a NotificationSystemProvider"
    );
  }
  return context;
};

export const NotificationSystemProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const { userId } = useAuth();

  // Track which notifications we've already shown as toasts
  const shownNotificationIds = useRef<Set<string>>(new Set());

  // Fetch notifications
  const notifs = useQuery(
    api.controllers.notifications.getUserNotifications,
    userId ? { clerkId: userId, limit: 20 } : "skip"
  );

  const notificationsData = notifs?.filter((n) => !n.isRead);

  // Fetch unread count
  const unreadCountData = useQuery(
    api.controllers.notifications.getUnreadCount,
    userId ? { clerkId: userId } : "skip"
  );

  // Fetch notification settings
  const notificationSettings = useQuery(
    api.controllers.notifications.getNotificationSettings,
    userId ? { userId } : "skip"
  );

  // Mutations
  const markAsReadMutation = useMutation(
    api.controllers.notifications.markAsRead
  );
  const markAllAsReadMutation = useMutation(
    api.controllers.notifications.markAllAsRead
  );

  const addToast = (notification: Omit<ToastNotification, "id">) => {
    const toast: ToastNotification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
    };

    setToasts((prev) => [...prev, toast]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(toast.id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const markAsRead = async (notificationId: string) => {
    await markAsReadMutation({
      notificationId: notificationId as Id<"notifications">,
      read: true,
    });
  };

  const markAllAsRead = async () => {
    if (userId) {
      await markAllAsReadMutation({ clerkId: userId });
    }
  };

  const refreshNotifications = () => {
    // This will trigger a refetch since we're using useQuery
  };

  const shouldDisplayToast = (notification: any, settings: any) => {
    // Critical notifications always show
    const criticalTypes = ["system_alert"];
    if (criticalTypes.includes(notification.type)) {
      return true;
    }

    const settingKey =
      notificationTypeToSettingMap[
        notification.type as keyof typeof notificationTypeToSettingMap
      ];

    if (settingKey) {
      return settings[settingKey] !== false;
    }

    // For unmapped types, default to true
    return true;
  };

  // FIXED: Show toasts only for NEW notifications
  useEffect(() => {
    if (
      notificationsData &&
      notificationsData.length > 0 &&
      notificationSettings
    ) {
      // Get current time for comparison
      const currentTime = Date.now();

      notificationsData.forEach((notification) => {
        // Skip if we've already shown this notification
        if (shownNotificationIds.current.has(notification._id)) {
          return;
        }

        // Check if this is a new notification (created in the last 30 seconds)
        const isNewNotification =
          currentTime - notification._creationTime < 30000;

        if (isNewNotification) {
          const shouldShowToast = shouldDisplayToast(
            notification,
            notificationSettings
          );

          if (shouldShowToast) {
            // Mark this notification as shown
            shownNotificationIds.current.add(notification._id);

            addToast({
              type: notification.type,
              title: notification.title,
              message: notification.message,
              image: notification.image,
              actionUrl: notification.actionUrl,
              metadata: notification.metadata,
              createdAt: notification._creationTime,
            });
          }
        }
      });
    }
  }, [notificationsData, notificationSettings]);

  // Clean up shown IDs when notifications change significantly
  useEffect(() => {
    if (notificationsData && notificationsData.length === 0) {
      // Reset when all notifications are cleared
      shownNotificationIds.current.clear();
    }
  }, [notificationsData?.length]);

  const value: NotificationSystemContextType = {
    // Toasts
    toasts,
    addToast,
    removeToast,

    // Notifications
    notifications: notificationsData || [],
    unreadCount: unreadCountData || 0,
    isLoading: notificationsData === undefined,

    // Actions
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  };

  return (
    <NotificationSystemContext.Provider value={value}>
      {children}
    </NotificationSystemContext.Provider>
  );
};
