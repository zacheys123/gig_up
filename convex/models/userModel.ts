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
  isBoth: v.optional(v.boolean()),
  isAdmin: v.optional(v.boolean()),
  // In your user schema, update the adminRole field to match all possible roles
  adminRole: v.optional(
    v.union(
      v.literal("super"),
      v.literal("content"),
      v.literal("support"),
      v.literal("analytics"),
      v.literal("admin"),
      v.literal("security"),
      v.literal("infrastructure")
    )
  ),
  adminPermissions: v.optional(
    v.array(
      v.union(
        v.literal("all"),
        v.literal("content_management"),
        v.literal("feature_flags"),
        v.literal("user_management"),
        v.literal("analytics"),
        v.literal("content_moderation"),
        v.literal("payment_management"),
        v.literal("notification_management"),
        v.literal("support_management"),
        v.literal("system_settings"),
        v.literal("security"),
        v.literal("api_management"),
        v.literal("infrastructure"),
        v.literal("moderation"),
        v.literal("user_support"),
        v.literal("reports"),
        v.literal("data_export")
      )
    )
  ),
  adminAccessLevel: v.optional(
    v.union(v.literal("full"), v.literal("limited"), v.literal("restricted"))
  ),
  canManageUsers: v.optional(v.boolean()),
  canManageContent: v.optional(v.boolean()),
  canManagePayments: v.optional(v.boolean()),
  canViewAnalytics: v.optional(v.boolean()),
  adminNotes: v.optional(
    v.union(
      v.string(), // Allow string during transition
      v.array(
        v.object({
          adminId: v.string(),
          note: v.string(),
          timestamp: v.number(),
        })
      )
    )
  ),
  adminDashboardAccess: v.optional(v.boolean()),
  lastAdminAction: v.optional(v.number()),
  isBooker: v.optional(v.boolean()),
  bookerSkills: v.optional(v.array(v.string())),
  managedBands: v.optional(v.array(v.string())),
  artistsManaged: v.optional(v.array(v.string())),
  bookerBio: v.optional(v.string()),

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
  verified: v.optional(v.boolean()),
  verificationMethod: v.optional(v.string()),
  verifiedAt: v.optional(v.number()),

  // NEW: Teacher specific fields
  teacherSpecialization: v.optional(v.string()),
  teachingStyle: v.optional(v.string()),
  lessonFormat: v.optional(v.string()),
  yearsTeaching: v.optional(v.string()),
  studentAgeGroup: v.optional(v.string()),

  // Client specific fields
  organization: v.optional(v.string()),

  clientType: v.optional(
    v.union(
      v.literal("individual_client"),
      v.literal("event_planner_client"),
      v.literal("venue_client"),
      v.literal("corporate_client")
    )
  ),
  bookerType: v.optional(
    v.union(v.literal("talent_agent"), v.literal("booking_manager"))
  ),
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
  dualRoleUnlockedAt: v.optional(v.number()),
  videoCallUnlockedAt: v.optional(v.number()),
  trustStars: v.optional(v.number()),
  // Reviews
  allreviews: v.optional(
    v.array(
      v.object({
        _id: v.string(),
        clientId: v.string(),
        musicianId: v.string(),
        rating: v.optional(v.number()),
        comment: v.optional(v.string()),
        gigId: v.optional(v.string()),
        updatedAt: v.optional(v.number()),
        createdAt: v.optional(v.number()),
      })
    )
  ),

  myreviews: v.optional(
    v.array(
      v.object({
        _id: v.string(),
        clientId: v.string(),
        musicianId: v.string(),
        rating: v.optional(v.number()),
        comment: v.optional(v.string()),
        gigId: v.optional(v.string()),
        videoId: v.optional(v.array(v.string())),
        updatedAt: v.optional(v.number()),
        createdAt: v.optional(v.number()),
      })
    )
  ),

  // Social connections
  followers: v.optional(v.array(v.string())),
  followings: v.optional(v.array(v.string())),
  refferences: v.optional(v.array(v.string())),
  mutualFollowers: v.optional(v.number()),

  // Business and billing
  tier: v.union(
    v.literal("free"),
    v.literal("pro"),
    v.literal("premium"),
    v.literal("elite")
  ),
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
  monthlyGigsPosted: v.optional(v.number()),
  monthlyMessages: v.number(),
  monthlyGigsBooked: v.optional(v.number()),

  // Gig management
  gigsBookedThisWeek: v.optional(
    v.object({
      count: v.number(),
      weekStart: v.number(),
    })
  ),
  gigsPostedThisWeek: v.optional(
    v.object({
      count: v.number(),
      weekStart: v.number(),
    })
  ),
  weeklyGigLimit: v.optional(v.number()), // Dynamic limit based on tier + trust score
  lastBookingDate: v.optional(v.number()),
  cancelgigCount: v.number(),
  completedGigsCount: v.optional(v.number()),

  // Booking history
  bookingHistory: v.optional(
    v.array(
      v.object({
        userId: v.array(v.string()),
        gigId: v.array(v.string()),
        status: v.string(),
        date: v.number(),
        role: v.string(),
        notes: v.optional(v.string()),
      })
    )
  ),
  // Replace the current rate field with this more flexible structure:
  // In your user schema, update the rate field:
  rate: v.optional(
    v.object({
      // Basic rate structure
      baseRate: v.optional(v.string()),
      rateType: v.optional(
        v.union(
          v.literal("hourly"),
          v.literal("daily"),
          v.literal("per_session"),
          v.literal("per_gig"),
          v.literal("monthly"),
          v.literal("custom")
        )
      ),
      currency: v.optional(v.string()),

      // Role-specific rate categories
      categories: v.optional(
        v.array(
          v.object({
            name: v.string(),
            rate: v.string(),
            rateType: v.optional(v.string()),
            description: v.optional(v.string()),
          })
        )
      ),

      // Rate modifiers
      negotiable: v.optional(v.boolean()),
      depositRequired: v.optional(v.boolean()),
      travelIncluded: v.optional(v.boolean()),
      travelFee: v.optional(v.string()),

      // Legacy fields for backward compatibility
      regular: v.optional(v.string()),
      function: v.optional(v.string()),
      concert: v.optional(v.string()),
      corporate: v.optional(v.string()),
    })
  ),

  // Saved content
  savedGigs: v.optional(v.array(v.string())),
  favoriteGigs: v.optional(v.array(v.string())),
  likedVideos: v.optional(v.array(v.string())),
  viewedVideos: v.optional(v.array(v.string())),
  lastViewedAt: v.optional(v.number()), // Last time user viewed a gig
  viewedGigs: v.optional(v.array(v.string())),
  totalInterests: v.optional(v.number()), // Total number of gigs user has shown interest in
  lastInterestAt: v.optional(v.number()), // Timestamp of last interest shown
  // User status and activity
  firstLogin: v.boolean(),
  onboardingComplete: v.boolean(),
  lastActive: v.number(),
  isBanned: v.boolean(),
  banReason: v.optional(v.string()),
  bannedAt: v.optional(v.number()),
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

  badges: v.optional(v.array(v.string())),
  reliabilityScore: v.optional(v.number()),
  avgRating: v.optional(v.number()),
  performanceStats: v.optional(
    v.object({
      totalGigsCompleted: v.number(),
      onTimeRate: v.number(),
      clientSatisfaction: v.number(),
      responseTime: v.optional(v.number()),
      lastUpdated: v.optional(v.number()),
    })
  ),
  badgeMilestones: v.optional(
    v.object({
      consecutiveGigs: v.number(),
      earlyCompletions: v.number(),
      perfectRatings: v.number(),
      cancellationFreeStreak: v.number(),
    })
  ),
  gigsBooked: v.optional(v.number()),
  gigsPosted: v.optional(v.number()),

  firstGigPostedAt: v.optional(v.number()), // Track when first gig was posted
  trustMilestones: v.optional(
    v.union(
      v.object({
        firstGigPosted: v.boolean(),
      }),
      v.object({
        firstGigBonusApplied: v.number(),
      }),
      v.object({
        firstGigDate: v.number(),
      })
    )
  ),

  userearnings: v.optional(v.number()),
  total: v.optional(v.number()),

  profileViews: v.optional(
    v.object({
      totalCount: v.number(),
      recentViewers: v.array(
        v.object({
          userId: v.string(),
          timestamp: v.number(),
          anonymous: v.optional(v.boolean()),
        })
      ),
      lastUpdated: v.optional(v.number()),
    })
  ),
  viewedProfiles: v.optional(v.array(v.string())),
  isPrivate: v.optional(v.boolean()),
  pendingFollowRequests: v.optional(v.array(v.id("users"))),
  myDeputies: v.optional(
    v.array(
      v.object({
        deputyUserId: v.id("users"),
        forMySkill: v.string(),
        gigType: v.optional(v.string()),
        note: v.optional(v.string()),
        status: v.union(
          v.literal("pending"),
          v.literal("accepted"),
          v.literal("rejected")
        ),
        canBeBooked: v.boolean(),
        utoBookable: v.optional(v.boolean()),
        dateAdded: v.number(),
      })
    )
  ),

  backUpFor: v.optional(
    v.array(
      v.object({
        principalUserId: v.id("users"),
        forTheirSkill: v.string(),
        gigType: v.optional(v.string()),
        status: v.union(
          v.literal("pending"),
          v.literal("accepted"),
          v.literal("rejected")
        ),
        dateAdded: v.number(),
      })
    )
  ),
  backUpCount: v.optional(v.number()),

  confirmedReferredGigs: v.optional(v.number()),
  availability: v.optional(
    v.union(v.literal("available"), v.literal("notavailable"))
  ),

  bannedBy: v.optional(v.string()),

  isSuspended: v.optional(v.boolean()),
  suspensionReason: v.optional(v.string()),
  suspensionExpiresAt: v.optional(v.number()),
  reportedCount: v.optional(v.number()),
  reports: v.optional(
    v.array(
      v.object({
        reporterId: v.string(),
        reason: v.string(),
        description: v.optional(v.string()),
        timestamp: v.number(),
        resolved: v.boolean(),
        resolvedBy: v.optional(v.string()),
        resolvedAt: v.optional(v.number()),
      })
    )
  ),

  warnings: v.optional(
    v.array(
      v.object({
        warning: v.string(),
        adminId: v.string(),
        timestamp: v.number(),
        acknowledged: v.boolean(),
      })
    )
  ),
  latePaymentsCount: v.optional(v.number()), // Number of late payments
  disputesCount: v.optional(v.number()), // Number of disputes
  noShowCount: v.optional(v.number()), // Number of no-shows
  warningCount: v.optional(v.number()), // Number of warnings
  actionHistory: v.optional(
    v.array(
      v.object({
        action: v.string(),
        adminId: v.string(),
        timestamp: v.number(),
        details: v.optional(v.string()),
      })
    )
  ),
  companyName: v.optional(v.string()),
  managedArtists: v.optional(v.array(v.string())),
  agencyName: v.optional(v.string()),
  canCreateBand: v.optional(v.boolean()), // Computed field
  bandCreationUnlockedAt: v.optional(v.number()),
  bandLeaderOf: v.optional(v.array(v.id("bands"))),
  bandMemberOf: v.optional(v.array(v.id("bands"))),
  pendingBandInvites: v.optional(v.number()), // Count of pending invites

  // For verification (to prevent self-booking)
  verifiedIdentity: v.optional(v.boolean()),

  governmentIdHash: v.optional(v.string()), // Last 4 of ID for verification

  trustScore: v.optional(v.number()), // 0-100 score
  trustScoreLastUpdated: v.optional(v.number()), // When last calculated
  trustTier: v.optional(
    // Auto-calculated tier
    v.union(
      v.literal("new"),
      v.literal("basic"),
      v.literal("verified"),
      v.literal("trusted"),
      v.literal("elite")
    )
  ),
  // Track client-musician relationships for collusion detection
  bookedMusicians: v.optional(
    v.array(
      v.object({
        musicianId: v.id("users"),
        gigId: v.id("gigs"),
        date: v.number(),
        ratingGiven: v.optional(v.number()),
      })
    )
  ),
  bookedByClients: v.optional(
    v.array(
      v.object({
        clientId: v.id("users"),
        gigId: v.id("gigs"),
        date: v.number(),
        ratingReceived: v.optional(v.number()),
      })
    )
  ),
  bookingsThisWeek: v.optional(v.number()),
  maxWeeklyBookings: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
  openToBandWork: v.optional(v.boolean()),
  interestedInBands: v.optional(v.boolean()),
})
  .index("by_clerkId", ["clerkId"])
  .index("by_email", ["email"])
  .index("by_username", ["username"])
  .index("by_city", ["city"])
  .index("by_is_musician", ["isMusician"])
  .index("by_is_client", ["isClient"])
  .index("by_is_booker", ["isBooker"])
  .index("by_is_both", ["isBoth"])
  .index("by_is_admin", ["isAdmin"])
  .index("by_tier", ["tier"])
  .index("by_role_type", ["roleType"])
  .index("by_is_banned", ["isBanned"])
  .index("by_last_active", ["lastActive"])
  .index("by_city_and_role", ["city", "isMusician"])
  .index("by_admin_role", ["isAdmin", "adminRole"])
  .index("by_badges", ["badges"])
  .index("by_reliability_score", ["reliabilityScore"])
  .index("by_avg_rating", ["avgRating"])
  .index("by_completed_gigs", ["completedGigsCount"])
  .index("by_reliability_and_role", ["reliabilityScore", "isMusician"])
  .index("by_rating_and_city", ["avgRating", "city", "isMusician"])
  .index("by_badges_and_city", ["badges", "city", "isMusician"])
  .index("by_performance_stats", [
    "performanceStats.totalGigsCompleted",
    "reliabilityScore",
  ])
  .index("by_trust_tier", ["trustTier"])

  .index("by_trustscore", ["trustScore"])

  .index("by_is_suspended", ["isSuspended"])

  .index("by_role", ["isMusician", "isClient", "isBooker"])
  .index("by_reported_count", ["reportedCount"]);
