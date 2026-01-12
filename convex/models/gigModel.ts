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
const bandBookingEntry = v.object({
  bandRole: v.string(),
  bandRoleIndex: v.number(),
  userId: v.id("users"),
  userName: v.string(), // Cache name for display

  // Application phase
  appliedAt: v.number(),
  applicationNotes: v.optional(v.string()),
  applicationStatus: v.union(
    v.literal("pending_review"),
    v.literal("under_review"),
    v.literal("interview_scheduled"),
    v.literal("interview_completed")
  ),

  // Booking phase
  bookedAt: v.optional(v.number()),

  bookedPrice: v.optional(v.number()),
  contractSigned: v.optional(v.boolean()),

  // Completion phase
  completedAt: v.optional(v.number()),
  completionNotes: v.optional(v.string()),
  ratingGiven: v.optional(v.number()),
  reviewLeft: v.optional(v.string()),

  // Payment
  paymentStatus: v.optional(
    v.union(
      v.literal("pending"),
      v.literal("partial"),
      v.literal("paid"),
      v.literal("disputed"),
      v.literal("cancelled")
    )
  ),
  paymentAmount: v.optional(v.number()),
  paymentDate: v.optional(v.number()),
});
const bookingHistoryEntry = v.object({
  // Basic info
  entryId: v.string(),
  timestamp: v.number(),
  userId: v.id("users"),
  userRole: v.optional(v.string()),
  bandRole: v.optional(v.string()),
  bandRoleIndex: v.optional(v.number()),

  // Status & Actions - includes "updated" for tracking edits
  status: v.union(
    v.literal("applied"),
    v.literal("shortlisted"),
    v.literal("interviewed"),
    v.literal("offered"),
    v.literal("booked"),
    v.literal("confirmed"),
    v.literal("completed"),
    v.literal("cancelled"),
    v.literal("rejected"),
    v.literal("updated"), // For tracking gig updates
    v.literal("viewed") // ADD THIS LINE
  ),

  gigType: v.union(v.literal("regular"), v.literal("band")),
  proposedPrice: v.optional(v.number()),
  agreedPrice: v.optional(v.number()),
  currency: v.optional(v.string()),
  actionBy: v.id("users"),
  actionFor: v.optional(v.id("users")),
  notes: v.optional(v.string()),
  metadata: v.optional(v.any()),
  attachments: v.optional(v.array(v.string())),
  reason: v.optional(v.string()),
  refundAmount: v.optional(v.number()),
  refundStatus: v.optional(v.string()),
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

  bandCategory: v.optional(v.array(bandRoleSchema)),
  isClientBand: v.optional(v.boolean()), // true for "other" category
  bussinesscat: v.string(),
  // Location and timing
  location: v.optional(v.string()),
  date: v.number(), // Unix timestamp
  time: v.object({
    start: v.string(),
    end: v.string(),
    durationFrom: v.optional(v.string()), // Add this
    durationTo: v.optional(v.string()), // Add this
  }),

  // In your schema.ts, update the gigs table fields:
  bookedBandId: v.optional(v.id("bands")), // For band bookings
  bookedBandLeader: v.optional(v.id("users")), // Band leader/contact person
  // Status flags
  isTaken: v.boolean(),
  isPending: v.boolean(),
  // Separate histories for clarity
  bookingHistory: v.optional(v.array(bookingHistoryEntry)),
  bandBookingHistory: v.optional(v.array(bandBookingEntry)),

  bookCount: v.optional(
    v.array(
      v.object({
        bandId: v.id("bands"),
        appliedAt: v.number(),
        status: v.union(
          v.literal("applied"),
          v.literal("shortlisted"),
          v.literal("booked"),
          v.literal("rejected")
        ),
        appliedBy: v.id("users"),
        proposedFee: v.optional(v.number()),
        notes: v.optional(v.string()),
      })
    )
  ),

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
  acceptInterestStartTime: v.optional(v.number()), // When interest opens
  acceptInterestEndTime: v.optional(v.number()), // When interest closes
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
  shortlistedUsers: v.optional(
    v.array(
      v.object({
        userId: v.id("users"),
        shortlistedAt: v.number(),
        notes: v.optional(v.string()),
        status: v.optional(
          v.union(
            v.literal("active"),
            v.literal("booked"),
            v.literal("removed")
          )
        ),
        // Add these fields for band roles
        bandRole: v.optional(v.string()),
        bandRoleIndex: v.optional(v.number()),
        // Add this if you need to track bookedAt
        bookedAt: v.optional(v.number()),
      })
    )
  ),

  // Timestamps (automatically added by Convex)
})
  .index("by_postedBy", ["postedBy"])
  .index("by_bookedBy", ["bookedBy"])
  .index("by_category", ["category"])
  .index("by_isTaken", ["isTaken"])
  .index("by_date", ["date"])
  .index("by_location", ["location"]);
