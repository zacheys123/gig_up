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

  // Client info
  clientId: v.id("users"),
  clientName: v.string(),

  // Target musician
  invitedMusicianId: v.id("users"),
  status: v.union(
    v.literal("pending"),
    v.literal("accepted"),
    v.literal("declined"),
    v.literal("deputy-suggested")
  ),

  // Timestamps
  createdAt: v.number(),
})
  .index("by_client", ["clientId"])
  .index("by_musician", ["invitedMusicianId"]);
