// convex/schemas/comments.ts
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const commentsModel = defineTable({
  // Basic comment info
  userId: v.string(), // clerkId of the comment author
  videoId: v.id("videos"),
  content: v.string(),

  // Optional parent comment for replies
  parentCommentId: v.optional(v.id("comments")),

  // Engagement metrics
  likes: v.number(),

  // Timestamps
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
})
  .index("by_videoId", ["videoId"])
  .index("by_userId", ["userId"])
  .index("by_parentCommentId", ["parentCommentId"])
  .index("by_createdAt", ["createdAt"])
  .index("by_videoId_createdAt", ["videoId", "createdAt"]);
