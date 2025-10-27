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
    doc &&
    typeof doc === "object" &&
    "clerkId" in doc &&
    "username" in doc &&
    "isMusician" in doc &&
    "isClient" in doc
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
  system_updates: "systemUpdates",
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

    // 4b. ✅ CHECK IF RECIPIENT CAN RECEIVE NOTIFICATIONS (OPTIONAL)
    if ("tier" in recipientUser) {
      const isRecipientPro = recipientUser.tier === "pro";
      const canRecipientReceiveNotifications =
        isRecipientPro || isViewerInGracePeriod;

      if (!canRecipientReceiveNotifications) {
        console.log(
          `❌ Notification blocked: Recipient ${recipientUser.username} is free user after grace period`
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

// convex/notifications.ts - Add these helper functions
export const cleanupFollowNotifications = async (
  ctx: MutationCtx,
  targetUserDocumentId: Id<"users">,
  currentUserDocumentId: Id<"users">
) => {
  try {
    // Get the target user to get their clerkId for notification querying
    const targetUser = await ctx.db.get(targetUserDocumentId);
    if (!targetUser) {
      console.error("Target user not found for notification cleanup");
      return { success: false, error: "Target user not found" };
    }

    // Get all notifications for the target user
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_id", (q) => q.eq("userId", targetUser.clerkId))
      .collect();

    let deletedCount = 0;
    const followTypes = ["new_follower", "follow_request", "follow_accepted"];

    for (const notification of notifications) {
      // Check if this notification should be deleted using document IDs
      const shouldDelete =
        followTypes.includes(notification.type) &&
        (notification.metadata?.followerDocumentId ===
          currentUserDocumentId.toString() ||
          notification.metadata?.requesterDocumentId ===
            currentUserDocumentId.toString() ||
          notification.relatedUserId?.toString() ===
            currentUserDocumentId.toString());

      if (shouldDelete) {
        await ctx.db.delete(notification._id);
        deletedCount++;
        console.log(
          `🗑️ Deleted ${notification.type} notification for user ${targetUserDocumentId}`
        );
      }
    }

    return { success: true, deletedCount };
  } catch (error) {
    console.error("Error in cleanupFollowNotifications:", error);
    return { success: false, error: "Failed to cleanup notifications" };
  }
};

// More specific helper functions using document IDs
export const deleteFollowerNotification = async (
  ctx: MutationCtx,
  targetUserDocumentId: Id<"users">,
  followerDocumentId: Id<"users">
) => {
  try {
    const targetUser = await ctx.db.get(targetUserDocumentId);
    if (!targetUser) return;

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_id", (q) => q.eq("userId", targetUser.clerkId))
      .collect();

    for (const notification of notifications) {
      if (
        notification.type === "new_follower" &&
        notification.metadata?.followerDocumentId ===
          followerDocumentId.toString()
      ) {
        await ctx.db.delete(notification._id);
        console.log(
          `🗑️ Deleted follower notification for user ${targetUserDocumentId}`
        );
        break;
      }
    }
  } catch (error) {
    console.error("Error in deleteFollowerNotification:", error);
  }
};

export const deleteFollowRequestNotification = async (
  ctx: MutationCtx,
  targetUserDocumentId: Id<"users">,
  requesterDocumentId: Id<"users">
) => {
  try {
    const targetUser = await ctx.db.get(targetUserDocumentId);
    if (!targetUser) return;

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_id", (q) => q.eq("userId", targetUser.clerkId))
      .collect();

    for (const notification of notifications) {
      if (
        notification.type === "follow_request" &&
        notification.metadata?.requesterDocumentId ===
          requesterDocumentId.toString()
      ) {
        await ctx.db.delete(notification._id);
        console.log(
          `🗑️ Deleted follow request notification for user ${targetUserDocumentId}`
        );
        break;
      }
    }
  } catch (error) {
    console.error("Error in deleteFollowRequestNotification:", error);
  }
};

// convex/notifications.ts - Update createMessageNotifications
export const createMessageNotifications = async (
  ctx: MutationCtx,
  args: {
    chat: any;
    sender: any;
    messageContent: string;
    messageType: string;
    otherParticipants: any[];
    isViewerInGracePeriod?: boolean; // ADD THIS PARAMETER
  }
) => {
  const {
    chat,
    sender,
    messageContent,
    messageType,
    otherParticipants,
    isViewerInGracePeriod = false, // DEFAULT TO FALSE
  } = args;

  // Get active chat sessions to see who has the chat open
  const activeChatSessions = await ctx.db
    .query("activeChatSessions")
    .withIndex("by_chat_id", (q) => q.eq("chatId", chat._id))
    .collect();

  const participantsWithChatOpen = activeChatSessions.map(
    (session) => session.userId
  );

  // Filter out participants who have the chat open
  const participantsToNotify = otherParticipants.filter(
    (participantId) => !participantsWithChatOpen.includes(participantId)
  );

  // Create notifications for each participant who doesn't have chat open
  const notificationPromises = participantsToNotify.map(
    async (participantId) => {
      try {
        await createNotificationInternal(ctx, {
          userDocumentId: participantId, // RECIPIENT's document ID
          type: "new_message",
          title: "New Message",
          message: `${sender.firstname || sender.username}: ${truncateMessage(messageContent)}`,
          image: sender.picture,
          actionUrl: `/chat/${chat._id}`,
          relatedUserDocumentId: sender._id, // SENDER's document ID
          isViewerInGracePeriod, // PASS THIS THROUGH
          metadata: {
            chatId: chat._id.toString(),
            senderDocumentId: sender._id.toString(),
            senderClerkId: sender.clerkId,
            senderName: sender.firstname,
            senderUsername: sender.username,
            senderPicture: sender.picture,
            messageType: messageType,
            isSenderPro: sender.tier === "pro",
            isSenderMusician: sender.isMusician,
            isSenderClient: sender.isClient,
            instrument: sender.instrument,
            city: sender.city,
            truncatedMessage: truncateMessage(messageContent),
            isViewerInGracePeriod, // INCLUDE IN METADATA TOO IF NEEDED
          },
        });
      } catch (error) {
        console.error(
          `Failed to create notification for user ${participantId}:`,
          error
        );
      }
    }
  );

  await Promise.all(notificationPromises);
};

function truncateMessage(content: string, maxLength: number = 50): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + "...";
}
