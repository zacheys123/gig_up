import { MutationCtx } from "./_generated/server";
import {
  canUserSendOrReceiveNotifications,
  getUserNotificationStatus,
} from "./notHelpers";
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
  like: "likes",
  new_review: "reviews",
  review_received: "reviews",
  share: "shares",

  // Messages & Communication
  new_message: "newMessages",

  // Gigs & Bookings
  gig_invite: "gigInvites",
  gig_application: "bookingRequests",
  gig_approved: "bookingConfirmations",
  gig_rejected: "bookingRequests",
  gig_cancelled: "bookingRequests",
  gig_reminder: "gigReminders",
  video_comment: "comments",

  // System
  system_updates: "systemUpdates",
  feature_announcement: "featureAnnouncements", // ADD THIS LINE
};
export const createNotificationInternal = async (
  ctx: MutationCtx,
  args: {
    userDocumentId: any;
    type: string;
    title: string;
    message: string;
    image?: string;
    actionUrl?: string;
    relatedUserDocumentId?: any;
    metadata?: any;
    isViewerInGracePeriod?: boolean;
  }
) => {
  const {
    userDocumentId,
    type,
    relatedUserDocumentId,
    isViewerInGracePeriod,
    ...rest
  } = args;

  console.log("🎯 [NOTIFICATION] Starting creation:", {
    type,
    userDocumentId,
    relatedUserDocumentId,
    isViewerInGracePeriod,
  });

  try {
    // 1. Get the RECIPIENT user by document ID
    const recipientUser = await ctx.db.get(userDocumentId);
    if (!recipientUser) {
      console.error(
        "❌ [NOTIFICATION] Recipient user not found with document ID:",
        userDocumentId
      );
      return null;
    }

    console.log("👤 [NOTIFICATION] Recipient found:", {
      username: recipientUser,
      ...getUserNotificationStatus(recipientUser),
    });

    // 2. ✅ TYPE CHECK: Ensure it's a user document
    if (!("clerkId" in recipientUser) || !("username" in recipientUser)) {
      console.error(
        "❌ [NOTIFICATION] Recipient document is not a user:",
        recipientUser
      );
      return null;
    }

    // 3. Get the VIEWER/SENDER user by document ID if provided
    let viewerUser = null;
    let viewerNotificationSettings = null;

    if (relatedUserDocumentId) {
      viewerUser = await ctx.db.get(relatedUserDocumentId);

      console.log("👁️ [NOTIFICATION] Viewer found:", {
        username: viewerUser,
        ...getUserNotificationStatus(viewerUser),
      });

      // ✅ TYPE CHECK: Ensure viewer is a user document
      if (
        viewerUser &&
        (!("clerkId" in viewerUser) || !("username" in viewerUser))
      ) {
        console.error(
          "❌ [NOTIFICATION] Viewer document is not a user:",
          viewerUser
        );
        viewerUser = null;
      } else if (viewerUser) {
        // Get viewer's notification settings
        viewerNotificationSettings = await ctx.db
          .query("notificationSettings")
          .withIndex("by_user_id", (q) => q.eq("userId", viewerUser!.clerkId))
          .first();

        console.log(
          "⚙️ [NOTIFICATION] Viewer settings:",
          viewerNotificationSettings
        );
      }
    }

    // 4. ✅ CHECK IF VIEWER CAN CREATE NOTIFICATIONS (tier check)
    if (viewerUser) {
      const canViewerCreateNotifications =
        canUserSendOrReceiveNotifications(viewerUser);

      console.log("💰 [NOTIFICATION] Viewer tier check result:", {
        viewerUsername: viewerUser.username,
        canViewerCreateNotifications,
      });

      if (!canViewerCreateNotifications) {
        console.log(
          `❌ [NOTIFICATION] BLOCKED: Viewer ${viewerUser.username} cannot create notifications (not pro and not in grace period)`
        );
        return null;
      }
    } else {
      console.log(
        "ℹ️ [NOTIFICATION] No viewer user provided (system notification)"
      );
    }

    // 5. ✅ CHECK IF RECIPIENT CAN RECEIVE NOTIFICATIONS (tier check)
    const canRecipientReceiveNotifications =
      canUserSendOrReceiveNotifications(recipientUser);

    console.log("💰 [NOTIFICATION] Recipient tier check result:", {
      recipientUsername: recipientUser.username,
      canRecipientReceiveNotifications,
    });

    if (!canRecipientReceiveNotifications) {
      console.log(
        `❌ [NOTIFICATION] BLOCKED: Recipient ${recipientUser.username} cannot receive notifications (not pro and not in grace period)`
      );
      return null;
    }

    // 6. ✅ SPECIAL CASE: Feature announcements bypass all user settings
    if (type === "feature_announcement") {
      console.log("🎯 [FEATURE ANNOUNCEMENT] Bypassing user settings check");

      const notificationId = await ctx.db.insert("notifications", {
        userId: recipientUser.clerkId,
        type,
        ...rest,
        isRead: false,
        isArchived: false,
        createdAt: Date.now(),
      });

      console.log(
        `✅ [FEATURE ANNOUNCEMENT] CREATED for ${recipientUser.username} - ID: ${notificationId}`
      );
      return notificationId;
    }

    // 7. ✅ CHECK VIEWER'S NOTIFICATION SETTINGS (if viewer exists)
    // For actions initiated by the viewer (likes, follows, messages, etc.)
    if (viewerNotificationSettings && viewerUser) {
      const viewerSettingKey =
        notificationTypeToSettingMap[
          type as keyof typeof notificationTypeToSettingMap
        ];

      if (viewerSettingKey) {
        const viewerSettings = viewerNotificationSettings as any;
        const isViewerSettingEnabled =
          viewerSettings[viewerSettingKey] !== false;

        console.log("⚙️ [NOTIFICATION] Viewer setting check:", {
          type,
          settingKey: viewerSettingKey,
          isViewerSettingEnabled,
        });

        if (!isViewerSettingEnabled) {
          console.log(
            `❌ [NOTIFICATION] BLOCKED: Viewer ${viewerUser.username} has ${type} notifications disabled in their settings`
          );
          return null;
        }
      }
    }

    // 8. Check RECIPIENT'S notification settings
    const recipientNotificationSettings = await ctx.db
      .query("notificationSettings")
      .withIndex("by_user_id", (q) => q.eq("userId", recipientUser.clerkId))
      .first();

    // 9. DETERMINE IF WE SHOULD CREATE NOTIFICATION
    let shouldCreateNotification = true;

    // Check recipient settings (skip for feature_announcement)
    if (recipientNotificationSettings && type !== "feature_announcement") {
      const recipientSettingKey =
        notificationTypeToSettingMap[
          type as keyof typeof notificationTypeToSettingMap
        ];

      if (recipientSettingKey) {
        const recipientSettings = recipientNotificationSettings as any;
        shouldCreateNotification =
          recipientSettings[recipientSettingKey] !== false;

        console.log("⚙️ [NOTIFICATION] Recipient setting check:", {
          type,
          settingKey: recipientSettingKey,
          shouldCreateNotification,
        });

        if (!shouldCreateNotification) {
          console.log(
            `ℹ️ [NOTIFICATION] SKIPPED: Recipient ${recipientUser.username} has ${type} notifications disabled`
          );
          return null;
        }
      }
    }

    // 10. Create notification ONLY if all conditions are met
    if (shouldCreateNotification) {
      const notificationId = await ctx.db.insert("notifications", {
        userId: recipientUser.clerkId, // Store clerkId in notification for easy querying
        type,
        ...rest,
        isRead: false,
        isArchived: false,
        createdAt: Date.now(),
      });

      console.log(
        `✅ [NOTIFICATION] CREATED for ${recipientUser.username} (type: ${type}) - ` +
          `Viewer: ${viewerUser?.username || "system"}, ` +
          `ID: ${notificationId}`
      );
      return notificationId;
    }

    return null;
  } catch (error) {
    console.error("❌ [NOTIFICATION] Error creating notification:", error);
    return null;
  }
};
