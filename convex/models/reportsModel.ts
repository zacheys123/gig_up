import { defineTable } from "convex/server";
import { v } from "convex/values";

// convex/schema.ts
export const reports = defineTable({
  // Basic report info
  reporterId: v.string(), // User ID of the reporter
  reportedUserId: v.string(), // User ID of the reported user
  reason: v.string(), // Reason for the report
  additionalInfo: v.optional(v.string()), // Additional details
  status: v.union(
    v.literal("pending"),
    v.literal("reviewing"),
    v.literal("resolved"),
    v.literal("dismissed")
  ),

  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),

  // Resolution info
  resolvedBy: v.optional(v.string()), // Admin ID who resolved it
  resolutionNote: v.optional(v.string()),
  resolvedAt: v.optional(v.number()),

  // Metadata
  category: v.optional(v.string()), // You can categorize reports
  priority: v.optional(
    v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    )
  ),
})
  .index("by_reported_user", ["reportedUserId"])
  .index("by_reporter", ["reporterId"])
  .index("by_status", ["status"])
  .index("by_created_at", ["createdAt"])
  .index("by_reported_user_and_status", ["reportedUserId", "status"]);
