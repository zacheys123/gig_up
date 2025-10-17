// convex/models/notificationsModel.ts
import { defineTable } from "convex/server";
import { notificationModelSchema } from "../notificationsTypes";

export const notificationModel = defineTable(notificationModelSchema)
  .index("by_user_id", ["userId"])
  .index("by_user_unread", ["userId", "isRead"])
  .index("by_user_created", ["userId", "createdAt"])
  .index("by_created", ["createdAt"])
  .index("by_type", ["type"])
  .index("by_related_user", ["relatedUserId"]);
