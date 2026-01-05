// convex/notifications.ts
import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { query } from "../_generated/server";
import { createNotificationInternal } from "../createNotificationInternal";
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  NOTIFICATION_TYPE_TO_SETTING_MAP,
} from "../notificationsTypes";

const recentViews = new Map<string, number>(); // userId -> timestamp
export const trackProfileView = mutation({
  args: {
    viewedUserDocId: v.id("users"),
    viewerUserDocId: v.id("users"),
    isViewerInGracePeriod: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { viewedUserDocId, viewerUserDocId, isViewerInGracePeriod } = args;

    console.log("=== PROFILE VIEW DEBUG ===");
    console.log("Viewed User Document ID:", viewedUserDocId);
    console.log("Viewer User Document ID:", viewerUserDocId);
    console.log("Is Viewer in Grace Period:", isViewerInGracePeriod);

    // Get users by document ID
    const [viewedUserDoc, viewerDoc] = await Promise.all([
      ctx.db.get(viewedUserDocId),
      ctx.db.get(viewerUserDocId),
    ]);
    console.log("Viewer User:", {
      id: viewerDoc?._id,
      username: viewerDoc?.username,
      tier: viewerDoc?.tier,
      clerkId: viewerDoc?.clerkId,
    });
    console.log(
      "Can Create Notification:",
      viewerDoc?.tier === "pro" || isViewerInGracePeriod
    );

    if (!viewedUserDoc) {
      throw new Error(
        `Viewed user not found with document ID: ${viewedUserDocId}`
      );
    }

    if (!viewerDoc) {
      throw new Error(
        `Viewer user not found with document ID: ${viewerUserDocId}`
      );
    }

    // Don't track self-views
    if (viewedUserDoc._id.toString() === viewerDoc._id.toString()) {
      console.log("Self-view detected, skipping");
      return { success: false, reason: "self_view" };
    }

    // Check if user has already viewed this profile
    const viewerViewedProfiles = viewerDoc.viewedProfiles || [];
    const hasAlreadyViewed = viewerViewedProfiles.some(
      (viewedId: any) => viewedId.toString() === viewedUserDoc._id.toString()
    );

    if (hasAlreadyViewed) {
      console.log(
        `🚫 USER BLOCKED: ${viewerDoc.username} has already viewed ${viewedUserDoc.username}`
      );
      return {
        success: false,
        reason: "already_viewed",
        message: "You have already viewed this profile",
      };
    }

    // Update viewed user's profile view count
    const currentViews = viewedUserDoc.profileViews || {
      totalCount: 0,
      recentViewers: [],
      lastUpdated: Date.now(),
    };

    const newRecentViewers = [
      { userId: viewerDoc._id, timestamp: Date.now() },
      ...currentViews.recentViewers.slice(0, 49),
    ];

    await ctx.db.patch(viewedUserDoc._id, {
      profileViews: {
        totalCount: currentViews.totalCount + 1,
        recentViewers: newRecentViewers,
        lastUpdated: Date.now(),
      },
    });

    // Update viewer's viewedProfiles
    const updatedViewedProfiles = [
      viewedUserDoc._id,
      ...viewerViewedProfiles,
    ].slice(0, 100);

    await ctx.db.patch(viewerDoc._id, {
      viewedProfiles: updatedViewedProfiles,
    });

    console.log(
      `✅ Profile view tracked for ${viewedUserDoc.username} by ${viewerDoc.username}`
    );
    console.log(
      `📊 Viewer details - Tier: ${viewerDoc.tier}, Grace Period: ${isViewerInGracePeriod}`
    );

    // ✅ Create notification using Document IDs consistently
    const notificationId = await createNotificationInternal(ctx, {
      userDocumentId: viewedUserDoc._id, // RECIPIENT's document ID
      type: "profile_view",
      title: "Profile Viewed",
      message: `${viewerDoc.firstname || "Someone"} viewed your profile`,
      image: viewerDoc.picture,
      actionUrl: `/analytics/profile-views?viewer=${viewerDoc._id}&source=notification`,
      relatedUserDocumentId: viewerDoc._id, // VIEWER's document ID
      isViewerInGracePeriod: isViewerInGracePeriod,
      metadata: {
        senderDocumentId: viewerDoc._id.toString(),
        senderClerkId: viewerDoc.clerkId,
        recipientDocumentId: viewedUserDoc._id.toString(),
        recipientClerkId: viewedUserDoc.clerkId,
        senderName: viewerDoc.firstname,
        senderPicture: viewerDoc.picture,
        isProUser: viewerDoc.tier === "pro",
        isViewerProOrGracePeriod:
          viewerDoc.tier === "pro" || isViewerInGracePeriod,
      },
    });

    if (notificationId) {
      console.log(`🔔 Notification created with ID: ${notificationId}`);
    } else {
      console.log(
        `🔕 Notification was not created - check viewer restrictions or recipient settings`
      );
    }

    return {
      success: true,
      notificationId,
      message: "Profile view tracked successfully",
    };
  },
});

export const getNotificationSettings = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = args;

    const settings = await ctx.db
      .query("notificationSettings")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!settings) {
      return {
        userId: userId,
        ...DEFAULT_NOTIFICATION_SETTINGS,
      };
    }

    return settings;
  },
});

// convex/controllers/notifications.ts
export const updateNotificationSettings = mutation({
  args: {
    userId: v.string(),
    settings: v.object({
      // Profile & Social
      profileViews: v.boolean(),
      likes: v.boolean(),
      shares: v.boolean(),
      reviews: v.boolean(),
      followRequests: v.boolean(),
      comments: v.boolean(),

      // Gigs & Bookings (ADD ALL NEW FIELDS)
      gigInvites: v.boolean(),
      gigOpportunities: v.boolean(), // NEW FIELD
      gigUpdates: v.boolean(), // NEW FIELD
      bookingRequests: v.boolean(),
      bookingConfirmations: v.boolean(),
      gigReminders: v.boolean(),
      bandInvites: v.boolean(), // NEW FIELD

      // Messages & Communication
      newMessages: v.boolean(),
      messageRequests: v.boolean(),

      // System & Updates
      systemUpdates: v.boolean(),
      featureAnnouncements: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const { userId, settings } = args;

    const existing = await ctx.db
      .query("notificationSettings")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      // Update with the full settings object
      await ctx.db.patch(existing._id, settings);
    } else {
      // Create new settings with the provided full object
      await ctx.db.insert("notificationSettings", {
        userId,
        ...settings,
      });
    }

    return { success: true };
  },
});

export const createNotification = mutation({
  args: {
    userId: v.string(),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    image: v.optional(v.string()),
    actionUrl: v.optional(v.string()),
    relatedUserId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { userId, type, ...rest } = args;

    // Check user's notification settings using centralized mapping
    const notificationSettings = await ctx.db
      .query("notificationSettings")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    const settingKey =
      NOTIFICATION_TYPE_TO_SETTING_MAP[
        type as keyof typeof NOTIFICATION_TYPE_TO_SETTING_MAP
      ];

    // Only create notification if setting is enabled
    const shouldCreate =
      !notificationSettings ||
      !settingKey ||
      notificationSettings[settingKey] !== false;

    if (shouldCreate) {
      const notificationId = await ctx.db.insert("notifications", {
        userId,
        type,
        ...rest,
        isRead: false,
        isArchived: false,
        createdAt: Date.now(),
      });

      return notificationId;
    }

    return null;
  },
});

export const getUserNotifications = query({
  args: {
    clerkId: v.string(),
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { clerkId, limit = 50, unreadOnly = false } = args;

    let query = ctx.db
      .query("notifications")
      .withIndex("by_user_id", (q) => q.eq("userId", clerkId));

    if (unreadOnly) {
      query = query.filter((q) => q.eq(q.field("isRead"), false));
    }

    const notifications = await query.order("desc").take(limit);

    return notifications;
  },
});

export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
    read: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { notificationId, read } = args;

    await ctx.db.patch(notificationId, {
      isRead: read,
      ...(read && { readAt: Date.now() }),
    });

    return { success: true };
  },
});

export const markAllAsRead = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const { clerkId } = args;

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) => q.eq("userId", clerkId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    await Promise.all(
      unreadNotifications.map((notification) =>
        ctx.db.patch(notification._id, {
          isRead: true,
          readAt: Date.now(),
        })
      )
    );

    return { success: true, count: unreadNotifications.length };
  },
});

export const getUnreadCount = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const { clerkId } = args;

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) => q.eq("userId", clerkId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    return unreadNotifications.length;
  },
});
