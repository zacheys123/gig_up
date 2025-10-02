import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    // Basic Clerk auth fields
    clerkId: v.string(),
    email: v.string(),
    
    // Personal information
    picture: v.optional(v.string()),
    firstname: v.optional(v.string()),
    lastname: v.optional(v.string()),
    username: v.string(),
    phone: v.optional(v.string()),
    
    // Location and demographics
    city: v.optional(v.string()),
    date: v.optional(v.string()),
    month: v.optional(v.string()),
    year: v.optional(v.string()),
    address: v.optional(v.string()),
    
    // Musical profile
    instrument: v.optional(v.string()),
    experience: v.optional(v.string()),
    roleType: v.optional(v.string()),
    bio: v.optional(v.string()),
    talentbio: v.optional(v.string()),
    
    // User types and roles
    isMusician: v.boolean(),
    isClient: v.boolean(),
    isAdmin: v.boolean(),
    adminRole: v.optional(v.union(
      v.literal("super"),
      v.literal("content"),
      v.literal("support"),
      v.literal("analytics")
    )),
    
    // Social features
    followers: v.array(v.id("users")),
    followings: v.array(v.id("users")),
    refferences: v.array(v.id("users")),
    
    // Reviews system
    allreviews: v.array(v.object({
      _id: v.string(),
      postedBy: v.id("users"),
      postedTo: v.id("users"),
      rating: v.optional(v.number()),
      comment: v.optional(v.string()),
      gigId: v.optional(v.id("gigs")),
      videoId: v.optional(v.array(v.id("videos"))),
      updatedAt: v.optional(v.number()),
      createdAt: v.optional(v.number()),
    })),
    
    myreviews: v.array(v.object({
      _id: v.string(),
      postedBy: v.id("users"),
      postedTo: v.id("users"),
      rating: v.optional(v.number()),
      comment: v.optional(v.string()),
      gigId: v.optional(v.id("gigs")),
      videoId: v.optional(v.array(v.id("videos"))),
      updatedAt: v.optional(v.number()),
      createdAt: v.optional(v.number()),
    })),
    
    // Media and content
    videosProfile: v.array(v.object({
      _id: v.string(),
      url: v.string(),
      createdAt: v.optional(v.number()),
    })),
    
    // Music-specific fields
    organization: v.optional(v.string()),
    handles: v.optional(v.string()),
    genres: v.optional(v.string()),
    djGenre: v.optional(v.string()),
    djEquipment: v.optional(v.string()),
    mcType: v.optional(v.string()),
    mcLanguages: v.optional(v.string()),
    vocalistGenre: v.optional(v.string()),
    
    musicianhandles: v.array(v.object({
      platform: v.string(),
      handle: v.string(),
    })),
    musiciangenres: v.array(v.string()),
    
    // Pricing and rates
    rate: v.optional(v.object({
      regular: v.optional(v.string()),
      function: v.optional(v.string()),
      concert: v.optional(v.string()),
      corporate: v.optional(v.string()),
    })),
    
    // Business and monetization
    tier: v.union(v.literal("free"), v.literal("pro")),
    earnings: v.number(),
    totalSpent: v.number(),
    tierStatus: v.optional(v.union(
      v.literal("active"),
      v.literal("pending"),
      v.literal("canceled"),
      v.literal("expired")
    )),
    
    // Activity tracking
    monthlyGigsPosted: v.number(),
    monthlyMessages: v.number(),
    monthlyGigsBooked: v.number(),
    completedGigsCount: v.number(),
    reportsCount: v.number(),
    cancelgigCount: v.number(),
    
    // Gig management
    savedGigs: v.array(v.id("gigs")),
    favoriteGigs: v.array(v.id("gigs")),
    likedVideos: v.array(v.id("videos")),
    
    // Booking system
    bookingHistory: v.array(v.object({
      userId: v.array(v.id("users")),
      gigId: v.array(v.id("gigs")),
      status: v.union(
        v.literal("pending"),
        v.literal("booked"),
        v.literal("completed"),
        v.literal("cancelled")
      ),
      date: v.number(),
      role: v.string(),
      notes: v.optional(v.string()),
    })),
    
    gigsBookedThisWeek: v.object({
      count: v.number(),
      weekStart: v.number(),
    }),
    
    // User preferences and state
    theme: v.union(v.literal("lightMode"), v.literal("darkMode"), v.literal("system")),
    firstLogin: v.boolean(),
    onboardingComplete: v.boolean(),
    firstTimeInProfile: v.boolean(),
    
    // Security and moderation
    isBanned: v.boolean(),
    banReason: v.optional(v.string()),
    bannedAt: v.optional(v.number()),
    banExpiresAt: v.optional(v.number()),
    banReference: v.optional(v.string()),
    
    // Payment information
    mpesaPhoneNumber: v.optional(v.string()),
    renewalAttempts: v.number(),
    lastRenewalAttempt: v.optional(v.number()),
    
    // Admin fields
    adminPermissions: v.array(v.string()),
    lastAdminAction: v.optional(v.number()),
    adminNotes: v.optional(v.string()),
    
    // Timestamps
    lastActive: v.number(),
    lastBookingDate: v.optional(v.number()),
    nextBillingDate: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_clerkId", ["clerkId"])
  .index("by_email", ["email"])
  .index("by_username", ["username"])
  .index("by_tier", ["tier"])
  .index("by_city", ["city"])
  .index("by_instrument", ["instrument"])
  .index("by_isMusician", ["isMusician"])
  .index("by_isClient", ["isClient"])
  .index("by_isAdmin", ["isAdmin"])
  .index("by_isBanned", ["isBanned"])
  .index("by_lastActive", ["lastActive"])
  .index("by_createdAt", ["createdAt"])
  .index("by_tier_status", ["tier", "tierStatus"])
  .index("by_city_musician", ["city", "isMusician"])
  .index("by_completed_gigs", ["completedGigsCount"])
  .index("by_earnings", ["earnings"]),
  
  // Your other tables will go here...
  gigs: defineTable({
    // Gig schema will go here
    title: v.string(),
    description: v.string(),
    // ... other gig fields
  }),
  
  videos: defineTable({
    // Video schema will go here
    title: v.string(),
    url: v.string(),
    // ... other video fields
  }),
  
}).auth();