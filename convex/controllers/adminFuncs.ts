import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { AdminPermission, AdminRole } from "../adminTypes";

// admin controllers
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
        v.literal("analytics")
      ),
      permissions: v.array(v.string()),
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

    // Define permission-based access from admin config
    const canManageUsers =
      args.adminConfig.permissions.includes("user_management") ||
      args.adminConfig.permissions.includes("all");

    const canManageContent =
      args.adminConfig.permissions.includes("content_management") ||
      args.adminConfig.permissions.includes("all");

    const canManagePayments =
      args.adminConfig.permissions.includes("payment_management") ||
      args.adminConfig.permissions.includes("all");

    const canViewAnalytics =
      args.adminConfig.permissions.includes("analytics") ||
      args.adminConfig.permissions.includes("all");

    // Base admin user data
    const adminUserData = {
      // Basic profile fields
      clerkId: args.clerkId,
      email: args.email,
      username: args.username,
      picture: args.picture,
      firstname: args.firstname,
      lastname: args.lastname,
      lastActive: now,

      // Admin-specific fields
      isAdmin: true,
      adminRole: args.adminConfig.role,
      adminPermissions: args.adminConfig.permissions,
      adminAccessLevel: args.adminConfig.accessLevel,
      canManageUsers,
      canManageContent,
      canManagePayments,
      canViewAnalytics,
      adminDashboardAccess: true,
      tier: "elite" as const,
      theme: "system" as const,

      // User defaults
      isMusician: false,
      isClient: false,
      isBooker: false,
      isBoth: false,
      isBanned: false,

      // Numeric fields
      earnings: 0,
      totalSpent: 0,
      monthlyGigsPosted: 0,
      monthlyMessages: 0,
      monthlyGigsBooked: 0,
      completedGigsCount: 0,
      reportsCount: 0,
      cancelgigCount: 0,
      renewalAttempts: 0,

      // Boolean flags
      firstLogin: false, // Admins skip first login
      onboardingComplete: true, // Admins are automatically onboarded
      firstTimeInProfile: false,

      // String fields
      banReason: "",

      // Date fields
      bannedAt: 0,

      // Social and arrays
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

      // Performance fields
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

      // Privacy
      isPrivate: false,
      pendingFollowRequests: [],

      // Booker fields (empty for admins)
      bookerSkills: [],
      managedBands: [],
      artistsManaged: [],
    };

    if (existingUser) {
      // Update existing user with admin permissions
      // Only update admin-specific fields and basic profile
      const updates: any = {
        // Basic profile updates
        email: args.email,
        username: args.username,
        picture: args.picture,
        firstname: args.firstname,
        lastname: args.lastname,
        lastActive: now,

        // Admin permissions
        isAdmin: true,
        adminRole: args.adminConfig.role,
        adminPermissions: args.adminConfig.permissions,
        adminAccessLevel: args.adminConfig.accessLevel,
        canManageUsers,
        canManageContent,
        canManagePayments,
        canViewAnalytics,
        adminDashboardAccess: true,
        tier: "elite",
        firstLogin: false,
        onboardingComplete: true,
      };

      // Only update fields that are different or missing
      if (args.picture && args.picture !== existingUser.picture) {
        updates.picture = args.picture;
      }
      if (args.firstname && args.firstname !== existingUser.firstname) {
        updates.firstname = args.firstname;
      }
      if (args.lastname && args.lastname !== existingUser.lastname) {
        updates.lastname = args.lastname;
      }

      await ctx.db.patch(existingUser._id, updates);
      return {
        success: true,
        userId: existingUser._id,
        action: "updated",
        adminRole: args.adminConfig.role,
        permissions: args.adminConfig.permissions,
      };
    } else {
      // Create new admin user with full data
      const userId = await ctx.db.insert("users", adminUserData);
      return {
        success: true,
        userId,
        action: "created",
        adminRole: args.adminConfig.role,
        permissions: args.adminConfig.permissions,
      };
    }
  },
});
// convex/controllers/user.ts
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
          v.literal("analytics")
        )
      ),
      adminPermissions: v.optional(v.array(v.string())),
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
    try {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
        .first();

      if (!user) {
        throw new Error("User not found");
      }

      // Filter out undefined values and ensure proper types
      const cleanUpdates = Object.fromEntries(
        Object.entries(args.updates).filter(([_, value]) => value !== undefined)
      );

      // Create final updates with proper typing
      const finalUpdates: any = {
        ...cleanUpdates,
        lastActive: Date.now(),
      };

      // If setting as admin, ensure required fields are set
      if (args.updates.isAdmin === true) {
        // Ensure admin permissions array exists
        if (!finalUpdates.adminPermissions) {
          finalUpdates.adminPermissions = [];
        }

        // Ensure admin dashboard access is enabled
        if (finalUpdates.adminDashboardAccess === undefined) {
          finalUpdates.adminDashboardAccess = true;
        }

        // Set elite tier for admins if not specified
        if (!finalUpdates.tier) {
          finalUpdates.tier = "elite";
        }
      }

      await ctx.db.patch(user._id, finalUpdates);

      return {
        success: true,
        userId: user._id,
        adminRole: finalUpdates.adminRole,
        permissions: finalUpdates.adminPermissions || [],
      };
    } catch (error) {
      console.error("Error updating user as admin:", error);
      throw error;
    }
  },
});
export const getAdminStatus = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    console.log("🔍 getAdminStatus called for user:", args.userId);

    // Check if user is admin in your database
    const adminUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.userId))
      .first();

    console.log("📊 getAdminStatus result:", adminUser);

    if (!adminUser || !adminUser.isAdmin) {
      return {
        isAdmin: false,
        role: null,
        permissions: [] as AdminPermission[],
      };
    }

    return {
      isAdmin: true,
      role: adminUser.adminRole as AdminRole,
      permissions: adminUser.adminPermissions as AdminPermission[],
    };
  },
});

// Optional: Function to make a user an admin
export const makeUserAdmin = mutation({
  args: {
    clerkId: v.string(),
    adminRole: v.union(
      v.literal("super"),
      v.literal("content"),
      v.literal("support"),
      v.literal("analytics")
    ),
    permissions: v.array(
      v.union(
        v.literal("user_management"),
        v.literal("content_management"),
        v.literal("payment_management"),
        v.literal("analytics"),
        v.literal("feature_flags"),
        v.literal("content_moderation"),
        v.literal("all")
      )
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      isAdmin: true,
      adminRole: args.adminRole,
      adminPermissions: args.permissions,
    });

    return { success: true };
  },
});
