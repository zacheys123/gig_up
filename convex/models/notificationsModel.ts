// convex/models/notificationsModel.ts
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const notificationTypes = [
  "profile_view",
  "new_message",
  "gig_application",
  "gig_approved",
  "gig_rejected",
  "new_follower",
  "review_received",
  "system_alert",
] as const;

export const notificationModel = defineTable({
  // Target user (who receives the notification)
  userId: v.string(), // clerkId of the recipient
  type: v.union(...(notificationTypes.map((t) => v.literal(t)) as any)),

  // Notification content
  title: v.string(),
  message: v.string(),
  image: v.optional(v.string()),

  // Action data
  actionUrl: v.optional(v.string()), // Where clicking the notification goes
  actionLabel: v.optional(v.string()),

  // Related entities
  relatedUserId: v.optional(v.string()), // clerkId of user who triggered
  relatedGigId: v.optional(v.string()),
  relatedMessageId: v.optional(v.string()),

  // Status
  isRead: v.boolean(),
  isArchived: v.boolean(),

  // Timestamps
  createdAt: v.number(),
  readAt: v.optional(v.number()),
})
  .index("by_user_id", ["userId"])
  .index("by_user_unread", ["userId", "isRead"])
  .index("by_user_created", ["userId", "createdAt"])
  .index("by_created", ["createdAt"]);
