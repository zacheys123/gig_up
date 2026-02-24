// hooks/useNotificationSystem.ts - OPTIMIZED VERSION
"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
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
  autoHide?: boolean;
}

interface NotificationSystemContextType {
  // Toasts
  toasts: ToastNotification[];
  addToast: (notification: Omit<ToastNotification, "id">) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;

  // Notifications
  notifications: any[];
  unreadCount: number;
  isLoading: boolean;
  hasNewNotifications: boolean;

  // Actions
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => void;
  getNotificationSettings: () => any;
}

const NotificationSystemContext = createContext<
  NotificationSystemContextType | undefined
>(undefined);

// COMPLETE Frontend mapping (static object to prevent recreation)
const NOTIFICATION_TYPE_TO_SETTING_MAP = {
  // Profile & Social
  profile_view: "profileViews",
  like: "likes",
  share: "shares",
  new_review: "reviews",
  review_received: "reviews",
  video_comment: "comments",

  // Follows
  new_follower: "followRequests",
  follow_request: "followRequests",
  follow_accepted: "followRequests",

  // Messages & Communication
  new_message: "newMessages",
  message_requests: "messageRequests",

  // Gigs & Bookings
  gig_invite: "gigInvites",
  gig_opportunity: "gigOpportunities",
  gig_created: "gigUpdates",
  gig_application: "bookingRequests",
  gig_approved: "bookingConfirmations",
  gig_rejected: "bookingRequests",
  gig_cancelled: "bookingRequests",
  gig_interest: "gigUpdates",
  interest_confirmation: "gigUpdates",
  gig_selected: "gigUpdates",
  gig_not_selected: "gigUpdates",
  gig_favorited: "gigUpdates",
  gig_reminder: "gigReminders",
  gig_view_milestone: "gigUpdates",
  interest_removed: "gigUpdates",

  // Band-related
  band_setup_info: "bandInvites",
  band_joined: "bandInvites",
  band_booking: "bandInvites",
  removed_from_band: "bandInvites",
  band_member_left: "bandInvites",
  band_member_removed: "bandInvites",

  // System
  system_updates: "systemUpdates",
  feature_announcement: "featureAnnouncements",
} as const;

// Critical notifications that always show
const CRITICAL_NOTIFICATION_TYPES = [
  "system_updates",
  "feature_announcement",
  "gig_reminder",
  "band_booking",
] as const;

export const useNotificationSystem = () => {
  const context = useContext(NotificationSystemContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationSystem must be used within a NotificationSystemProvider",
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
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const { userId } = useAuth();

  // Track which notifications we've already shown as toasts
  const shownNotificationIds = useRef<Set<string>>(new Set());
  const lastNotificationCheck = useRef<number>(Date.now());
  const isProcessingRef = useRef<boolean>(false);

  // Fetch all notifications (read and unread)
  const allNotifications = useQuery(
    api.controllers.notifications.getUserNotifications,
    userId ? { clerkId: userId, limit: 50 } : "skip",
  );

  // Memoize filtered notifications to prevent unnecessary recalculations
  const notificationsData = useMemo(() => {
    return allNotifications?.filter((n) => !n.isRead) || [];
  }, [allNotifications]);

  // Fetch unread count
  const unreadCountData = useQuery(
    api.controllers.notifications.getUnreadCount,
    userId ? { clerkId: userId } : "skip",
  );

  // Fetch notification settings
  const notificationSettings = useQuery(
    api.controllers.notifications.getNotificationSettings,
    userId ? { userId } : "skip",
  );

  // Mutations
  const markAsReadMutation = useMutation(
    api.controllers.notifications.markAsRead,
  );
  const markAllAsReadMutation = useMutation(
    api.controllers.notifications.markAllAsRead,
  );

  const addToast = useCallback(
    (notification: Omit<ToastNotification, "id">) => {
      const toast: ToastNotification = {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        autoHide: notification.autoHide ?? true,
      };

      setToasts((prev) => {
        // Limit to 5 toasts max
        const newToasts = [toast, ...prev].slice(0, 5);
        return newToasts;
      });

      // Auto remove after duration
      const hideDuration =
        notification.type === "feature_announcement"
          ? 8000
          : notification.type === "system_updates"
            ? 7000
            : 5000;

      if (toast.autoHide !== false) {
        setTimeout(() => {
          removeToast(toast.id);
        }, hideDuration);
      }
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await markAsReadMutation({
          notificationId: notificationId as Id<"notifications">,
          read: true,
        });
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    },
    [markAsReadMutation],
  );

  const markAllAsRead = useCallback(async () => {
    if (userId && !isProcessingRef.current) {
      isProcessingRef.current = true;
      try {
        await markAllAsReadMutation({ clerkId: userId });
        setHasNewNotifications(false);
      } catch (error) {
        console.error("Error marking all as read:", error);
      } finally {
        isProcessingRef.current = false;
      }
    }
  }, [userId, markAllAsReadMutation]);

  const refreshNotifications = useCallback(() => {
    // This will trigger a refetch via useQuery
  }, []);

  const getNotificationSettings = useCallback(() => {
    return notificationSettings;
  }, [notificationSettings]);

  // Enhanced toast display logic with theme colors
  const shouldDisplayToast = useCallback((notification: any, settings: any) => {
    // Critical notifications always show
    if (CRITICAL_NOTIFICATION_TYPES.includes(notification.type as any)) {
      return true;
    }

    // Get the setting key for this notification type
    const settingKey =
      NOTIFICATION_TYPE_TO_SETTING_MAP[
        notification.type as keyof typeof NOTIFICATION_TYPE_TO_SETTING_MAP
      ];

    // If we don't have a mapping, default to showing it
    if (!settingKey) {
      return true;
    }

    // Check if user has disabled this type
    if (settings && settings[settingKey] === false) {
      return false;
    }

    // Check tier restrictions
    const userTier = notification.metadata?.userTier || "free";
    const isInGracePeriod = notification.metadata?.isInGracePeriod || false;

    if (
      userTier === "free" &&
      !isInGracePeriod &&
      !CRITICAL_NOTIFICATION_TYPES.includes(notification.type as any)
    ) {
      return false;
    }

    return true;
  }, []);

  // Check for new notifications with debounce
  useEffect(() => {
    if (
      notificationsData &&
      notificationsData.length > 0 &&
      !isProcessingRef.current
    ) {
      const newestNotification = notificationsData[0];
      if (newestNotification._creationTime > lastNotificationCheck.current) {
        setHasNewNotifications(true);
        lastNotificationCheck.current = newestNotification._creationTime;
      }
    }
  }, [notificationsData]);

  // Main notification processing effect
  useEffect(() => {
    if (
      notificationsData &&
      notificationsData.length > 0 &&
      notificationSettings &&
      !isProcessingRef.current
    ) {
      isProcessingRef.current = true;

      const currentTime = Date.now();

      // Process notifications with throttling
      const processNotification = (notification: any) => {
        // Skip if already shown
        if (shownNotificationIds.current.has(notification._id)) {
          return;
        }

        // Check if this is a new notification
        const isNewNotification =
          currentTime - notification._creationTime < 60000;

        if (isNewNotification) {
          const shouldShowToast = shouldDisplayToast(
            notification,
            notificationSettings,
          );

          if (shouldShowToast) {
            shownNotificationIds.current.add(notification._id);

            // Determine appropriate emoji based on type
            const getNotificationEmoji = (type: string) => {
              const emojiMap: Record<string, string> = {
                gig_invite: "🎵",
                gig_opportunity: "✨",
                gig_approved: "✅",
                gig_rejected: "❌",
                new_message: "💬",
                new_follower: "👥",
                profile_view: "👁️",
                band_booking: "🎸",
                band_invite: "🎭",
                system_updates: "🔄",
                feature_announcement: "🌟",
                gig_reminder: "⏰",
              };
              return emojiMap[type] || "🔔";
            };

            addToast({
              type: notification.type,
              title: `${getNotificationEmoji(notification.type)} ${notification.title}`,
              message: notification.message,
              image: notification.image,
              actionUrl: notification.actionUrl,
              metadata: notification.metadata,
              createdAt: notification._creationTime,
              autoHide:
                notification.type === "feature_announcement" ? false : true,
            });

            // Optional notification sound
            if (typeof window !== "undefined" && window.Audio) {
              try {
                const audio = new Audio("/sounds/notification.mp3");
                audio.volume = 0.3;
                audio.play().catch(() => {});
              } catch (error) {
                // Silent fail
              }
            }
          }
        }
      };

      // Process notifications with a small delay between each
      notificationsData.forEach((notification, index) => {
        setTimeout(() => {
          processNotification(notification);
        }, index * 100); // 100ms delay between each notification
      });

      setTimeout(() => {
        isProcessingRef.current = false;
      }, notificationsData.length * 100);
    }
  }, [notificationsData, notificationSettings, addToast, shouldDisplayToast]);

  // Clean up shown IDs when notifications are marked as read
  useEffect(() => {
    if (notificationsData && notificationsData.length === 0) {
      shownNotificationIds.current.clear();
      setHasNewNotifications(false);
    }
  }, [notificationsData?.length]);

  // Create memoized value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      // Toasts
      toasts,
      addToast,
      removeToast,
      clearAllToasts,

      // Notifications
      notifications: notificationsData,
      unreadCount: unreadCountData || 0,
      isLoading: allNotifications === undefined,
      hasNewNotifications,

      // Actions
      markAsRead,
      markAllAsRead,
      refreshNotifications,
      getNotificationSettings,
    }),
    [
      toasts,
      addToast,
      removeToast,
      clearAllToasts,
      notificationsData,
      unreadCountData,
      allNotifications,
      hasNewNotifications,
      markAsRead,
      markAllAsRead,
      refreshNotifications,
      getNotificationSettings,
    ],
  );

  return (
    <NotificationSystemContext.Provider value={value}>
      {children}
    </NotificationSystemContext.Provider>
  );
};
