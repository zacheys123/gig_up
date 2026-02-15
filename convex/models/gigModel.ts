import { defineTable } from "convex/server";
import { v } from "convex/values";

const bandMember = v.object({
  userId: v.id("users"), // Reference to the user
  name: v.string(), // Display name
  role: v.string(), // Role: "pianist", "guitarist", "vocalist", etc.
  joinedAt: v.number(), // Timestamp when they joined
});

// In your convex/gigs.ts schema file
const bandRoleSchema = v.object({
  role: v.string(),
  maxSlots: v.number(),
  filledSlots: v.number(),
  maxApplicants: v.optional(v.number()), // NEW: Maximum number of applicants allowed
  currentApplicants: v.optional(v.number()), // NEW: Count of current applicants
  applicants: v.array(v.id("users")),
  bookedUsers: v.array(v.id("users")),
  requiredSkills: v.optional(v.array(v.string())),
  description: v.optional(v.string()),
  isLocked: v.optional(v.boolean()),
  // Price fields
  price: v.optional(v.number()), // Price per slot
  currency: v.optional(v.string()), // Currency code
  negotiable: v.optional(v.boolean()), // Whether price is negotiable
  bookedPrice: v.optional(v.number()), // Actual price agreed upon
});

// In your gigs schema file (where you define the table)
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
    v.literal("interview_completed"),
    v.literal("withdrawn"), // ADD THIS
    v.literal("rejected"), // Optionally add this too
    v.literal("accepted"), // Optionally add this too
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
      v.literal("cancelled"),
      v.literal("refunded"), // Consider adding this too
    ),
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
  isBandRole: v.optional(v.boolean()),
  // Status & Actions
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
    v.literal("updated"),
    v.literal("viewed"),
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

const bandApplicationEntry = v.object({
  bandId: v.id("bands"),
  bandName: v.string(), // Store band name for quick access
  appliedAt: v.number(),
  appliedBy: v.id("users"), // Band representative who applied
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
    v.literal("updated"),
    v.literal("viewed"),
  ),

  // Band members who will perform if booked
  performingMembers: v.array(
    v.object({
      userId: v.id("users"),
      name: v.string(),
      role: v.string(),
      instrument: v.string(),
    }),
  ),

  // Application details
  proposedFee: v.optional(v.number()),
  notes: v.optional(v.string()),

  // Booking details (when status is "booked")
  bookedAt: v.optional(v.number()),
  agreedFee: v.optional(v.number()),
  contractSigned: v.optional(v.boolean()),

  // Shortlist info
  shortlistedAt: v.optional(v.number()),
  shortlistNotes: v.optional(v.string()),
});

export const gigModel = defineTable({
  // === BASIC GIG INFO ===
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

  // === BAND-RELATED FIELDS ===
  bandCategory: v.optional(v.array(bandRoleSchema)),
   previousBandCategory: v.optional(v.array(bandRoleSchema)),
  isClientBand: v.optional(v.boolean()), // true for "other" category
  bussinesscat: v.string(),

  // === LOCATION AND TIMING ===
  location: v.optional(v.string()),
  date: v.number(), // Unix timestamp
  time: v.object({
    start: v.string(),
    end: v.string(),
    durationFrom: v.optional(v.string()),
    durationTo: v.optional(v.string()),
  }),

  // === BAND BOOKINGS ===
  bookedBandId: v.optional(v.id("bands")), // For band bookings
  bookedBandLeader: v.optional(v.id("users")), // Band leader/contact person

  // === STATUS FLAGS ===
  // isTaken: true = gig is booked (all roles filled for bands)
  // isPending: false = NOT about interest/application status anymore
  // isActive: true = Gig is confirmed but not yet performed/paid (waiting for gig date)
  isTaken: v.boolean(),
  isPending: v.boolean(),

  // === BOOKING HISTORIES ===
  bookingHistory: v.optional(v.array(bookingHistoryEntry)),
  bandBookingHistory: v.optional(v.array(bandBookingEntry)),

  // === USER ENGAGEMENT ===
  bookCount: v.optional(v.array(bandApplicationEntry)),
  interestedUsers: v.optional(v.array(v.id("users"))),
  previousInterestedUsers: v.optional(v.array(v.id("users"))),
  appliedUsers: v.optional(v.array(v.id("users"))),
  viewCount: v.optional(v.array(v.id("users"))),

  // === BAND CHAT SYSTEM ===
  bandChatId: v.optional(v.id("chats")), // Links to crew chat for client-created bands
  crewChatSettings: v.optional(
    v.object({
      clientRole: v.union(v.literal("admin"), v.literal("member")), // Client's role in chat
      chatPermissions: v.object({
        canSendMessages: v.boolean(), // Everyone can send
        canAddMembers: v.boolean(), // Only admin can add
        canRemoveMembers: v.boolean(), // Only admin can remove
        canEditChatInfo: v.boolean(), // Only admin can edit
      }),
      createdBy: v.id("users"),
      createdAt: v.number(),
    }),
  ),

  // === GIG CAPACITY ===
  maxSlots: v.optional(v.number()),

  // === STYLING ===
  font: v.optional(v.string()),
  fontColor: v.optional(v.string()),
  backgroundColor: v.optional(v.string()),
  logo: v.string(),

  // === TIMELINE ===
  gigtimeline: v.optional(v.string()),
  otherTimeline: v.optional(v.string()),
  day: v.optional(v.string()),

  // === MUSICIAN-SPECIFIC FIELDS ===
  mcType: v.optional(v.string()),
  mcLanguages: v.optional(v.string()),
  djGenre: v.optional(v.string()),
  djEquipment: v.optional(v.string()),
  pricerange: v.optional(v.string()),
  currency: v.optional(v.string()),
  vocalistGenre: v.optional(v.array(v.string())),
  scheduleDate: v.optional(v.number()),
  schedulingProcedure: v.optional(v.string()),

  // === BOOKING TIMELINE ===
  bookedAt: v.optional(v.number()), // When gig was booked
  cancelledAt: v.optional(v.number()),
  cancelledBy: v.optional(v.string()),

  // === INTEREST PERIOD ===
  acceptInterestStartTime: v.optional(v.number()), // When interest opens
  acceptInterestEndTime: v.optional(v.number()), // When interest closes
  interestWindowDays: v.optional(v.number()),
  cancellationReason: v.optional(v.string()),

  // === PAYMENT CONFIRMATION SYSTEM (DUAL-CONFIRMATION) ===
  musicianConfirmPayment: v.optional(
    v.object({
      gigId: v.id("gigs"),
      confirmPayment: v.boolean(), // true = payment received, false = dispute
      confirmedAt: v.number(),
      paymentCode: v.string(), // M-Pesa transaction code (first 4-6 chars) or cash code
      fullTransactionId: v.optional(v.string()), // Full transaction ID for M-Pesa
      amountConfirmed: v.number(), // Amount they confirm receiving/sending
      paymentMethod: v.union(
        v.literal("mpesa"),
        v.literal("cash"),
        v.literal("bank"),
        v.literal("other"),
      ),
      temporaryConfirm: v.optional(v.boolean()),
      finalizedAt: v.optional(v.number()),
      verified: v.optional(v.boolean()), // Whether code was verified against other party
      notes: v.optional(v.string()),
    }),
  ),

  clientConfirmPayment: v.optional(
    v.object({
      gigId: v.id("gigs"),
      confirmPayment: v.boolean(),
      confirmedAt: v.number(),
      paymentCode: v.string(), // M-Pesa transaction code (first 4-6 chars) or cash code
      fullTransactionId: v.optional(v.string()),
      amountConfirmed: v.number(),
      paymentMethod: v.union(
        v.literal("mpesa"),
        v.literal("cash"),
        v.literal("bank"),
        v.literal("other"),
      ),
      temporaryConfirm: v.optional(v.boolean()),
      finalizedAt: v.optional(v.number()),
      verified: v.optional(v.boolean()),
      notes: v.optional(v.string()),
    }),
  ),

  // === PAYMENT STATUS ===
  paymentStatus: v.union(
    v.literal("pending"), // Waiting for payment
    v.literal("partial"), // Partial payment received
    v.literal("paid"), // Full payment confirmed
    v.literal("disputed"), // Payment disputed
    v.literal("refunded"), // Refund issued
    v.literal("verified_paid"), // Verified and paid (both confirmed with matching codes)
  ),

  // === FINALIZATION DETAILS ===
  finalizationNote: v.optional(v.string()),
  finalizedBy: v.optional(
    v.union(
      v.literal("client"),
      v.literal("musician"),
      v.literal("both"),
      v.literal("system"),
      v.literal("admin"),
    ),
  ),
  finalizedAt: v.optional(v.number()),

  // === PRICING ===
  negotiable: v.optional(v.boolean()),

  // === RATING ===
  gigRating: v.number(),

  // === SHORTLISTED USERS ===
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
            v.literal("removed"),
          ),
        ),
        bandRole: v.optional(v.string()),
        bandRoleIndex: v.optional(v.number()),
        bookedAt: v.optional(v.number()),
      }),
    ),
  ),
})
  .index("by_postedBy", ["postedBy"])
  .index("by_bookedBy", ["bookedBy"])
  .index("by_category", ["category"])
  .index("by_isTaken", ["isTaken"])
  .index("by_date", ["date"])
  .index("by_location", ["location"])
  .index("by_bandChatId", ["bandChatId"]) // For quick chat lookups
  .index("by_paymentStatus", ["paymentStatus"]) // For payment queries
  .index("by_isActive", ["isActive"]); // For active gig queries
