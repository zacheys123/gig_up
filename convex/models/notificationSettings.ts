// convex/models/notificationSettingsModel.ts
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const notificationSettingsModel = defineTable({
  // User who owns these settings
  userId: v.string(), // clerkId

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
}).index("by_user_id", ["userId"]);
