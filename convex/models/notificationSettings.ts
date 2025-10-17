// convex/models/notificationSettings.ts
import { defineTable } from "convex/server";
import { notificationSettingsSchema } from "../notificationsTypes";

export const notificationSettingsModel = defineTable(
  notificationSettingsSchema
).index("by_user_id", ["userId"]);
