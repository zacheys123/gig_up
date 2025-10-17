import { MutationCtx } from "../_generated/server";
import { createNotificationInternal } from "../createNotificationInternal";
import { sendPushNotification } from "../push";

// convex/shared/notificationUtils.ts
export const notificationTypeToSettingMap = {
  follow_request: "followRequests",
  new_follower: "followRequests",
  follow_accepted: "followRequests",
  profile_view: "profileViews",
  gig_invite: "gigInvites",
  booking_request: "bookingRequests",
  booking_confirmation: "bookingConfirmations",
  gig_reminder: "gigReminders",
  new_message: "newMessages",
  system_update: "systemUpdates",
} as const;

export const createNotificationWithPushHelper = async (
  ctx: MutationCtx,
  args: {
    userId: string;
    type: string;
    title: string;
    message: string;
    image?: string;
    actionUrl?: string;
    relatedUserId?: string;
    metadata?: any;
    sendPush?: boolean;
    pushSettingsKey?: string;
  }
) => {
  const { sendPush = true, pushSettingsKey, ...notificationArgs } = args;

  try {
    // Get user's notification settings
    const notificationSettings = await ctx.db
      .query("notificationSettings")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    // 1. Check if in-app notification should be created
    const inAppSettingKey =
      notificationTypeToSettingMap[
        args.type as keyof typeof notificationTypeToSettingMap
      ];
    let shouldCreateInApp = true;

    if (notificationSettings && inAppSettingKey) {
      shouldCreateInApp = notificationSettings[inAppSettingKey] !== false;
    }

    let notificationId = null;

    // Create in-app notification if enabled
    if (shouldCreateInApp) {
      notificationId = await createNotificationInternal(ctx, notificationArgs);
      console.log(
        `✅ Created in-app notification for ${args.userId} (${args.type})`
      );
    }

    // 2. Handle push notification logic
    if (sendPush) {
      // Check if user has push subscription
      const pushSubscription = await ctx.db
        .query("pushSubscriptions")
        .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
        .first();

      if (pushSubscription && notificationSettings) {
        // Check master push switch
        const isPushEnabled = notificationSettings.pushEnabled !== false;

        // Check specific push setting for this notification type
        let shouldSendPush = isPushEnabled;

        if (pushSettingsKey) {
          const specificPushSetting =
            notificationSettings[
              `push${pushSettingsKey.charAt(0).toUpperCase() + pushSettingsKey.slice(1)}` as keyof typeof notificationSettings
            ];
          shouldSendPush = isPushEnabled && specificPushSetting !== false;
        }

        if (shouldSendPush) {
          // Send actual push notification
          await sendPushNotification({
            userId: args.userId,
            title: args.title,
            body: args.message,
            data: {
              notificationId: notificationId?.toString(),
              actionUrl: args.actionUrl,
              type: args.type,
              image: args.image,
              ...args.metadata,
            },
            requireInteraction: false,
            tag: args.type,
          });

          console.log(
            `📱 PUSH NOTIFICATION SENT for ${args.userId}:`,
            args.title
          );
        } else {
          console.log(
            `📱 Push notification skipped for ${args.userId} - settings disabled`
          );
        }
      } else if (!pushSubscription) {
        console.log(
          `📱 Push notification skipped for ${args.userId} - no subscription`
        );
      }
    }

    return notificationId;
  } catch (error) {
    console.error("Error in notification helper:", error);
    // Fallback to just in-app notification
    return await createNotificationInternal(ctx, notificationArgs);
  }
};
