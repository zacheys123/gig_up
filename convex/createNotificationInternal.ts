// convex/notifications.ts - FIXED VERSION
import { MutationCtx } from "./_generated/server";
import { NotificationSettings, NotificationType } from "./notificationsTypes";
export const notificationTypeToSettingMap: Record<
  NotificationType,
  keyof NotificationSettings
> = {
  // Profile & Social
  profile_view: "profileViews",
  new_follower: "followRequests",
  follow_request: "followRequests",
  follow_accepted: "followRequests",
  like: "profileViews",
  new_review: "profileViews",
  review_received: "profileViews",
  share: "profileViews",

  // Messages & Communication
  new_message: "newMessages",

  // Gigs & Bookings
  gig_invite: "gigInvites",
  gig_application: "bookingRequests",
  gig_approved: "bookingConfirmations",
  gig_rejected: "bookingRequests",
  gig_cancelled: "bookingRequests",
  gig_reminder: "gigReminders",

  // System
  system_alert: "systemUpdates",
};

// REUSABLE HELPER FUNCTION - ALWAYS RESPECTS RECIPIENT SETTINGS
export const createNotificationInternal = async (
  ctx: MutationCtx,
  args: {
    userId: string; // RECIPIENT (gets notification)
    type: string;
    title: string;
    message: string;
    image?: string;
    actionUrl?: string;
    relatedUserId?: string; // VIEWER/SENDER (person taking action)
    metadata?: any;
    isViewerInGracePeriod?: boolean; // VIEWER'S grace period status
  }
) => {
  const { userId, type, relatedUserId, isViewerInGracePeriod, ...rest } = args;

  try {
    // 1. Get the RECIPIENT user (person receiving notification)
    const recipientUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .first();

    if (!recipientUser) {
      console.error("Recipient user not found:", userId);
      return null;
    }

    // 2. Get the VIEWER/SENDER user if provided
    let viewerUser = null;
    if (relatedUserId) {
      viewerUser = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", relatedUserId))
        .first();
    }

    // 3. Check RECIPIENT'S notification settings - ALWAYS CHECK THIS FIRST
    const notificationSettings = await ctx.db
      .query("notificationSettings")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    // 4. DETERMINE IF WE SHOULD CREATE NOTIFICATION
    let shouldCreateNotification = true;

    if (notificationSettings) {
      const settingKey =
        notificationTypeToSettingMap[
          type as keyof typeof notificationTypeToSettingMap
        ];

      if (settingKey) {
        // ✅ ALWAYS check recipient's setting first
        // Use type assertion to safely access the property
        const settings = notificationSettings as NotificationSettings;
        shouldCreateNotification = settings[settingKey] !== false;
      }
    }

    // 5. Create notification ONLY if recipient has setting enabled
    if (shouldCreateNotification) {
      const notificationId = await ctx.db.insert("notifications", {
        userId,
        type,
        ...rest,
        isRead: false,
        isArchived: false,
        createdAt: Date.now(),
      });

      console.log(
        `Notification created for ${userId} (type: ${type}) - Recipient setting enabled`
      );
      return notificationId;
    }

    console.log(
      `Notification skipped for ${userId} (type: ${type}) - Recipient has setting disabled`
    );
    return null;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};
