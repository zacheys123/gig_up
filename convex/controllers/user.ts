// convex/controllers/user.ts
import { Doc, Id } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import {
  cleanupFollowNotifications,
  createNotificationInternal,
  deleteFollowRequestNotification,
  isUserDocument,
} from "../createNotificationInternal";
import { updateUserTrust } from "../trustHelper";

// Helper function to create type-safe user data with admin defaults
const createUserData = (args: any, now: number) => {
  return {
    ...args,
    lastActive: now,

    // Role fields with defaults
    isMusician: false,
    isClient: false,
    isBooker: false,
    isAdmin: false, // Default to false
    isBoth: false,
    isBanned: false,

    // Admin fields with defaults
    adminRole: undefined,
    adminPermissions: [],
    adminAccessLevel: undefined,
    canManageUsers: false,
    canManageContent: false,
    canManagePayments: false,
    canViewAnalytics: false,
    adminNotes: undefined,
    adminDashboardAccess: false,
    lastAdminAction: undefined,

    // Tier and theme with literal types
    tier: "free" as const,
    theme: "system" as const,

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
    firstLogin: true,
    onboardingComplete: false,
    firstTimeInProfile: true,
    mutualFollowers: 0,

    // String fields
    banReason: "",

    // Date fields
    bannedAt: 0,
    isPrivate: false,
    pendingFollowRequests: [],

    // Booker fields
    bookerSkills: [],
    managedBands: [],
    artistsManaged: [],

    // Social fields
    followers: [],
    followings: [],
    refferences: [],
    allreviews: [],
    myreviews: [],
    savedGigs: [],
    favoriteGigs: [],
    bookingHistory: [],

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
    totalInterests: 0,
    viewedGigs: [],
  };
};
export const updateFirstLogin = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Updating firstLogin for user:", args.clerkId);

      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
        .first();
      console.log(user);
      if (!user) {
        throw new Error("User not found");
      }

      await ctx.db.patch(user._id, {
        firstLogin: false,
        lastActive: Date.now(),
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating firstLogin:", error);
      throw error;
    }
  },
});

// For syncing only basic profile data
export const syncUserProfile = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    username: v.string(),
    picture: v.optional(v.string()),
    firstname: v.optional(v.string()),
    lastname: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    const now = Date.now();

    if (existingUser) {
      // Only update these specific fields
      const updates: any = {
        viewedProfiles: existingUser.viewedProfiles || [], // Initialize if undefined
        lastActive: now,
      };

      // Only update if the value is different or missing
      if (args.email && args.email !== existingUser.email) {
        updates.email = args.email;
      }
      if (args.username && args.username !== existingUser.username) {
        updates.username = args.username;
      }
      if (args.picture && args.picture !== existingUser.picture) {
        updates.picture = args.picture;
      }
      if (args.firstname && args.firstname !== existingUser.firstname) {
        updates.firstname = args.firstname;
      }
      if (args.lastname && args.lastname !== existingUser.lastname) {
        updates.lastname = args.lastname;
      }

      // Only patch if there are actual updates
      if (Object.keys(updates).length > 1) {
        // More than just lastActive
        return await ctx.db.patch(existingUser._id, updates);
      }
      return existingUser; // No changes needed
    } else {
      // Create new user with full defaults
      const userData = createUserData(args, now);
      return await ctx.db.insert("users", {
        ...userData,
        followers: [],
        followings: [],
        refferences: [],
        musicianhandles: [],
        musiciangenres: [],
        savedGigs: [],
        favoriteGigs: [],
        bookingHistory: [],
        adminPermissions: [],
        allreviews: [],
        myreviews: [],
        gigsBookedThisWeek: { count: 0, weekStart: now },
        badges: [],
        reliabilityScore: 100,
        avgRating: 0,
        performanceStats: {
          totalGigsCompleted: 0,
          onTimeRate: 100,
          clientSatisfaction: 100,
          lastUpdated: Date.now(),
        },
        badgeMilestones: {
          consecutiveGigs: 0,
          earlyCompletions: 0,
          perfectRatings: 0,
          cancellationFreeStreak: 0,
        },
        isPrivate: false,
        pendingFollowRequests: [],
      });
    }
  },
});
// convex/controllers/user.ts
export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    clerkId: v.string(),
    updates: v.object({
      // Basic profile fields
      firstname: v.optional(v.string()),
      lastname: v.optional(v.string()),
      email: v.optional(v.string()),
      username: v.optional(v.string()),
      city: v.optional(v.string()),
      instrument: v.optional(v.string()),
      experience: v.optional(v.string()),
      date: v.optional(v.string()),
      month: v.optional(v.string()),
      year: v.optional(v.string()),
      address: v.optional(v.string()),
      phone: v.optional(v.string()),
      organization: v.optional(v.string()),
      firstTimeInProfile: v.optional(v.boolean()),
      mpesaPhoneNumber: v.optional(v.string()),

      // Social and handles
      musicianhandles: v.optional(
        v.array(
          v.object({
            platform: v.string(),
            handle: v.string(),
          })
        )
      ),
      musiciangenres: v.optional(v.array(v.string())),
      talentbio: v.optional(v.string()),
      handles: v.optional(v.string()),

      // Role flags
      isMusician: v.optional(v.boolean()),
      isClient: v.optional(v.boolean()),
      isBooker: v.optional(v.boolean()),
      rate: v.optional(
        v.object({
          // Basic rate info
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

          // Categories
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

          // Modifiers
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

      // Role-specific fields
      roleType: v.optional(v.string()),
      clientType: v.optional(
        v.union(
          v.literal("individual_client"),
          v.literal("event_planner_client"),
          v.literal("venue_client"),
          v.literal("corporate_client")
        )
      ), // ADDED: For client accounts
      bookerType: v.optional(
        v.union(v.literal("talent_agent"), v.literal("booking_manager"))
      ), // ADDED: For booker accounts
      djGenre: v.optional(v.string()),
      djEquipment: v.optional(v.string()),
      mcType: v.optional(v.string()),
      mcLanguages: v.optional(v.string()),
      vocalistGenre: v.optional(v.string()),

      // Teacher-specific fields
      teacherSpecialization: v.optional(v.string()),
      teachingStyle: v.optional(v.string()),
      lessonFormat: v.optional(v.string()),
      studentAgeGroup: v.optional(v.string()),

      // Booker-specific fields
      bookerSkills: v.optional(v.array(v.string())),
      bookerBio: v.optional(v.string()),
      managedBands: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Verify using the passed clerkId instead of auth context
    if (user.clerkId !== args.clerkId) {
      throw new Error("Unauthorized to update this profile");
    }

    // Filter out undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(args.updates).filter(([_, value]) => value !== undefined)
    );

    console.log("Clean updates:", cleanUpdates);

    await ctx.db.patch(args.userId, {
      ...cleanUpdates,
      lastActive: Date.now(),
    });
    const updatedTrust = await updateUserTrust(ctx, args.userId);

    return {
      success: true,
      trustScore: updatedTrust.trustScore,
      trustStars: updatedTrust.trustStars,
      tier: updatedTrust.tier,
      isProfileComplete: updatedTrust.isProfileComplete,
    };
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});
export const getCurrentUser = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return null;

    // Map the database rate structure to the component's expected format
    const safeRate = {
      baseRate: user.rate?.baseRate || "",
      rateType: (user.rate?.rateType as any) || "hourly",
      currency: user.rate?.currency || "KES",
      categories: user.rate?.categories || [],
      negotiable: user.rate?.negotiable || false,
      depositRequired: user.rate?.depositRequired || false,
      travelIncluded: user.rate?.travelIncluded || false,
      travelFee: user.rate?.travelFee || "",
      // Map the legacy fields from your database structure
      regular: user.rate?.regular || "",
      function: user.rate?.function || "",
      concert: user.rate?.concert || "",
      corporate: user.rate?.corporate || "",
    };

    return {
      ...user,
      rate: safeRate,
      // ... other safe defaults
      followers: user.followers || [],
      followings: user.followings || [],
      allreviews: user.allreviews || [],
      myreviews: user.myreviews || [],
      bookerSkills: user.bookerSkills || [],
      firstLogin: user.firstLogin ?? true,
      onboardingComplete: user.onboardingComplete ?? false,
      isMusician: user.isMusician ?? false,
      isClient: user.isClient ?? false,
      isBooker: user.isBooker ?? false,
      tier: user.tier ?? "free",
    };
  },
});
// convex/controllers/user.ts
export const getBookers = query({
  args: {
    city: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let bookers = await ctx.db
      .query("users")
      .withIndex("by_is_booker", (q) => q.eq("isBooker", true))
      .collect();

    // Filter by city if provided
    if (args.city) {
      bookers = bookers.filter((booker) =>
        booker.city?.toLowerCase().includes(args.city!.toLowerCase())
      );
    }

    // Filter by skills if provided
    if (args.skills && args.skills.length > 0) {
      bookers = bookers.filter((booker) =>
        booker.bookerSkills?.some((skill: string) =>
          args.skills!.includes(skill)
        )
      );
    }

    return bookers.slice(0, args.limit || 50);
  },
});
// convex/controllers/user.ts - Update the mutations

export const updateUserAsMusician = mutation({
  args: {
    clerkId: v.string(),
    updates: v.object({
      isMusician: v.boolean(),
      isClient: v.boolean(),
      isBooker: v.optional(v.boolean()),
      bookerSkills: v.optional(v.array(v.string())),
      bookerBio: v.optional(v.string()),
      managedBands: v.optional(v.array(v.string())),
      city: v.string(),
      instrument: v.optional(v.string()),
      experience: v.string(),
      roleType: v.string(),
      djGenre: v.optional(v.string()),
      djEquipment: v.optional(v.string()),
      mcType: v.optional(v.string()),
      mcLanguages: v.optional(v.string()),
      talentbio: v.string(),
      vocalistGenre: v.optional(v.string()),
      organization: v.optional(v.string()),
      // Teacher specific fields
      teacherSpecialization: v.optional(v.string()),
      teachingStyle: v.optional(v.string()),
      lessonFormat: v.optional(v.string()),
      studentAgeGroup: v.optional(v.string()),
      // NEW: Client and Booker types
      clientType: v.optional(
        v.union(
          v.literal("individual"),
          v.literal("event_planner"),
          v.literal("venue"),
          v.literal("corporate")
        )
      ),
      bookerType: v.optional(
        v.union(v.literal("talent_agent"), v.literal("booking_manager"))
      ),
      tier: v.union(v.literal("free"), v.literal("pro")),
      nextBillingDate: v.optional(v.number()),
      monthlyGigsPosted: v.optional(v.number()),
      monthlyMessages: v.optional(v.number()),
      monthlyGigsBooked: v.optional(v.number()),
      gigsBookedThisWeek: v.optional(
        v.object({
          count: v.number(),
          weekStart: v.number(),
        })
      ),
      lastBookingDate: v.optional(v.number()),
      earnings: v.optional(v.number()),
      totalSpent: v.optional(v.number()),
      firstLogin: v.optional(v.boolean()),
      onboardingComplete: v.optional(v.boolean()),
      lastActive: v.optional(v.number()),
      isBanned: v.optional(v.boolean()),
      banReason: v.optional(v.string()),
      bannedAt: v.optional(v.number()),
      lastAdminAction: v.optional(v.number()),
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

      await ctx.db.patch(user._id, {
        ...cleanUpdates,
        lastActive: Date.now(),
      });

      return { success: true, userId: user._id };
    } catch (error) {
      console.error("Error updating user as musician:", error);
      throw error;
    }
  },
});

export const updateUserAsClient = mutation({
  args: {
    clerkId: v.string(),
    updates: v.object({
      isMusician: v.boolean(),
      isClient: v.boolean(),
      city: v.string(),
      organization: v.string(),
      talentbio: v.string(),
      // NEW: Client type
      clientType: v.optional(
        v.union(
          v.literal("individual"),
          v.literal("event_planner"),
          v.literal("venue"),
          v.literal("corporate")
        )
      ),
      tier: v.union(v.literal("free"), v.literal("pro")),
      nextBillingDate: v.optional(v.number()),
      monthlyGigsPosted: v.optional(v.number()),
      monthlyMessages: v.optional(v.number()),
      monthlyGigsBooked: v.optional(v.number()),
      gigsBookedThisWeek: v.optional(
        v.object({
          count: v.number(),
          weekStart: v.number(),
        })
      ),
      lastBookingDate: v.optional(v.number()),
      earnings: v.optional(v.number()),
      totalSpent: v.optional(v.number()),
      firstLogin: v.optional(v.boolean()),
      onboardingComplete: v.optional(v.boolean()),
      lastActive: v.optional(v.number()),
      isBanned: v.optional(v.boolean()),
      banReason: v.optional(v.string()),
      bannedAt: v.optional(v.number()),
      lastAdminAction: v.optional(v.number()),
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

      const cleanUpdates = Object.fromEntries(
        Object.entries(args.updates).filter(([_, value]) => value !== undefined)
      );

      await ctx.db.patch(user._id, {
        ...cleanUpdates,
        firstLogin: false,
        lastActive: Date.now(),
      });

      return { success: true, userId: user._id };
    } catch (error) {
      console.error("Error updating user as client:", error);
      throw error;
    }
  },
});

export const updateUserAsBooker = mutation({
  args: {
    clerkId: v.string(),
    updates: v.object({
      isMusician: v.boolean(),
      isClient: v.boolean(),
      isBooker: v.boolean(),
      city: v.string(),
      organization: v.string(),
      experience: v.string(),
      bookerSkills: v.array(v.string()),
      talentbio: v.string(),
      // NEW: Booker type
      bookerType: v.optional(
        v.union(v.literal("talent_agent"), v.literal("booking_manager"))
      ),
      tier: v.union(v.literal("free"), v.literal("pro")),
      nextBillingDate: v.optional(v.number()),
      monthlyGigsPosted: v.optional(v.number()),
      monthlyMessages: v.optional(v.number()),
      monthlyGigsBooked: v.optional(v.number()),
      gigsBookedThisWeek: v.optional(
        v.object({
          count: v.number(),
          weekStart: v.number(),
        })
      ),
      lastBookingDate: v.optional(v.number()),
      earnings: v.optional(v.number()),
      totalSpent: v.optional(v.number()),
      firstLogin: v.optional(v.boolean()),
      onboardingComplete: v.optional(v.boolean()),
      lastActive: v.optional(v.number()),
      isBanned: v.optional(v.boolean()),
      banReason: v.optional(v.string()),
      bannedAt: v.optional(v.number()),
      lastAdminAction: v.optional(v.number()),
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

      const cleanUpdates = Object.fromEntries(
        Object.entries(args.updates).filter(([_, value]) => value !== undefined)
      );

      await ctx.db.patch(user._id, {
        ...cleanUpdates,
        bookerBio: args.updates.talentbio, // Map talentbio to bookerBio
        lastActive: Date.now(),
      });

      return { success: true, userId: user._id };
    } catch (error) {
      console.error("Error updating user as booker:", error);
      throw error;
    }
  },
});

// convex/controllers/user.ts
export const searchUsers = query({
  args: {
    query: v.string(),
    isMusician: v.optional(v.boolean()),
    isBooker: v.optional(v.boolean()), // NEW
    city: v.optional(v.string()),
    instrument: v.optional(v.string()),
    bookerSkills: v.optional(v.array(v.string())), // NEW
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let users = await ctx.db.query("users").collect();

    const searchTerm = args.query.toLowerCase();

    return users
      .filter((user) => {
        const matchesSearch =
          user.firstname?.toLowerCase().includes(searchTerm) ||
          user.lastname?.toLowerCase().includes(searchTerm) ||
          user.username.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.city?.toLowerCase().includes(searchTerm) ||
          user.instrument?.toLowerCase().includes(searchTerm) ||
          user.organization?.toLowerCase().includes(searchTerm) || // For bookers
          user.bookerSkills?.some((skill: string) =>
            skill.toLowerCase().includes(searchTerm)
          ); // For booker skills

        const matchesMusician =
          args.isMusician === undefined || user.isMusician === args.isMusician;

        const matchesBooker =
          args.isBooker === undefined || user.isBooker === args.isBooker;

        const matchesCity =
          !args.city ||
          user.city?.toLowerCase().includes(args.city.toLowerCase());

        const matchesInstrument =
          !args.instrument ||
          user.instrument
            ?.toLowerCase()
            .includes(args.instrument.toLowerCase());

        const matchesBookerSkills =
          !args.bookerSkills ||
          args.bookerSkills.length === 0 ||
          user.bookerSkills?.some((skill: string) =>
            args.bookerSkills!.includes(skill)
          );

        return (
          matchesSearch &&
          matchesMusician &&
          matchesBooker &&
          matchesCity &&
          matchesInstrument &&
          matchesBookerSkills
        );
      })
      .slice(0, args.limit || 50);
  },
});

export const getUserByUsername = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },
});
export const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    return user;
  },
});
export const followUser = mutation({
  args: {
    userId: v.string(),
    tId: v.id("users"),
    isViewerInGracePeriod: v.optional(v.boolean()), // ADD THIS
  },
  handler: async (ctx, args) => {
    if (!args.userId) throw new Error("Unauthorized");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .first();
    if (!currentUser) throw new Error("User not found");

    const targetUser = await ctx.db.get(args.tId);
    if (!targetUser) throw new Error("Target user not found");

    // ✅ TYPE CHECK: Ensure both are user documents
    if (!isUserDocument(currentUser) || !isUserDocument(targetUser)) {
      throw new Error("Invalid user documents");
    }

    const currentFollowings = currentUser.followings || [];
    const targetFollowers = targetUser.followers || [];
    const targetPendingRequests = targetUser.pendingFollowRequests || [];

    // Check if already following
    const isAlreadyFollowing = currentFollowings.includes(args.tId);
    const hasPendingRequest = targetPendingRequests.includes(currentUser._id);

    // In your followUser function, update the unfollow section:
    if (isAlreadyFollowing) {
      // Unfollow logic
      await ctx.db.patch(currentUser._id, {
        followings: currentFollowings.filter((id) => id !== args.tId),
        lastActive: Date.now(),
      });

      await ctx.db.patch(args.tId, {
        followers: targetFollowers.filter((id) => id !== currentUser._id),
        lastActive: Date.now(),
      });

      // 🗑️ CLEAN UP NOTIFICATIONS USING DOCUMENT IDs
      try {
        await cleanupFollowNotifications(ctx, args.tId, currentUser._id);
      } catch (cleanupError) {
        console.error("Failed to cleanup notifications:", cleanupError);
        // Don't throw - we don't want unfollow to fail if cleanup fails
      }

      return { success: true, action: "unfollowed" };
      // In the follow request cancellation section:
    } else if (hasPendingRequest) {
      // Cancel pending request
      await ctx.db.patch(args.tId, {
        pendingFollowRequests: targetPendingRequests.filter(
          (id) => id !== currentUser._id
        ),
        lastActive: Date.now(),
      });

      // 🗑️ CLEAN UP NOTIFICATIONS USING DOCUMENT IDs
      try {
        await cleanupFollowNotifications(ctx, args.tId, currentUser._id);
      } catch (cleanupError) {
        console.error("Failed to cleanup notifications:", cleanupError);
      }

      return { success: true, action: "request_cancelled" };
    } else {
      // Handle follow based on account privacy
      if (targetUser.isPrivate) {
        // PRIVATE ACCOUNT: Send follow request
        await ctx.db.patch(args.tId, {
          pendingFollowRequests: [...targetPendingRequests, currentUser._id],
          lastActive: Date.now(),
        });

        // ✅ CREATE FOLLOW REQUEST NOTIFICATION (using Document IDs)
        try {
          await createNotificationInternal(ctx, {
            userDocumentId: targetUser._id, // RECIPIENT: Private account owner (Document ID)
            type: "follow_request",
            title: "Follow Request",
            message: `${currentUser.firstname || currentUser.username} wants to follow you`,
            image: currentUser.picture,
            actionUrl: `/social/follow-requests?requester=${currentUser._id}&action=pending`,
            relatedUserDocumentId: currentUser._id, // REQUESTER (Document ID)
            isViewerInGracePeriod: args.isViewerInGracePeriod, // ADD THIS
            metadata: {
              requesterDocumentId: currentUser._id.toString(),
              requesterClerkId: currentUser.clerkId,
              requesterName: currentUser.firstname,
              requesterUsername: currentUser.username,
              requesterPicture: currentUser.picture,
              isRequesterPro: currentUser.tier === "pro",
              isRequesterMusician: currentUser.isMusician,
              isRequesterClient: currentUser.isClient,
              instrument: currentUser.instrument,
              city: currentUser.city,
              requestId: currentUser._id.toString(),
              isPrivateAccount: true,
            },
          });
        } catch (notificationError) {
          console.error(
            "Failed to create follow request notification:",
            notificationError
          );
        }

        return { success: true, action: "request_sent", isPrivate: true };
      } else {
        // PUBLIC ACCOUNT: Direct follow
        await ctx.db.patch(currentUser._id, {
          followings: [...currentFollowings, args.tId],
          lastActive: Date.now(),
        });

        await ctx.db.patch(args.tId, {
          followers: [...targetFollowers, currentUser._id],
          lastActive: Date.now(),
        });

        // ✅ CREATE FOLLOW NOTIFICATION (using Document IDs)
        try {
          await createNotificationInternal(ctx, {
            userDocumentId: targetUser._id, // RECIPIENT (Document ID)
            type: "new_follower",
            title: "New Follower",
            message: `${currentUser.firstname || currentUser.username} started following you`,
            image: currentUser.picture,
            actionUrl: `/social/followers?new=true`,
            relatedUserDocumentId: currentUser._id, // FOLLOWER (Document ID)
            isViewerInGracePeriod: args.isViewerInGracePeriod, // ADD THIS
            metadata: {
              followerDocumentId: currentUser._id.toString(),
              followerClerkId: currentUser.clerkId,
              followerName: currentUser.firstname,
              followerUsername: currentUser.username,
              followerPicture: currentUser.picture,
              isFollowerPro: currentUser.tier === "pro",
              isFollowerMusician: currentUser.isMusician,
              isFollowerClient: currentUser.isClient,
              instrument: currentUser.instrument,
              city: currentUser.city,
            },
          });
        } catch (notificationError) {
          console.error(
            "Failed to create follow notification:",
            notificationError
          );
        }

        return { success: true, action: "followed", isPrivate: false };
      }
    }
  },
});
export const acceptFollowRequest = mutation({
  args: {
    userId: v.string(),
    requesterId: v.id("users"),
    isViewerInGracePeriod: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!args.userId) throw new Error("Unauthorized");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .first();
    if (!currentUser) throw new Error("User not found");

    const requesterUser = await ctx.db.get(args.requesterId);
    if (!requesterUser) throw new Error("Requester not found");

    // ✅ TYPE CHECK: Ensure both are user documents
    if (!isUserDocument(currentUser) || !isUserDocument(requesterUser)) {
      throw new Error("Invalid user documents");
    }

    const currentFollowers = currentUser.followers || [];
    const currentPendingRequests = currentUser.pendingFollowRequests || [];
    const requesterFollowings = requesterUser.followings || [];

    // Remove from pending and add to followers
    await ctx.db.patch(currentUser._id, {
      followers: [...currentFollowers, args.requesterId],
      pendingFollowRequests: currentPendingRequests.filter(
        (id) => id !== args.requesterId
      ),
      lastActive: Date.now(),
    });

    await ctx.db.patch(args.requesterId, {
      followings: [...requesterFollowings, currentUser._id],
      lastActive: Date.now(),
    });

    // 🗑️ CLEAN UP THE FOLLOW REQUEST NOTIFICATION
    try {
      await deleteFollowRequestNotification(
        ctx,
        currentUser._id,
        args.requesterId
      );
    } catch (cleanupError) {
      console.error(
        "Failed to cleanup follow request notification:",
        cleanupError
      );
    }

    // ✅ NOTIFY THE REQUESTER THAT THEIR REQUEST WAS ACCEPTED
    try {
      await createNotificationInternal(ctx, {
        userDocumentId: requesterUser._id,
        type: "follow_accepted",
        title: "Follow Request Accepted",
        message: `${currentUser.firstname || currentUser.username} accepted your follow request`,
        image: currentUser.picture,
        actionUrl: `/social/followers?accepted=true&user=${currentUser._id}`,
        relatedUserDocumentId: currentUser._id,
        isViewerInGracePeriod: args.isViewerInGracePeriod,
        metadata: {
          acceptedByDocumentId: currentUser._id.toString(),
          acceptedByClerkId: currentUser.clerkId,
          acceptedByName: currentUser.firstname,
          acceptedByUsername: currentUser.username,
          acceptedByPicture: currentUser.picture,
          isPrivateAccount: true,
        },
      });
    } catch (notificationError) {
      console.error(
        "Failed to create follow accepted notification:",
        notificationError
      );
    }

    return { success: true };
  },
});

export const declineFollowRequest = mutation({
  args: {
    userId: v.string(),
    requesterId: v.id("users"),
    isViewerInGracePeriod: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!args.userId) throw new Error("Unauthorized");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .first();
    if (!currentUser) throw new Error("User not found");

    const requesterUser = await ctx.db.get(args.requesterId);
    if (!requesterUser) throw new Error("Requester not found");

    // ✅ TYPE CHECK: Ensure both are user documents
    if (!isUserDocument(currentUser) || !isUserDocument(requesterUser)) {
      throw new Error("Invalid user documents");
    }

    const currentPendingRequests = currentUser.pendingFollowRequests || [];

    // Remove from pending requests
    await ctx.db.patch(currentUser._id, {
      pendingFollowRequests: currentPendingRequests.filter(
        (id) => id !== args.requesterId
      ),
      lastActive: Date.now(),
    });

    // 🗑️ CLEAN UP THE FOLLOW REQUEST NOTIFICATION (SAME AS ACCEPT)
    try {
      await deleteFollowRequestNotification(
        ctx,
        currentUser._id,
        args.requesterId
      );
    } catch (cleanupError) {
      console.error(
        "Failed to cleanup follow request notification:",
        cleanupError
      );
    }

    // ✅ OPTIONAL: Notify requester that their request was declined
    try {
      await createNotificationInternal(ctx, {
        userDocumentId: requesterUser._id, // RECIPIENT: The person who requested (Document ID)
        type: "follow_request",
        title: "Follow Request Declined",
        message: `${currentUser.firstname || currentUser.username} declined your follow request`,
        image: currentUser.picture,
        actionUrl: `/search/${currentUser.username}`,
        relatedUserDocumentId: currentUser._id, // DECLINER (Document ID)
        isViewerInGracePeriod: args.isViewerInGracePeriod, // ADDED THIS
        metadata: {
          declinedByDocumentId: currentUser._id.toString(),
          declinedByClerkId: currentUser.clerkId,
          declinedByName: currentUser.firstname,
          declinedByUsername: currentUser.username,
          declinedByPicture: currentUser.picture,
          isPrivateAccount: true,
          action: "declined",
        },
      });
    } catch (notificationError) {
      console.error(
        "Failed to create follow declined notification:",
        notificationError
      );
    }

    return { success: true };
  },
});
// convex/users.ts
export const updateUserPrivacySettings = mutation({
  args: {
    userId: v.string(),
    updates: v.object({
      isPrivate: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const { userId, updates } = args;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, updates);

    return { success: true, updatedFields: Object.keys(updates) };
  },
});

export const likeGig = mutation({
  args: {
    gigId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const favoriteGigs = user.favoriteGigs || [];

    if (!favoriteGigs.includes(args.gigId)) {
      await ctx.db.patch(user._id, {
        favoriteGigs: [...favoriteGigs, args.gigId],
        lastActive: Date.now(),
      });
    }

    return { success: true };
  },
});

export const unlikeGig = mutation({
  args: {
    gigId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const favoriteGigs = user.favoriteGigs || [];

    await ctx.db.patch(user._id, {
      favoriteGigs: favoriteGigs.filter((id) => id !== args.gigId),
      lastActive: Date.now(),
    });

    return { success: true };
  },
});

export const deleteUserAccount = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = args;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .first();

    if (!args.userId) {
      throw new Error("Unauthorized");
    }

    if (args.userId !== user?.clerkId) {
      throw new Error("Unauthorized - User ID mismatch");
    }

    if (user) {
      await ctx.db.delete(user._id);
    }

    // Note: Any related data will be automatically handled by Convex
    // if you have proper relationships set up, or you can add additional
    // deletion logic here if needed

    return { success: true, message: "User account deleted from Convex" };
  },
});
// convex/users.ts
export const getProfileViews = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user?.profileViews;
  },
});

export const getPendingFollowRequests = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user?.pendingFollowRequests) return [];

    const requests = await Promise.all(
      user.pendingFollowRequests.map(async (requesterId) => {
        return await ctx.db.get(requesterId);
      })
    );

    return requests.filter(Boolean);
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const updateLastActive = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (user) {
      await ctx.db.patch(user._id, {
        lastActive: Date.now(),
      });
    }
  },
});

// convex/user.ts - Add this mutation
export const markOnboardingComplete = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await ctx.db.patch(userId, {
      onboardingComplete: true,
      firstLogin: false,
    });
    await updateUserTrust(ctx, userId);
  },
});
// Add this query to your convex/users.ts file
export const getUserProfile = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return null;

    return {
      ...user,
      // Expose only necessary fields
      _id: user._id,
      clerkId: user.clerkId,
      firstname: user.firstname,
      city: user.city,
      phone: user.phone,
      picture: user.picture,
      onboardingComplete: user.onboardingComplete,
      isMusician: user.isMusician,
      isClient: user.isClient,
      isBooker: user.isBooker,
      roleType: user.roleType,
      instrument: user.instrument,
      talentbio: user.talentbio,
      musiciangenres: user.musiciangenres,
      clientType: user.clientType,
      organization: user.organization,
      companyName: user.companyName,
      clientBio: user.talentbio,
      bookerType: user.bookerType,
      agencyName: user.agencyName,
      bookerBio: user.bookerBio,
      bookerSkills: user.bookerSkills,
      mpesaPhoneNumber: user.mpesaPhoneNumber,
      completedGigsCount: user.completedGigsCount,
      gigsPosted: user.gigsPosted,
      avgRating: user.avgRating,
      followers: user.followers,
      _creationTime: user._creationTime,
    };
  },
});
