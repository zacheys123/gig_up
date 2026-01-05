import { defineTable } from "convex/server";
import { v } from "convex/values";
const bandMember = v.object({
  userId: v.id("users"), // Reference to the user
  name: v.string(), // Display name
  role: v.string(), // Role: "pianist", "guitarist", "vocalist", etc.
  joinedAt: v.number(), // Timestamp when they joined
});
// In your Convex schema (where bandRoleSchema is defined):
const bandRoleSchema = v.object({
  role: v.string(),
  maxSlots: v.number(),
  filledSlots: v.number(),
  applicants: v.array(v.id("users")),
  bookedUsers: v.array(v.id("users")),
  requiredSkills: v.optional(v.array(v.string())),
  description: v.optional(v.string()),
  isLocked: v.optional(v.boolean()),
  // Add price fields
  price: v.optional(v.number()), // Price per slot
  currency: v.optional(v.string()), // Currency code
  negotiable: v.optional(v.boolean()), // Whether price is negotiable
  bookedPrice: v.optional(v.number()), // Actual price agreed upon
});
const bookingHistoryEntry = v.object({
  userId: v.id("users"),
  status: v.union(
    v.literal("pending"),
    v.literal("booked"),
    v.literal("completed"),
    v.literal("cancelled")
  ),
  timestamp: v.number(), // Use timestamp instead of date
  role: v.string(),
  notes: v.optional(v.string()),
  price: v.optional(v.number()),
  bookedBy: v.optional(v.id("users")),
  action: v.optional(v.string()),
  gigType: v.optional(v.union(v.literal("regular"), v.literal("band"))),
  metadata: v.optional(v.any()),
});
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

  // In convex/schema.ts

  // In gigModel:
  bandCategory: v.optional(v.array(bandRoleSchema)),
  isClientBand: v.optional(v.boolean()), // true for "other" category
  bussinesscat: v.string(),
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
  bookingHistory: v.optional(v.array(bookingHistoryEntry)),

  // Fixed: bookCount type
  bookCount: v.optional(v.array(bandMember)),

  // Fixed: interestedUsers should be optional
  interestedUsers: v.optional(v.array(v.id("users"))),

  // Fixed: appliedUsers should be optional
  appliedUsers: v.optional(v.array(v.id("users"))),

  // Fixed: viewCount should be optional
  viewCount: v.optional(v.array(v.id("users"))),

  // Add maxSlots field
  maxSlots: v.optional(v.number()),
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
  vocalistGenre: v.optional(v.array(v.string())),
  scheduleDate: v.optional(v.number()),
  schedulingProcedure: v.optional(v.string()),
  // Booking history
  cancelledAt: v.optional(v.number()),
  cancelledBy: v.optional(v.string()),
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
      finalizedAt: v.optional(v.number()),
    })
  ),
  finalizationNote: v.optional(v.string()),
  clientConfirmPayment: v.optional(
    v.object({
      gigId: v.id("gigs"),
      confirmPayment: v.boolean(),
      confirmedAt: v.optional(v.number()),
      code: v.optional(v.string()),
      temporaryConfirm: v.optional(v.boolean()),
      finalizedAt: v.optional(v.number()),
    })
  ),
  negotiable: v.optional(v.boolean()),
  // Rating
  gigRating: v.number(),
  finalizedBy: v.optional(v.union(v.literal("client"), v.literal("musician"))),

  // Timestamps (automatically added by Convex)
})
  .index("by_postedBy", ["postedBy"])
  .index("by_bookedBy", ["bookedBy"])
  .index("by_category", ["category"])
  .index("by_isTaken", ["isTaken"])
  .index("by_date", ["date"])
  .index("by_location", ["location"]);
