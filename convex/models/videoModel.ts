import { defineTable } from "convex/server";
import { v } from "convex/values";

export const videoModel = defineTable({
  // Basic video info
  userId: v.string(), // clerkId of the user who uploaded
  title: v.string(),
  description: v.string(),
  url: v.string(),
  thumbnail: v.optional(v.string()),
  duration: v.number(),
  isPublic: v.boolean(), // CHANGED: Remove optional, should always have a value

  // Video type classification
  videoType: v.union(
    v.literal("profile"), // Showcase talent for profile
    v.literal("gig"), // Recording from a gig
    v.literal("casual"), // Casual/post-gig video
    v.literal("promo"), // Promotional content
    v.literal("other") // Other types
  ),
  isProfileVideo: v.boolean(), // Quick filter flag

  // Optional gig reference
  gigId: v.optional(v.string()), // Reference to specific gig if applicable
  gigName: v.optional(v.string()), // Gig name for display

  // Tags and categorization
  tags: v.array(v.string()),

  // Engagement metrics
  views: v.number(),
  likes: v.number(),

  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_isPublic", ["isPublic"])
  .index("by_videoType", ["videoType"])
  .index("by_isProfileVideo", ["isProfileVideo"])
  .index("by_userId_and_profile", ["userId", "isProfileVideo"]) // For profile videos specifically
  .index("by_createdAt", ["createdAt"])
  .index("by_views", ["views"])
  .index("by_likes", ["likes"])
  .index("by_gigId", ["gigId"]); // For gig-related videos
