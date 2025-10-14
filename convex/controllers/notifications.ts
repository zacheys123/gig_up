// convex/controllers/notifications.ts
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const createNotification = mutation({
  args: {
    userId: v.string(), // recipient clerkId
    type: v.union(
      v.literal("profile_view"),
      v.literal("new_message"),
      v.literal("gig_application"),
      v.literal("gig_approved"),
      v.literal("gig_rejected"),
      v.literal("new_follower"),
      v.literal("review_received"),
      v.literal("system_alert")
    ),
    title: v.string(),
    message: v.string(),
    image: v.optional(v.string()),
    actionUrl: v.optional(v.string()),
    actionLabel: v.optional(v.string()),
    relatedUserId: v.optional(v.string()),
    relatedGigId: v.optional(v.string()),
    relatedMessageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const {
      userId,
      type,
      title,
      message,
      image,
      actionUrl,
      actionLabel,
      relatedUserId,
      relatedGigId,
      relatedMessageId,
    } = args;

    // Check if user has pro tier to receive profile view notifications
    if (type === "profile_view") {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
        .first();

      if (!user || user.tier !== "pro") {
        return null; // Only pro users get profile view notifications
      }
    }

    // Create notification
    const notificationId = await ctx.db.insert("notifications", {
      userId,
      type,
      title,
      message,
      image,
      actionUrl,
      actionLabel,
      relatedUserId,
      relatedGigId,
      relatedMessageId,
      isRead: false,
      isArchived: false,
      createdAt: Date.now(),
    });

    return notificationId;
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
