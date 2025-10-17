// convex/notifications.ts - FIXED VERSION
import { Id } from "./_generated/dataModel";
import { MutationCtx } from "./_generated/server";
import { NotificationSettings, NotificationType } from "./notificationsTypes";
export function isUserDocument(doc: any): doc is {
  _id: any;
  clerkId: string;
  username: string;
  firstname?: string;
  lastname?: string;
  picture?: string;
  tier?: string;
  isPrivate?: boolean;
  isMusician?: boolean;
  isClient?: boolean;
  instrument?: string;
  city?: string;
  followers?: any[];
  followings?: any[];
  pendingFollowRequests?: any[];
  profileViews?: any;
  viewedProfiles?: any[];
} {
  return (
    doc && typeof doc === "object" && "clerkId" in doc && "username" in doc
  );
}
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

export const createNotificationInternal = async (
  ctx: MutationCtx,
  args: {
    userDocumentId: any; // RECIPIENT's document ID
    type: string;
    title: string;
    message: string;
    image?: string;
    actionUrl?: string;
    relatedUserDocumentId?: any; // VIEWER/SENDER's document ID
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

  try {
    // 1. Get the RECIPIENT user by document ID
    const recipientUser = await ctx.db.get(userDocumentId);
    if (!recipientUser) {
      console.error(
        "Recipient user not found with document ID:",
        userDocumentId
      );
      return null;
    }

    // 2. ✅ TYPE CHECK: Ensure it's a user document
    if (!("clerkId" in recipientUser) || !("username" in recipientUser)) {
      console.error("Recipient document is not a user:", recipientUser);
      return null;
    }

    // 3. Get the VIEWER/SENDER user by document ID if provided
    let viewerUser = null;
    if (relatedUserDocumentId) {
      viewerUser = await ctx.db.get(relatedUserDocumentId);

      // ✅ TYPE CHECK: Ensure viewer is a user document
      if (
        viewerUser &&
        (!("clerkId" in viewerUser) || !("username" in viewerUser))
      ) {
        console.error("Viewer document is not a user:", viewerUser);
        viewerUser = null;
      }
    }

    // 4. ✅ CHECK IF VIEWER CAN CREATE NOTIFICATIONS
    if (viewerUser && "tier" in viewerUser) {
      const isViewerPro = viewerUser.tier === "pro";
      const canViewerCreateNotifications = isViewerPro || isViewerInGracePeriod;

      if (!canViewerCreateNotifications) {
        console.log(
          `❌ Notification blocked: Viewer ${viewerUser.username} is free user after grace period`
        );
        return null;
      }
    }

    // 5. Check RECIPIENT'S notification settings
    const notificationSettings = await ctx.db
      .query("notificationSettings")
      .withIndex("by_user_id", (q) => q.eq("userId", recipientUser.clerkId))
      .first();

    // 6. DETERMINE IF WE SHOULD CREATE NOTIFICATION
    let shouldCreateNotification = true;

    if (notificationSettings) {
      const settingKey =
        notificationTypeToSettingMap[
          type as keyof typeof notificationTypeToSettingMap
        ];
      if (settingKey) {
        const settings = notificationSettings as NotificationSettings;
        shouldCreateNotification = settings[settingKey] !== false;

        if (!shouldCreateNotification) {
          console.log(
            `Notification skipped for ${recipientUser.username} - Recipient has ${type} disabled`
          );
          return null;
        }
      }
    }

    // 7. Create notification ONLY if both conditions are met
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
        `✅ Notification created for ${recipientUser.username} (type: ${type}) - ` +
          `Viewer: ${viewerUser?.username || "unknown"}, ` +
          `Viewer Tier: ${(viewerUser as any)?.tier || "unknown"}`
      );
      return notificationId;
    }

    return null;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};
