// convex/notifications.ts

import { MutationCtx } from "./_generated/server";
import { notificationTypeToSettingMap } from "./controllers/notifications";

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

    const settingKey =
      notificationTypeToSettingMap[
        type as keyof typeof notificationTypeToSettingMap
      ];

    // 4. DETERMINE IF WE SHOULD CREATE NOTIFICATION
    let shouldCreateNotification = true;

    if (notificationSettings && settingKey) {
      // ✅ ALWAYS check recipient's setting first
      shouldCreateNotification = notificationSettings[settingKey] !== false;
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
