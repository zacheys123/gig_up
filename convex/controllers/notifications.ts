// convex/notifications.ts
import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { query } from "../_generated/server";
import { createNotificationInternal } from "../createNotificationInternal";

// NOTIFICATION TYPE TO SETTINGS MAPPING
// convex/notifications.ts - FIX THE MAPPING
// convex/notifications.ts - UPDATE THE MAPPING
export const notificationTypeToSettingMap = {
  // Profile & Social
  profile_view: "profileViews",
  new_follower: "followRequests", // All follower activities
  follow_request: "followRequests", // All follower activities
  follow_accepted: "followRequests", // All follower activities
  like: "profileViews", // Social interactions
  new_review: "profileViews", // Social interactions
  review_received: "profileViews", // Social interactions
  share: "profileViews", // Social interactions

  // Messages & Communication
  new_message: "newMessages",

  // Gigs & Bookings
  gig_invite: "gigInvites",
  gig_application: "bookingRequests", // Applications become booking requests
  gig_approved: "bookingConfirmations",
  gig_rejected: "bookingRequests", // Rejections are booking requests
  gig_cancelled: "bookingRequests", // Cancellations are booking requests
  gig_reminder: "gigReminders",

  // System
  system_alert: "systemUpdates",
} as const;
const recentViews = new Map<string, number>(); // userId -> timestamp

export const trackProfileView = mutation({
  args: {
    viewedUserId: v.string(),
    viewerUserId: v.string(),
    isViewerInGracePeriod: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { viewedUserId, viewerUserId, isViewerInGracePeriod } = args;

    // Don't track self-views
    if (viewedUserId === viewerUserId) return;

    // ✅ DEBOUNCE: Check if this view happened recently (last 5 minutes)
    const viewKey = `${viewerUserId}-${viewedUserId}`;
    const lastViewTime = recentViews.get(viewKey);
    const currentTime = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (lastViewTime && currentTime - lastViewTime < fiveMinutes) {
      console.log(`Debounced profile view: ${viewerUserId} -> ${viewedUserId}`);
      return { success: false, reason: "debounced" };
    }

    // Update the recent views cache
    recentViews.set(viewKey, currentTime);

    // Clean up old entries (optional - to prevent memory leaks)
    if (recentViews.size > 1000) {
      for (const [key, timestamp] of recentViews.entries()) {
        if (currentTime - timestamp > fiveMinutes) {
          recentViews.delete(key);
        }
      }
    }

    const [viewedUserDoc, viewerDoc] = await Promise.all([
      ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", viewedUserId))
        .first(),
      ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", viewerUserId))
        .first(),
    ]);

    if (!viewedUserDoc || !viewerDoc) {
      throw new Error("User not found");
    }

    // Check if viewer has already viewed this profile
    const viewerViewedProfiles = viewerDoc?.viewedProfiles || [];
    const hasAlreadyViewed = viewerViewedProfiles.includes(viewedUserId);

    if (hasAlreadyViewed) {
      console.log(`User ${viewerUserId} has already viewed ${viewedUserId}`);
      return { success: false, reason: "already_viewed" };
    }

    // Update viewed user's profile view count
    const currentViews = viewedUserDoc.profileViews || {
      totalCount: 0,
      recentViewers: [],
      lastUpdated: currentTime,
    };

    // Add viewer to recent viewers
    const newRecentViewers = [
      { userId: viewerUserId, timestamp: currentTime },
      ...currentViews.recentViewers.slice(0, 49),
    ];

    await ctx.db.patch(viewedUserDoc._id, {
      profileViews: {
        totalCount: currentViews.totalCount + 1,
        recentViewers: newRecentViewers,
        lastUpdated: currentTime,
      },
    });

    // Update viewer's viewedProfiles
    if (viewerDoc) {
      const viewedProfiles = viewerDoc.viewedProfiles || [];
      const updatedViewedProfiles = [
        viewedUserId,
        ...viewedProfiles.filter((id: string) => id !== viewedUserId),
      ].slice(0, 100);

      await ctx.db.patch(viewerDoc._id, {
        viewedProfiles: updatedViewedProfiles,
      });
    }

    // ✅ USE UPDATED HELPER FUNCTION
    const notificationId = await createNotificationInternal(ctx, {
      userId: viewedUserId, // RECIPIENT
      type: "profile_view",
      title: "Profile Viewed",
      message: `${viewerDoc.firstname || "Someone"} viewed your profile`,
      image: viewerDoc.picture,
      actionUrl: `/profile/${viewerUserId}`,
      relatedUserId: viewerUserId, // VIEWER
      isViewerInGracePeriod: isViewerInGracePeriod, // VIEWER'S grace period
      metadata: {
        senderId: viewerUserId,
        senderName: viewerDoc.firstname,
        senderPicture: viewerDoc.picture,
        senderEmail: viewerDoc.email,
        isProUser: viewerDoc.tier === "pro",
        isMusician: viewerDoc.isMusician,
        isClient: viewerDoc.isClient,
        instrument: viewerDoc.instrument,
        city: viewerDoc.city,
        roleType: viewerDoc.roleType,
        viewerId: viewerUserId,
        viewedUserId: viewedUserId,
        isViewerProOrGracePeriod:
          viewerDoc.tier === "pro" || isViewerInGracePeriod, // Track this for analytics
      },
    });

    return { success: true, notificationId };
  },
});

// Generic notification creation function using the mapping
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

    // Check user's notification settings
    const notificationSettings = await ctx.db
      .query("notificationSettings")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    const settingKey =
      notificationTypeToSettingMap[
        type as keyof typeof notificationTypeToSettingMap
      ];

    // Only create notification if setting is enabled (or if no setting exists, default to true)
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

// notifications settings

// In your getNotificationSettings query
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
      // Return default settings if none exist
      return {
        userId: userId,
        // Profile & Social
        profileViews: true,
        followRequests: true,

        // Gigs & Bookings
        gigInvites: true,
        bookingRequests: true,
        bookingConfirmations: true,
        gigReminders: true,

        // Messages & Communication
        newMessages: true,
        messageRequests: true,

        // System & Updates
        systemUpdates: true,
        featureAnnouncements: false,
        securityAlerts: true,

        // Marketing
        promotionalEmails: false,
        newsletter: false,
      };
    }

    return settings;
  },
});

// convex/notifications.ts - UPDATE THE MUTATION
export const updateNotificationSettings = mutation({
  args: {
    userId: v.string(),
    settings: v.object({
      // Profile & Social
      profileViews: v.boolean(),
      followRequests: v.boolean(),

      // Gigs & Bookings
      gigInvites: v.boolean(),
      bookingRequests: v.boolean(),
      bookingConfirmations: v.boolean(),
      gigReminders: v.boolean(),

      // Messages & Communication
      newMessages: v.boolean(),
      messageRequests: v.boolean(),

      // System & Updates
      systemUpdates: v.boolean(),
      featureAnnouncements: v.boolean(),
      securityAlerts: v.boolean(),

      // Marketing
      promotionalEmails: v.boolean(),
      newsletter: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const { userId, settings } = args;

    const existing = await ctx.db
      .query("notificationSettings")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, settings);
    } else {
      await ctx.db.insert("notificationSettings", {
        userId,
        ...settings,
      });
    }

    return { success: true };
  },
});
