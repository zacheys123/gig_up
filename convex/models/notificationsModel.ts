// convex/models/notificationsModel.ts
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const notificationTypes = [
  "profile_view",
  "new_message",
  "gig_invite",
  "gig_application",
  "gig_approved",
  "gig_rejected",
  "gig_cancelled",
  "gig_reminder",
  "new_follower",

  "follow_accepted",
  "new_review",
  "like",
  "share",
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
  actionUrl: v.optional(v.string()),
  actionLabel: v.optional(v.string()),

  // Related entities
  relatedUserId: v.optional(v.string()),
  relatedGigId: v.optional(v.string()),
  relatedMessageId: v.optional(v.string()),

  // Metadata
  metadata: v.optional(
    v.object({
      // Sender information
      senderId: v.optional(v.string()),
      senderName: v.optional(v.string()),
      senderPicture: v.optional(v.string()),
      senderEmail: v.optional(v.string()),

      // Gig information
      gigTitle: v.optional(v.string()),

      // Social information
      targetEntityType: v.optional(v.string()),
      targetEntityId: v.optional(v.string()),
      targetEntityTitle: v.optional(v.string()),

      // Additional context
      isProUser: v.optional(v.boolean()),
      isGroup: v.optional(v.boolean()),

      // User profile fields
      tier: v.optional(v.string()),
      tierStatus: v.optional(v.string()),
      isMusician: v.optional(v.boolean()),
      isClient: v.optional(v.boolean()),
      instrument: v.optional(v.string()),
      city: v.optional(v.string()),
      roleType: v.optional(v.string()),

      // Backward compatibility
      viewerId: v.optional(v.string()),
      viewedUserId: v.optional(v.string()),

      // Message-specific fields
      chatId: v.optional(v.string()),
      messageId: v.optional(v.string()),
      fullMessage: v.optional(v.string()),

      // Application-specific fields
      applicationId: v.optional(v.string()),
    })
  ),

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
  .index("by_created", ["createdAt"])
  .index("by_type", ["type"])
  .index("by_related_user", ["relatedUserId"]);
