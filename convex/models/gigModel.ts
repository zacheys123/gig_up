import { defineTable } from "convex/server";
import { v } from "convex/values";

export const gigModel = defineTable({
  // Basic gig info
  postedBy: v.id("users"),
  bookedBy: v.optional(v.id("users")),
  title: v.string(),
  secret: v.string(),
  description: v.optional(v.string()),
  phone: v.optional(v.string()),
  price: v.optional(v.number()),
  category: v.optional(v.string()),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
  isPublic: v.boolean(),
  tags: v.array(v.string()),
  requirements: v.array(v.string()),
  benefits: v.array(v.string()),
  // Categories and bands
  bandCategory: v.array(v.string()),
  bussinesscat: v.string(),
  interestedUsers: v.array(v.id("users")),
  appliedUsers: v.array(v.id("users")),
  // Location and timing
  location: v.optional(v.string()),
  date: v.number(), // Unix timestamp
  time: v.object({
    start: v.string(),
    end: v.string(),
  }),

  // Status flags
  isTaken: v.boolean(),
  isPending: v.boolean(),

  // Engagement metrics
  viewCount: v.array(v.id("users")),
  bookCount: v.array(v.id("users")),

  // Styling
  font: v.optional(v.string()),
  fontColor: v.optional(v.string()),
  backgroundColor: v.optional(v.string()),
  logo: v.string(),

  // Timeline
  gigtimeline: v.optional(v.string()),
  otherTimeline: v.optional(v.string()),
  day: v.optional(v.string()),

  // Musician-specific fields
  mcType: v.optional(v.string()),
  mcLanguages: v.optional(v.string()),
  djGenre: v.optional(v.string()),
  djEquipment: v.optional(v.string()),
  pricerange: v.optional(v.string()),
  currency: v.optional(v.string()),
  vocalistGenre: v.array(v.string()),
  scheduleDate: v.optional(v.number()),
  schedulingProcedure: v.optional(v.string()),
  // Booking history
  bookingHistory: v.array(
    v.object({
      userId: v.id("users"),
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
  ),

  // Payment info
  paymentStatus: v.union(
    v.literal("pending"),
    v.literal("paid"),
    v.literal("refunded")
  ),
  cancellationReason: v.optional(v.string()),

  // Payment confirmation
  musicianConfirmPayment: v.optional(
    v.object({
      gigId: v.id("gigs"),
      confirmPayment: v.boolean(),
      confirmedAt: v.optional(v.number()),
      code: v.optional(v.string()),
      temporaryConfirm: v.optional(v.boolean()),
    })
  ),
  clientConfirmPayment: v.optional(
    v.object({
      gigId: v.id("gigs"),
      confirmPayment: v.boolean(),
      confirmedAt: v.optional(v.number()),
      code: v.optional(v.string()),
      temporaryConfirm: v.optional(v.boolean()),
    })
  ),

  // Rating
  gigRating: v.number(),

  // Timestamps (automatically added by Convex)
})
  .index("by_postedBy", ["postedBy"])
  .index("by_bookedBy", ["bookedBy"])
  .index("by_category", ["category"])
  .index("by_isTaken", ["isTaken"])
  .index("by_date", ["date"])
  .index("by_location", ["location"]);
