// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { userModel } from "./models/userModel";
import { gigModel } from "./models/gigModel";

export default defineSchema({
  users: userModel,

  // Other tables...
  gigs: gigModel,

  videos: defineTable({
    title: v.string(),
    url: v.string(),
  }),
});
