// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { userModel } from "./models/userModel";
import { gigModel } from "./models/gigModel";
import { notificationModel } from "./models/notificationsModel"; // Make sure this path is correct
import { notificationSettingsModel } from "./models/notificationSettings";
import { pushSubscriptions } from "./models/push";
import { videoModel } from "./models/videoModel";
import { commentsModel } from "./models/commentsModel";
import { instantGigs, instantGigsTemplate } from "./models/instanGigsModel";
import { reports } from "./models/reportsModel";

export default defineSchema({
  users: userModel,
  gigs: gigModel,
  notifications: notificationModel,
  notificationSettings: notificationSettingsModel,
  instantgigs: instantGigs,
  instantGigsTemplate: instantGigsTemplate,

  aiSuggestions: defineTable({
    questions: v.object({
      musician: v.array(v.string()),
      client: v.array(v.string()),
      guest: v.array(v.string()),
    }),
    updatesReady: v.boolean(),
    version: v.string(),
    lastUpdated: v.number(),
  }),
  videos: videoModel,
  comments: commentsModel,
  pushSubscriptions: pushSubscriptions,
  featureFlags: defineTable({
    id: v.string(), // FeatureFlagKey like "teacher_dashboard"
    name: v.string(),
    description: v.optional(v.string()),
    enabled: v.boolean(),
    targetUsers: v.optional(
      v.union(
        v.literal("all"),
        v.literal("free"),
        v.literal("pro"),
        v.literal("premium"),
        v.literal("elite")
      )
    ),
    targetRoles: v.optional(v.array(v.string())), // UserRole[]
    rolloutPercentage: v.number(), // 0-100
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  chats: defineTable({
    participantIds: v.array(v.id("users")),
    lastMessage: v.optional(v.string()),
    lastMessageAt: v.optional(v.number()),
    unreadCounts: v.optional(v.record(v.string(), v.number())), // ← Use document IDs
    type: v.union(v.literal("direct"), v.literal("group")),
    isPinned: v.optional(v.boolean()),
    isArchived: v.optional(v.boolean()),
    name: v.optional(v.string()),
    createdBy: v.id("users"),
  })
    .index("by_participants", ["participantIds"])
    .index("by_lastMessageAt", ["lastMessageAt"]),

  // In your convex/schema.ts - Make fields optional
  // convex/schema.ts - Update messages table
  messages: defineTable({
    chatId: v.id("chats"),
    senderId: v.id("users"),
    content: v.string(),
    messageType: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("file"),
      v.literal("audio")
    ),
    attachments: v.optional(
      v.array(
        v.object({
          url: v.string(),
          type: v.string(),
          name: v.optional(v.string()),
          size: v.optional(v.number()),
        })
      )
    ),
    repliedTo: v.optional(v.id("messages")),
    readBy: v.array(v.id("users")),
    deliveredTo: v.array(v.id("users")), // Remove optional
    status: v.union(
      // Remove optional
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("read")
    ),
    isDeleted: v.boolean(),
    _creationTime: v.number(),
  })
    .index("by_chatId", ["chatId"])
    .index("by_senderId", ["senderId"]),

  // For tracking user online status in chats
  chatPresence: defineTable({
    userId: v.id("users"),
    chatId: v.id("chats"),
    lastSeen: v.number(),
    isOnline: v.boolean(),
  })
    .index("by_userId_chatId", ["userId", "chatId"])
    .index("by_chatId", ["chatId"]),
  userPresence: defineTable({
    userId: v.id("users"),
    lastSeen: v.number(),
    isOnline: v.boolean(),
  })
    .index("by_userId", ["userId"])
    .index("by_lastSeen", ["lastSeen"]),
  activeChatSessions: defineTable({
    userId: v.id("users"), // User who has the chat open
    chatId: v.id("chats"), // Chat that is currently open
    lastActive: v.number(), // Timestamp of last activity
  })
    .index("by_user_id", ["userId"])
    .index("by_chat_id", ["chatId"])
    .index("by_user_and_chat", ["userId", "chatId"]),
  // convex/schema.ts - Add this table
  typingIndicators: defineTable({
    chatId: v.id("chats"),
    userId: v.id("users"),
    isTyping: v.boolean(),
    lastUpdated: v.number(),
    _creationTime: v.number(),
  }) // convex/schema.ts - Add these indexes
    .index("by_chat_user", ["chatId", "userId"]) // For typingIndicators
    .index("by_chat", ["chatId"]) // For typingIndicators
    .index("by_lastUpdated", ["lastUpdated"]), // For cleanup
  connections: defineTable({
    user1Id: v.id("users"),
    user2Id: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("blocked")
    ),
    initiatedBy: v.id("users"),
    createdAt: v.number(),
    acceptedAt: v.optional(v.number()),
  })
    .index("by_user1", ["user1Id"])
    .index("by_user2", ["user2Id"])
    .index("by_user_pair", ["user1Id", "user2Id"]),
  testimonials: defineTable({
    userId: v.string(),
    userName: v.string(),
    userRole: v.string(),
    userCity: v.string(),
    rating: v.number(),
    content: v.string(),
    featured: v.boolean(),
    verified: v.boolean(),
    stats: v.object({
      bookings: v.number(),
      earnings: v.number(),
      joinedDate: v.string(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  audit_logs: defineTable({
    action: v.string(),
    adminId: v.string(),
    adminName: v.optional(v.string()),
    targetUserId: v.string(),
    targetUsername: v.string(),
    reason: v.optional(v.string()),
    timestamp: v.number(),
    details: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  })
    .index("by_admin", ["adminId"])
    .index("by_target", ["targetUserId"])
    .index("by_action", ["action"])
    .index("by_timestamp", ["timestamp"]), // NEW TABLES FOR BANDS:
  bands: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    genre: v.array(v.string()), // ["rock", "pop"]
    location: v.string(),
    status: v.union(
      v.literal("forming"),
      v.literal("active"),
      v.literal("inactive"),
      v.literal("archived")
    ),
    type: v.union(
      v.literal("permanent"),
      v.literal("ad-hoc"),
      v.literal("cover")
    ),
    creatorId: v.id("users"),
    requiredInstruments: v.array(
      v.object({
        instrument: v.string(),
        quantity: v.number(),
        filled: v.number(), // How many positions are filled
      })
    ),
    bandImageUrl: v.optional(v.string()),
    socialLinks: v.optional(
      v.array(
        v.object({
          platform: v.string(),
          url: v.string(),
        })
      )
    ),
    createdAt: v.number(),
    activatedAt: v.optional(v.number()),
    // Band rating (separate from individual ratings)
    bandRating: v.optional(
      v.object({
        average: v.number(),
        totalReviews: v.number(),
        lastUpdated: v.number(),
      })
    ),
  })
    .index("by_name", ["name"])
    .index("by_creator", ["creatorId"])
    .index("by_status", ["status"])
    .index("by_location", ["location"])
    .index("by_genre", ["genre"])
    .index("by_status_location", ["status", "location"]),

  bandMembers: defineTable({
    bandId: v.id("bands"),
    userId: v.id("users"),
    role: v.string(), // e.g., "lead_guitar", "vocals"
    status: v.union(
      v.literal("invited"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("pending") // For counter-offers
    ),
    isLeader: v.boolean(),
    inviteMessage: v.optional(v.string()),
    inviteTerms: v.optional(
      v.object({
        revenueShare: v.optional(v.number()), // Percentage
        guaranteedFee: v.optional(v.number()),
        commitmentLevel: v.optional(
          v.union(
            v.literal("full-time"),
            v.literal("part-time"),
            v.literal("session")
          )
        ),
      })
    ),
    joinedAt: v.optional(v.number()),
    invitedAt: v.number(),
    respondedAt: v.optional(v.number()),
  })
    .index("by_band", ["bandId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_band_user", ["bandId", "userId"])
    .index("by_band_status", ["bandId", "status"]),

  crewMessages: defineTable({
    bandId: v.id("bands"),
    authorId: v.id("users"),
    content: v.string(),
    type: v.union(v.literal("message"), v.literal("system"), v.literal("file")),
    fileUrl: v.optional(v.string()),
    fileName: v.optional(v.string()),
    repliedTo: v.optional(v.id("crewMessages")),
    readBy: v.array(v.id("users")), // Track who has read it
    createdAt: v.number(),
  })
    .index("by_band", ["bandId"])
    .index("by_band_created", ["bandId", "createdAt"])
    .index("by_author", ["authorId"]),

  bandGigApplications: defineTable({
    bandId: v.id("bands"),
    gigId: v.id("gigs"),
    status: v.union(
      v.literal("applied"),
      v.literal("shortlisted"),
      v.literal("booked"),
      v.literal("rejected")
    ),
    appliedAt: v.number(),
    proposedFee: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_band", ["bandId"])
    .index("by_gig", ["gigId"])
    .index("by_band_status", ["bandId", "status"]),

  accountDeletions: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    email: v.string(),
    username: v.string(),
    deletedAt: v.number(),
    reason: v.string(),
    dataSnapshot: v.any(),
  }),
  gigDeletions: defineTable({
    gigId: v.id("gigs"),
    deletedBy: v.id("users"),
    deletedAt: v.number(),
    reason: v.string(),
    title: v.string(),
    createdAt: v.number(),
  }),
  // // Add this to track who can create bands
  // userBandEligibility: defineTable({
  //   userId: v.id("users"),
  //   canCreateBand: v.boolean(),
  //   reason: v.optional(v.string()), // Why they can/can't create
  //   lastChecked: v.number(),
  //   requirements: v.object({
  //     minReliabilityScore: v.number(),
  //     minCompletedGigs: v.number(),
  //     minRating: v.number(),
  //     verifiedProfile: v.boolean(),
  //     hasPaymentMethod: v.boolean(),
  //   }),
  //   metRequirements: v.object({
  //     reliabilityScore: v.boolean(),
  //     completedGigs: v.boolean(),
  //     rating: v.boolean(),
  //     verifiedProfile: v.boolean(),
  //     hasPaymentMethod: v.boolean(),
  //   }),
  // })
  //   .index("by_user", ["userId"])
  //   .index("by_eligibility", ["canCreateBand"]),
  // In your Convex schema.ts

  secretKeyResets: defineTable({
    gigId: v.id("gigs"),
    userId: v.id("users"),
    resetToken: v.string(),
    resetCode: v.string(),
    email: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    used: v.boolean(),
  })
    .index("by_gig_and_user", ["gigId", "userId"])
    .index("by_token", ["resetToken"]),
  securityLogs: defineTable({
    gigId: v.id("gigs"),
    userId: v.id("users"),
    action: v.string(),
    timestamp: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    success: v.boolean(),
    metadata: v.optional(v.any()),
  })
    .index("by_gig", ["gigId"])
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"]),emailLogs : defineTable({
  type: v.union(
    v.literal("secret_key_reset"),
    v.literal("verification"),
    v.literal("booking_notification"),
    v.literal("welcome"),
    v.literal("password_reset")
  ),
  toEmail: v.string(),
  gigId: v.optional(v.id("gigs")),
  userId: v.optional(v.id("users")),
  bookingId: v.optional(v.id("bookings")),
  subject: v.string(),
  sentAt: v.number(),
  status: v.union(v.literal("sent"), v.literal("failed"), v.literal("pending")),
  error: v.optional(v.string()),
  metadata: v.optional(v.any()),
})
  .index("by_user", ["userId"])
  .index("by_gig", ["gigId"])
  .index("by_type", ["type"])
  .index("by_status", ["status"])
  .index("by_sent_at", ["sentAt"])
  reports: reports,
});
