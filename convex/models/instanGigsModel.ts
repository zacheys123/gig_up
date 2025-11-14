import { defineTable } from "convex/server";
import { v } from "convex/values";

// convex/instantgigs.ts
export const instantGigs = defineTable({
  // Gig details
  title: v.string(),
  description: v.string(),
  date: v.string(),
  venue: v.string(),
  budget: v.string(),
  gigType: v.string(),
  duration: v.string(),
  fromTime: v.optional(v.string()),
  // Client info
  clientId: v.id("users"),
  clientName: v.string(),
  setlist: v.optional(v.string()),
  // Target musician
  invitedMusicianId: v.id("users"),
  musicianName: v.optional(v.string()),
  status: v.union(
    v.literal("pending"),
    v.literal("accepted"),
    v.literal("declined"),
    v.literal("deputy-suggested"),
    v.literal("cancelled")
  ),

  // Timestamps
  createdAt: v.number(),
})
  .index("by_client", ["clientId"])
  .index("by_musician", ["invitedMusicianId"]);
// convex/instantgigs.ts - SIMPLIFIED SCHEMA
export const instantGigsTemplate = defineTable({
  // Template details
  title: v.string(),
  description: v.string(),
  date: v.optional(v.string()),
  venue: v.optional(v.string()),
  budget: v.string(),
  gigType: v.string(),
  duration: v.string(),
  fromTime: v.optional(v.string()),
  setlist: v.optional(v.string()),
  icon: v.string(),

  // Client info
  clientId: v.id("users"),
  clientName: v.string(),

  // REMOVED: status field - templates are just templates!

  // Usage stats (optional - can track which templates you use most)
  timesUsed: v.number(),

  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_client", ["clientId"]);
// REMOVED: status-based indexes
