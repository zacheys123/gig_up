// convex/controllers/adminFuncs.ts - SIMPLIFIED VERSION
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Define permission values ONCE
const permissionValues = v.union(
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
);

// FIXED: Simple syncAdminUser that WORKS
export const syncAdminUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    username: v.string(),
    picture: v.optional(v.string()),
    firstname: v.optional(v.string()),
    lastname: v.optional(v.string()),
    adminConfig: v.object({
      role: v.union(
        v.literal("super"),
        v.literal("content"),
        v.literal("support"),
        v.literal("analytics"),
        v.literal("admin"),
        v.literal("security"),
        v.literal("infrastructure")
      ),
      permissions: v.array(permissionValues), // FIXED: Use the defined permissionValues
      accessLevel: v.union(
        v.literal("full"),
        v.literal("limited"),
        v.literal("restricted")
      ),
    }),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    const now = Date.now();

    // Calculate permission-based access
    const permissions = args.adminConfig.permissions;
    const canManageUsers =
      permissions.includes("user_management") || permissions.includes("all");
    const canManageContent =
      permissions.includes("content_management") || permissions.includes("all");
    const canManagePayments =
      permissions.includes("payment_management") || permissions.includes("all");
    const canViewAnalytics =
      permissions.includes("analytics") || permissions.includes("all");

    const adminUpdates: any = {
      // Basic info
      email: args.email,
      username: args.username,
      picture: args.picture,
      firstname: args.firstname,
      lastname: args.lastname,
      lastActive: now,

      // Admin permissions
      isAdmin: true,
      adminRole: args.adminConfig.role,
      adminPermissions: permissions,
      adminAccessLevel: args.adminConfig.accessLevel,
      canManageUsers,
      canManageContent,
      canManagePayments,
      canViewAnalytics,
      adminDashboardAccess: true,
      tier: "elite",

      // Trust system
      trustScore: 100,
      trustScoreLastUpdated: now,
      trustTier: "elite",
      canCreateBand: true,
      bandCreationUnlockedAt: now,
      verifiedIdentity: true,
    };

    if (existingUser) {
      // Update existing user - only patch what's needed
      await ctx.db.patch(existingUser._id, adminUpdates);
      return {
        success: true,
        userId: existingUser._id,
        action: "updated",
        adminRole: args.adminConfig.role,
        permissions,
      };
    } else {
      // CREATE NEW USER - simplified with minimal required fields
      const newUserData = {
        clerkId: args.clerkId,
        ...adminUpdates,

        // Add other REQUIRED fields that are missing
        isMusician: false,
        isClient: false,
        isBoth: false,
        isBooker: false,
        isBanned: false,
        earnings: 0,
        totalSpent: 0,
        monthlyGigsPosted: 0,
        monthlyMessages: 0,
        monthlyGigsBooked: 0,
        completedGigsCount: 0,
        reportsCount: 0,
        cancelgigCount: 0,
        renewalAttempts: 0,

        // Add defaults for other required fields
        firstLogin: true,
        onboardingComplete: false,
        banReason: "",
        bannedAt: 0,

        // Theme (required)
        theme: "system",

        // Add defaults for optional fields that might cause issues
        city: "",
        date: "",
        month: "",
        year: "",
        address: "",
        phone: "",
        verification: "",
        followers: [],
        followings: [],
        refferences: [],
        mutualFollowers: 0,
        allreviews: [],
        myreviews: [],
        savedGigs: [],
        favoriteGigs: [],
        bookingHistory: [],
        adminNotes: "",
        badges: [],
        reliabilityScore: 100,
        avgRating: 0,
        performanceStats: {
          totalGigsCompleted: 0,
          onTimeRate: 100,
          clientSatisfaction: 100,
          lastUpdated: now,
        },
        badgeMilestones: {
          consecutiveGigs: 0,
          earlyCompletions: 0,
          perfectRatings: 0,
          cancellationFreeStreak: 0,
        },
        gigsBookedThisWeek: {
          count: 0,
          weekStart: now,
        },
        isPrivate: false,
        pendingFollowRequests: [],
        bookerSkills: [],
        managedBands: [],
        artistsManaged: [],
        firstTimeInProfile: true,
        mpesaPhoneNumber: "",
        gigsBooked: 0,
        gigsPosted: 0,
        userearnings: 0,
        total: 0,
        profileViews: {
          totalCount: 0,
          recentViewers: [],
          lastUpdated: now,
        },
        viewedProfiles: [],
        myDeputies: [],
        backUpFor: [],
        backUpCount: 0,
        confirmedReferredGigs: 0,
        availability: "available",
        bannedBy: "",
        isSuspended: false,
        suspensionReason: "",
        suspensionExpiresAt: undefined,
        reportedCount: 0,
        reports: [],
        warnings: [],
        actionHistory: [],
        companyName: "",
        managedArtists: [],
        agencyName: "",
        bandLeaderOf: [],
        bandMemberOf: [],
        pendingBandInvites: 0,
        governmentIdHash: "",
        bookedMusicians: [],
        bookedByClients: [],
      };

      const userId = await ctx.db.insert("users", newUserData);
      return {
        success: true,
        userId,
        action: "created",
        adminRole: args.adminConfig.role,
        permissions,
      };
    }
  },
});

// Keep the other functions as they were
export const updateUserAsAdmin = mutation({
  args: {
    clerkId: v.string(),
    updates: v.object({
      isAdmin: v.optional(v.boolean()),
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
      adminPermissions: v.optional(v.array(permissionValues)),
      adminAccessLevel: v.optional(
        v.union(
          v.literal("full"),
          v.literal("limited"),
          v.literal("restricted")
        )
      ),
      canManageUsers: v.optional(v.boolean()),
      canManageContent: v.optional(v.boolean()),
      canManagePayments: v.optional(v.boolean()),
      canViewAnalytics: v.optional(v.boolean()),
      adminNotes: v.optional(v.string()),
      adminDashboardAccess: v.optional(v.boolean()),
      tier: v.optional(
        v.union(
          v.literal("free"),
          v.literal("pro"),
          v.literal("premium"),
          v.literal("elite")
        )
      ),
      firstLogin: v.optional(v.boolean()),
      lastActive: v.optional(v.number()),
      theme: v.optional(
        v.union(v.literal("light"), v.literal("dark"), v.literal("system"))
      ),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Filter out undefined values
    const cleanUpdates: any = {};
    for (const [key, value] of Object.entries(args.updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }

    await ctx.db.patch(user._id, {
      ...cleanUpdates,
      lastActive: Date.now(),
    });

    return {
      success: true,
      userId: user._id,
    };
  },
});

export const getAdminStatus = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .first();

    if (!user) {
      return {
        isAdmin: false,
        adminRole: null,
        permissions: [],
        exists: false,
        userId: args.userId,
        timestamp: Date.now(),
      };
    }

    return {
      isAdmin: user.isAdmin === true,
      adminRole: user.adminRole || null,
      permissions: user.adminPermissions || [],
      exists: true,
      userId: user._id,
      timestamp: Date.now(),
    };
  },
});
