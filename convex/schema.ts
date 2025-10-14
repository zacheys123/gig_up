// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { userModel } from "./models/userModel";
import { gigModel } from "./models/gigModel";
import { notificationModel } from "./models/notificationsModel"; // Make sure this path is correct

export default defineSchema({
  users: userModel,
  gigs: gigModel,
  notifications: notificationModel,

  // Other tables...
  aiSuggestions: defineTable({
    questions: v.object({
      musician: v.array(v.string()),
      client: v.array(v.string()),
      guest: v.array(v.string()),
    }),
    updatesReady: v.boolean(),
    version: v.string(),
    lastUpdated: v.number(),
  }),
  videos: defineTable({
    title: v.string(),
    url: v.string(),
  }),
});
