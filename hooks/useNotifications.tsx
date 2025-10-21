// hooks/useNotificationSystem.ts
"use client";
import { createContext, useContext, useEffect, useState } from "react";
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

// hooks/useNotificationSystem.ts - UPDATE THE MAPPING
// Frontend mapping (same as backend)
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
    }, 10000);
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

  // Show toasts for new notifications
  useEffect(() => {
    if (
      notificationsData &&
      notificationsData.length > 0 &&
      notificationSettings
    ) {
      const latestNotification = notificationsData[0];

      // Check if this is a new notification (created in the last 10 seconds)
      const isNewNotification =
        Date.now() - latestNotification.createdAt < 10000;

      if (isNewNotification) {
        const shouldShowToast = shouldDisplayToast(
          latestNotification,
          notificationSettings
        );

        if (shouldShowToast) {
          addToast({
            type: latestNotification.type,
            title: latestNotification.title,
            message: latestNotification.message,
            image: latestNotification.image,
            actionUrl: latestNotification.actionUrl,
            metadata: latestNotification.metadata,
            createdAt: latestNotification.createdAt,
          });
        }
      }
    }
  }, [notificationsData, notificationSettings]);

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

// <ConfirmPrompt
//     isOpen={showPrompt}
//     onClose={() => setShowPrompt(false)}
//     onConfirm={() => router.push(`/search/${username}`)}
//     onCancel={() => null}
//     title="View Profile"
//     question="Do you want to visit their profile?"
//     userInfo={{
//       id: _id,
//       name: firstname + " " + lastname,
//       username: username,
//       image: picture,
//       type: isMusician ? "musician" : "client",
//       instrument: instrument,
//       city: city,
//     }}
//     confirmText="Yes, View"
//     cancelText="No, Thanks"
//     variant="info"
//   />
