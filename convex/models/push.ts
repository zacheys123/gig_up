import { defineTable } from "convex/server";
import { v } from "convex/values";

export const pushSubscriptions = defineTable({
  userId: v.string(),
  subscription: v.any(), // The PushSubscription object
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_user_id", ["userId"])
  .index("by_created_at", ["createdAt"]);
