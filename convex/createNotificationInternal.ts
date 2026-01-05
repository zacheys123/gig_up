import { Id } from "./_generated/dataModel";
import { MutationCtx } from "./_generated/server";
import {
  canUserSendOrReceiveNotifications,
  getUserNotificationStatus,
} from "./notHelpers";
import {
  NOTIFICATION_TYPE_TO_SETTING_MAP,
  NotificationSettings,
  NotificationType,
} from "./notificationsTypes";

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
        NOTIFICATION_TYPE_TO_SETTING_MAP[type as NotificationType];

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
        NOTIFICATION_TYPE_TO_SETTING_MAP[type as NotificationType];

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

// convex/notifications.ts - Add these functions
export const cleanupLikeNotification = async (
  ctx: MutationCtx,
  videoOwnerDocumentId: Id<"users">,
  likerDocumentId: Id<"users">,
  videoId: Id<"videos">
) => {
  try {
    const videoOwner = await ctx.db.get(videoOwnerDocumentId);
    if (!videoOwner) return;

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_id", (q) => q.eq("userId", videoOwner.clerkId))
      .collect();

    for (const notification of notifications) {
      if (
        notification.type === "like" &&
        notification.metadata?.likerDocumentId === likerDocumentId.toString() &&
        notification.metadata?.videoId === videoId.toString()
      ) {
        await ctx.db.delete(notification._id);
        console.log(`🗑️ Deleted like notification for video ${videoId}`);
        break;
      }
    }
  } catch (error) {
    console.error("Error in cleanupLikeNotification:", error);
  }
};

export const cleanupVideoNotifications = async (
  ctx: MutationCtx,
  videoId: Id<"videos">
) => {
  try {
    // Get all notifications for this video
    const allNotifications = await ctx.db.query("notifications").collect();

    let deletedCount = 0;

    for (const notification of allNotifications) {
      if (
        (notification.type === "like" ||
          notification.type === "video_comment") &&
        notification.metadata?.videoId === videoId.toString()
      ) {
        await ctx.db.delete(notification._id);
        deletedCount++;
      }
    }

    console.log(
      `🗑️ Deleted ${deletedCount} notifications for video ${videoId}`
    );
    return { success: true, deletedCount };
  } catch (error) {
    console.error("Error in cleanupVideoNotifications:", error);
    return { success: false, error: "Failed to cleanup video notifications" };
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
// Add this to your notifications.ts file
export const createGigNotification = async (
  ctx: MutationCtx,
  args: {
    recipientDocumentId: Id<"users">;
    senderDocumentId?: Id<"users">;
    type:
      | "gig_opportunity"
      | "gig_created"
      | "gig_interest"
      | "interest_confirmation"
      | "gig_selected"
      | "gig_not_selected"
      | "gig_favorited"
      | "band_setup_info"
      | "band_joined"
      | "band_booking"
      | "removed_from_band"
      | "gig_view_milestone";
    gigId: Id<"gigs">;
    gigTitle: string;
    additionalMetadata?: Record<string, any>;
  }
) => {
  const {
    recipientDocumentId,
    senderDocumentId,
    type,
    gigId,
    gigTitle,
    additionalMetadata = {},
  } = args;

  const recipient = await ctx.db.get(recipientDocumentId);
  if (!recipient) {
    console.error("Recipient not found for gig notification");
    return null;
  }

  const sender = senderDocumentId ? await ctx.db.get(senderDocumentId) : null;

  // Default notification titles and messages based on type
  const notificationConfig = {
    gig_opportunity: {
      title: "🎵 New Gig Opportunity!",
      message: `New gig posted: "${gigTitle}"`,
    },
    gig_created: {
      title: "✅ Gig Created Successfully!",
      message: `Your gig "${gigTitle}" has been posted.`,
    },
    gig_interest: {
      title: "👋 New Interest in Your Gig!",
      message: `Someone is interested in your gig "${gigTitle}"`,
    },
    interest_confirmation: {
      title: "✅ Interest Recorded!",
      message: `Your interest in "${gigTitle}" has been recorded.`,
    },
    gig_selected: {
      title: "🎉 You've Been Selected!",
      message: `You've been selected for the gig "${gigTitle}"!`,
    },
    gig_not_selected: {
      title: "ℹ️ Update on Your Interest",
      message: `Another musician was selected for "${gigTitle}".`,
    },
    gig_favorited: {
      title: "⭐ Gig Favorited!",
      message: `Someone favorited your gig "${gigTitle}"`,
    },
    band_setup_info: {
      title: "🎵 Band Setup Ready!",
      message: `Your band gig "${gigTitle}" is live.`,
    },
    band_joined: {
      title: "🎵 New Band Member!",
      message: `Someone joined your band for "${gigTitle}"`,
    },
    band_booking: {
      title: "🎵 Band Booking!",
      message: `You've been booked for "${gigTitle}"`,
    },
    removed_from_band: {
      title: "❌ Removed from Band",
      message: `You've been removed from the band "${gigTitle}"`,
    },
    gig_view_milestone: {
      title: "👀 View Milestone!",
      message: `Your gig "${gigTitle}" reached a view milestone!`,
    },
  };

  const config = notificationConfig[type];

  return createNotificationInternal(ctx, {
    userDocumentId: recipientDocumentId,
    type,
    title: config.title,
    message: config.message,
    image: sender?.picture,
    actionUrl: `/gigs/${gigId}`,
    relatedUserDocumentId: senderDocumentId,
    metadata: {
      gigId: gigId.toString(),
      gigTitle,
      senderName: sender?.firstname || sender?.username,
      senderDocumentId: senderDocumentId?.toString(),
      ...additionalMetadata,
    },
  });
};
