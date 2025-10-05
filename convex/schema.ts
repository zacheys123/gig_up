// convex/schema.ts
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
    
    // User roles and status
    isMusician: v.boolean(),
    isClient: v.boolean(),
    isAdmin: v.boolean(),
    isBanned: v.boolean(),
    
    // Social features
    followers: v.array(v.id("users")),
    followings: v.array(v.id("users")),
    refferences: v.array(v.string()),
    
    // Arrays for various features
    musicianhandles: v.array(v.string()),
    musiciangenres: v.array(v.string()),
    savedGigs: v.array(v.id("gigs")),
    favoriteGigs: v.array(v.id("gigs")),
    likedVideos: v.array(v.string()),
    bookingHistory: v.array(v.id("gigs")),
    
    // Business and subscription
    tier: v.union(v.literal("free"), v.literal("pro")),
    tierStatus: v.optional(v.union(
      v.literal("active"),
      v.literal("pending"),
      v.literal("canceled"),
      v.literal("expired")
    )),
    earnings: v.number(),
    totalSpent: v.number(),
    nextBillingDate: v.optional(v.number()),
    
    // Monthly stats
    monthlyGigsPosted: v.number(),
    monthlyMessages: v.number(),
    monthlyGigsBooked: v.number(),
    
    // Counters
    completedGigsCount: v.number(),
    reportsCount: v.number(),
    cancelgigCount: v.number(),
    renewalAttempts: v.number(),
    
    // Weekly booking stats
    gigsBookedThisWeek: v.object({
      count: v.number(),
      weekStart: v.number(),
    }),
    
    // UI/UX preferences
    theme: v.union(v.literal("lightMode"), v.literal("darkMode"), v.literal("system")),
    firstLogin: v.boolean(),
    onboardingComplete: v.boolean(),
    firstTimeInProfile: v.boolean(),
    
    // Admin
    adminPermissions: v.array(v.string()),
    
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
  .index("by_tier", ["tier"])
  .index("by_instrument", ["instrument"]),
  
  // Reviews table
  reviews: defineTable({
    postedBy: v.id("users"),
    postedTo: v.id("users"),
    rating: v.number(),
    comment: v.optional(v.string()),
    gigId: v.optional(v.id("gigs")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_postedTo", ["postedTo"])
  .index("by_postedBy", ["postedBy"])
  .index("by_gig", ["gigId"]),
  
  // User videos table
  userVideos: defineTable({
    userId: v.id("users"),
    url: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    createdAt: v.number(),
  })
  .index("by_user", ["userId"]),
  
  // Bookings table
  bookings: defineTable({
    userId: v.id("users"),
    gigId: v.id("gigs"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    date: v.number(),
    role: v.string(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_user", ["userId"])
  .index("by_gig", ["gigId"])
  .index("by_status", ["status"]),
  
  // Gigs table
  gigs: defineTable({
    title: v.string(),
    description: v.string(),
    authorId: v.id("users"),
    location: v.optional(v.string()),
    date: v.optional(v.number()),
    budget: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("filled"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_author", ["authorId"])
  .index("by_status", ["status"]),
});