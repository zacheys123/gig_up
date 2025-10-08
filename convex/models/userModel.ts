import { defineTable } from "convex/server";
import { v } from "convex/values";

export const userModel = defineTable({
  // Basic user info
  clerkId: v.string(),
  picture: v.optional(v.string()),
  firstname: v.optional(v.string()),
  lastname: v.optional(v.string()),
  email: v.string(),
  city: v.optional(v.string()),
  date: v.optional(v.string()),
  month: v.optional(v.string()),
  year: v.optional(v.string()),
  address: v.optional(v.string()),
  phone: v.optional(v.string()),
  verification: v.optional(v.string()),
  username: v.string(),

  // Role and type
  isMusician: v.boolean(),
  isClient: v.boolean(),
  isAdmin: v.boolean(),
  adminRole: v.optional(
    v.union(
      v.literal("super"),
      v.literal("content"),
      v.literal("support"),
      v.literal("analytics")
    )
  ),
  adminPermissions: v.optional(v.array(v.string())),
  adminNotes: v.optional(v.string()),

  // Musician specific fields
  instrument: v.optional(v.string()),
  experience: v.optional(v.string()),
  roleType: v.optional(v.string()),
  djGenre: v.optional(v.string()),
  djEquipment: v.optional(v.string()),
  mcType: v.optional(v.string()),
  mcLanguages: v.optional(v.string()),
  vocalistGenre: v.optional(v.string()),
  talentbio: v.optional(v.string()),

  // Client specific fields
  organization: v.optional(v.string()),

  // Profile and social
  bio: v.optional(v.string()),
  handles: v.optional(v.string()),
  genres: v.optional(v.string()),
  musiciangenres: v.optional(v.array(v.string())),
  musicianhandles: v.optional(
    v.array(
      v.object({
        platform: v.string(),
        handle: v.string(),
      })
    )
  ),

  // Videos and media
  videosProfile: v.optional(
    v.array(
      v.object({
        _id: v.string(),
        url: v.string(),
        title: v.string(),
        createdAt: v.optional(v.number()),
      })
    )
  ),

  // Reviews - MAKE THESE OPTIONAL
  allreviews: v.optional(
    v.array(
      v.object({
        _id: v.string(),
        postedBy: v.string(), // user ID
        postedTo: v.string(), // user ID
        rating: v.optional(v.number()),
        comment: v.optional(v.string()),
        gigId: v.optional(v.string()), // gig ID
        updatedAt: v.optional(v.number()),
        createdAt: v.optional(v.number()),
      })
    )
  ),

  myreviews: v.optional(
    v.array(
      v.object({
        _id: v.string(),
        postedBy: v.string(), // user ID
        postedTo: v.string(), // user ID
        rating: v.optional(v.number()),
        comment: v.optional(v.string()),
        gigId: v.optional(v.string()), // gig ID
        videoId: v.optional(v.array(v.string())), // video IDs
        updatedAt: v.optional(v.number()),
        createdAt: v.optional(v.number()),
      })
    )
  ),

  // Social connections - MAKE THESE OPTIONAL
  followers: v.optional(v.array(v.string())), // user IDs
  followings: v.optional(v.array(v.string())), // user IDs
  refferences: v.optional(v.array(v.string())), // user IDs

  // Business and billing
  tier: v.union(v.literal("free"), v.literal("pro")),
  tierStatus: v.optional(
    v.union(
      v.literal("active"),
      v.literal("pending"),
      v.literal("canceled"),
      v.literal("expired")
    )
  ),
  earnings: v.number(),
  totalSpent: v.number(),
  nextBillingDate: v.optional(v.number()),
  monthlyGigsPosted: v.number(),
  monthlyMessages: v.number(),
  monthlyGigsBooked: v.number(),

  // Gig management
  gigsBookedThisWeek: v.object({
    count: v.number(),
    weekStart: v.number(),
  }),
  lastBookingDate: v.optional(v.number()),
  cancelgigCount: v.number(),
  completedGigsCount: v.number(),

  // Booking history - MAKE OPTIONAL
  bookingHistory: v.optional(
    v.array(
      v.object({
        userId: v.array(v.string()), // user IDs
        gigId: v.array(v.string()), // gig IDs
        status: v.string(),
        date: v.number(),
        role: v.string(),
        notes: v.optional(v.string()),
      })
    )
  ),

  // Rates
  rate: v.optional(
    v.object({
      regular: v.optional(v.string()),
      function: v.optional(v.string()),
      concert: v.optional(v.string()),
      corporate: v.optional(v.string()),
    })
  ),

  // Saved content - MAKE THESE OPTIONAL
  savedGigs: v.optional(v.array(v.string())), // gig IDs
  favoriteGigs: v.optional(v.array(v.string())), // gig IDs
  likedVideos: v.optional(v.array(v.string())), // video IDs

  // User status and activity
  firstLogin: v.boolean(),
  onboardingComplete: v.boolean(),
  lastActive: v.number(),
  isBanned: v.boolean(),
  banReason: v.string(),
  bannedAt: v.number(),
  banExpiresAt: v.optional(v.number()),
  banReference: v.optional(v.string()),

  // Reports and moderation
  reportsCount: v.number(),

  // UI and preferences
  theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),

  // First time flags
  firstTimeInProfile: v.optional(v.boolean()),

  // Payment info
  mpesaPhoneNumber: v.optional(v.string()),
  renewalAttempts: v.number(),
  lastRenewalAttempt: v.optional(v.number()),

  // Timestamps
  lastAdminAction: v.optional(v.number()),
})
  .index("by_clerkId", ["clerkId"])
  .index("by_email", ["email"])
  .index("by_username", ["username"])
  .index("by_city", ["city"])
  .index("by_is_musician", ["isMusician"])
  .index("by_is_client", ["isClient"])
  .index("by_is_admin", ["isAdmin"])
  .index("by_tier", ["tier"])
  .index("by_is_banned", ["isBanned"])
  .index("by_last_active", ["lastActive"])
  .index("by_city_and_role", ["city", "isMusician"])
  .index("by_admin_role", ["isAdmin", "adminRole"]);
