import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    // Basic identification
    clerkId: v.string(),
    email: v.string(),
    username: v.string(),
    
    // Profile information
    picture: v.optional(v.string()),
    firstname: v.optional(v.string()),
    lastname: v.optional(v.string()),
    phone: v.optional(v.string()),
    
    // Location
    city: v.optional(v.string()),
    address: v.optional(v.string()),
    
    // Musical profile
    instrument: v.optional(v.string()),
    experience: v.optional(v.string()),
    roleType: v.optional(v.string()),
    bio: v.optional(v.string()),
    
    // User roles
    isMusician: v.boolean(),
    isClient: v.boolean(),
    isAdmin: v.boolean(),
    
    // Social features (simplified)
    followers: v.array(v.id("users")),
    followings: v.array(v.id("users")),
    
    // Business
    tier: v.union(v.literal("free"), v.literal("pro")),
    earnings: v.number(),
    
    // Activity
    completedGigsCount: v.number(),
    
    // Preferences
    theme: v.union(v.literal("lightMode"), v.literal("darkMode"), v.literal("system")),
    
    // Timestamps
    lastActive: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_clerkId", ["clerkId"])
  .index("by_email", ["email"])
  .index("by_username", ["username"])
  .index("by_city", ["city"])
  .index("by_isMusician", ["isMusician"])
  .index("by_tier", ["tier"]),
  
  // Separate tables for complex data (better approach)
  reviews: defineTable({
    postedBy: v.id("users"),
    postedTo: v.id("users"),
    rating: v.number(),
    comment: v.optional(v.string()),
    gigId: v.optional(v.id("gigs")),
    createdAt: v.number(),
  })
  .index("by_postedTo", ["postedTo"])
  .index("by_postedBy", ["postedBy"])
  .index("by_gig", ["gigId"]),
  
  userVideos: defineTable({
    userId: v.id("users"),
    url: v.string(),
    createdAt: v.number(),
  })
  .index("by_user", ["userId"]),
  
  bookings: defineTable({
    userId: v.id("users"),
    gigId: v.id("gigs"),
    status: v.union(
      v.literal("pending"),
      v.literal("booked"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    date: v.number(),
    role: v.string(),
    notes: v.optional(v.string()),
  })
  .index("by_user", ["userId"])
  .index("by_gig", ["gigId"])
  .index("by_status", ["status"]),
  
  gigs: defineTable({
    title: v.string(),
    description: v.string(),
    authorId: v.id("users"),
    // ... other gig fields
  })
  .index("by_author", ["authorId"]),
  
  videos: defineTable({
    title: v.string(),
    url: v.string(),
    uploaderId: v.id("users"),
    // ... other video fields
  })
  .index("by_uploader", ["uploaderId"]),
});