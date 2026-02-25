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
import { normalizeSecurityAnswer } from "../verifyUtil";

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
          }),
        ),
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
              v.literal("custom"),
            ),
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
              }),
            ),
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
        }),
      ),

      openToBandWork: v.optional(v.boolean()),
      interestedInBands: v.optional(v.boolean()),
      // Role-specific fields
      roleType: v.optional(v.string()),
      clientType: v.optional(
        v.union(
          v.literal("individual_client"),
          v.literal("event_planner_client"),
          v.literal("venue_client"),
          v.literal("corporate_client"),
        ),
      ), // ADDED: For client accounts
      bookerType: v.optional(
        v.union(v.literal("talent_agent"), v.literal("booking_manager")),
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
      Object.entries(args.updates).filter(([_, value]) => value !== undefined),
    );

    console.log("Clean updates:", cleanUpdates);

    // Store previous trust metrics BEFORE updates
    const previousTrustScore = user.trustScore || 0;
    const previousTrustStars = user.trustStars || 0;
    const previousTier = user.trustTier || "new";

    // Apply profile updates
    await ctx.db.patch(args.userId, {
      ...cleanUpdates,
      lastActive: Date.now(),

      updatedAt: Date.now(),
    });

    // Run your algorithm-based trust calculation
    // This will calculate new score AND log to history automatically
    const updatedTrust = await updateUserTrust(ctx, args.userId);

    // Get updated user to see final metrics
    const updatedUser = await ctx.db.get(args.userId);
    if (!updatedUser) throw new Error("User not found after update");

    // Calculate profile completion stats
    const profileFieldsBefore = {
      firstname: user.firstname,
      lastname: user.lastname,
      instrument: user.instrument,
      experience: user.experience,
      city: user.city,
      talentbio: user.talentbio,
      email: user.email,
      phone: user.phone,
      roleType: user.roleType,
    };

    const profileFieldsAfter = {
      firstname: cleanUpdates.firstname ?? user.firstname,
      lastname: cleanUpdates.lastname ?? user.lastname,
      instrument: cleanUpdates.instrument ?? user.instrument,
      experience: cleanUpdates.experience ?? user.experience,
      city: cleanUpdates.city ?? user.city,
      talentbio: cleanUpdates.talentbio ?? user.talentbio,
      email: cleanUpdates.email ?? user.email,
      phone: cleanUpdates.phone ?? user.phone,
      roleType: cleanUpdates.roleType ?? user.roleType,
    };

    const countCompletedFields = (fields: any) => {
      return Object.values(fields).filter(
        (value) => value && value.toString().trim().length > 0,
      ).length;
    };

    const completedBefore = countCompletedFields(profileFieldsBefore);
    const completedAfter = countCompletedFields(profileFieldsAfter);
    const fieldsChanged = completedAfter - completedBefore;

    return {
      success: true,
      profileUpdated: true,
      trustMetrics: {
        previousScore: previousTrustScore,
        newScore: updatedUser.trustScore || 0,
        change: (updatedUser.trustScore || 0) - previousTrustScore,
        previousStars: previousTrustStars,
        newStars: updatedUser.trustStars || 0,
        previousTier,
        newTier: updatedUser.trustTier || "new",
        isProfileComplete: updatedTrust.isProfileComplete,
      },
      profileCompletion: {
        completedFields: completedAfter,
        totalFields: Object.keys(profileFieldsAfter).length,
        percentage: Math.round(
          (completedAfter / Object.keys(profileFieldsAfter).length) * 100,
        ),
        fieldsChanged,
      },
      // Pass through the full trust result
      trustResult: updatedTrust,
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
        booker.city?.toLowerCase().includes(args.city!.toLowerCase()),
      );
    }

    // Filter by skills if provided
    if (args.skills && args.skills.length > 0) {
      bookers = bookers.filter((booker) =>
        booker.bookerSkills?.some((skill: string) =>
          args.skills!.includes(skill),
        ),
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
          v.literal("corporate"),
        ),
      ),
      bookerType: v.optional(
        v.union(v.literal("talent_agent"), v.literal("booking_manager")),
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
        }),
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
        v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
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
        Object.entries(args.updates).filter(
          ([_, value]) => value !== undefined,
        ),
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
          v.literal("corporate"),
        ),
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
        }),
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
        v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
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
        Object.entries(args.updates).filter(
          ([_, value]) => value !== undefined,
        ),
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
        v.union(v.literal("talent_agent"), v.literal("booking_manager")),
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
        }),
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
        v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
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
        Object.entries(args.updates).filter(
          ([_, value]) => value !== undefined,
        ),
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
            skill.toLowerCase().includes(searchTerm),
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
            args.bookerSkills!.includes(skill),
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
          (id) => id !== currentUser._id,
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
            notificationError,
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
            notificationError,
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
        (id) => id !== args.requesterId,
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
        args.requesterId,
      );
    } catch (cleanupError) {
      console.error(
        "Failed to cleanup follow request notification:",
        cleanupError,
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
        notificationError,
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
        (id) => id !== args.requesterId,
      ),
      lastActive: Date.now(),
    });

    // 🗑️ CLEAN UP THE FOLLOW REQUEST NOTIFICATION (SAME AS ACCEPT)
    try {
      await deleteFollowRequestNotification(
        ctx,
        currentUser._id,
        args.requesterId,
      );
    } catch (cleanupError) {
      console.error(
        "Failed to cleanup follow request notification:",
        cleanupError,
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
        notificationError,
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
    userId: v.string(), // Clerk user ID
    username: v.optional(v.string()), // Optional username verification
  },
  handler: async (ctx, args) => {
    const { userId, username } = args;

    // Validate input
    if (!userId) {
      throw new Error("Unauthorized - No user ID provided");
    }

    // Get the user from Convex using Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .first();

    if (!user) {
      throw new Error("User not found in database");
    }

    // Optional username verification for extra security
    if (username && user.username !== username) {
      throw new Error("Username verification failed");
    }

    // Check if user is trying to delete someone else's account
    if (userId !== user.clerkId) {
      throw new Error("Unauthorized - User ID mismatch");
    }

    // Additional safety check: prevent deletion of admin accounts
    if (user.isAdmin) {
      throw new Error("Admin accounts cannot be deleted through this method");
    }

    // Create a deletion record for audit purposes
    const deletionRecordId = await ctx.db.insert("accountDeletions", {
      userId: user._id,
      clerkId: user.clerkId,
      email: user.email || "",
      username: user.username || "",
      deletedAt: Date.now(),
      reason: "user_requested",
      dataSnapshot: {
        tier: user.tier,
        gigsPosted: user.gigsPosted || 0,
        gigsBooked: user.gigsBooked || 0,
        totalInterests: user.totalInterests || 0,
        trustScore: user.trustScore || 0,
        avgRating: user.avgRating || 0,
        createdAt: user._creationTime,
      },
    });

    // 1. Delete user's gigs (if they posted any)
    const userGigs = await ctx.db
      .query("gigs")
      .withIndex("by_postedBy", (q) => q.eq("postedBy", user._id))
      .collect();

    for (const gig of userGigs) {
      // Create deletion record for gig
      await ctx.db.insert("gigDeletions", {
        gigId: gig._id,
        deletedBy: user._id,
        deletedAt: Date.now(),
        reason: "user_account_deletion",
        title: gig.title || "Untitled Gig",
        createdAt: gig._creationTime,
      });

      // Delete the gig
      await ctx.db.delete(gig._id);
    }

    // 2. Remove user from any gigs they're interested in
    const allGigs = await ctx.db
      .query("gigs")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    for (const gig of allGigs) {
      // Remove from interestedUsers if present
      if (gig.interestedUsers?.includes(user._id)) {
        const updatedInterestedUsers = gig.interestedUsers.filter(
          (id) => id !== user._id,
        );

        await ctx.db.patch(gig._id, {
          interestedUsers: updatedInterestedUsers,
          updatedAt: Date.now(),
        });

        // Add to booking history
        const historyEntry = {
          entryId: `${gig._id}_${user._id}_${Date.now()}`,
          timestamp: Date.now(),
          userId: user._id,
          userRole: user.roleType || "musician",
          status: "cancelled" as const,
          gigType: "regular" as const,
          actionBy: user._id,
          reason: "User account deleted",
          metadata: {
            action: "account_deletion",
            deletedUser: user.username || user.email,
          },
        };

        await ctx.db.patch(gig._id, {
          bookingHistory: [...(gig.bookingHistory || []), historyEntry],
        });
      }

      // Handle band gigs - remove from applicants and bookedUsers
      if (gig.bandCategory) {
        const updatedBandCategory = gig.bandCategory.map((role: any) => ({
          ...role,
          applicants: role.applicants.filter(
            (id: Id<"users">) => id !== user._id,
          ),
          bookedUsers: role.bookedUsers.filter(
            (id: Id<"users">) => id !== user._id,
          ),
          filledSlots: Math.max(
            0,
            role.filledSlots - (role.bookedUsers.includes(user._id) ? 1 : 0),
          ),
        }));

        // Only update if changes were made
        if (
          JSON.stringify(updatedBandCategory) !==
          JSON.stringify(gig.bandCategory)
        ) {
          await ctx.db.patch(gig._id, {
            bandCategory: updatedBandCategory,
            updatedAt: Date.now(),
          });
        }
      }
    }

    // 3. Delete user's notifications
    const userNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .collect();

    for (const notification of userNotifications) {
      await ctx.db.delete(notification._id);
    }

    // 4. Delete notification settings
    const userNotificationSettings = await ctx.db
      .query("notificationSettings")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .collect();

    for (const setting of userNotificationSettings) {
      await ctx.db.delete(setting._id);
    }

    // 5. Delete user's videos
    const userVideos = await ctx.db
      .query("videos")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    for (const video of userVideos) {
      await ctx.db.delete(video._id);
    }

    // 6. Delete user's comments
    const userComments = await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    for (const comment of userComments) {
      await ctx.db.delete(comment._id);
    }

    // 7. Delete user's instant gigs
    const userInstantGigs = await ctx.db
      .query("instantgigs")
      .filter((q) => q.eq(q.field("clientId"), user._id))
      .collect();

    for (const instantGig of userInstantGigs) {
      await ctx.db.delete(instantGig._id);
    }

    // 8. Handle chats
    // Remove user from chats they're in
    const allChats = await ctx.db.query("chats").collect();
    const userChats = allChats.filter((chat) =>
      chat.participantIds.includes(user._id),
    );

    for (const chat of userChats) {
      // Remove user from participant list
      const updatedParticipants = chat.participantIds.filter(
        (id) => id !== user._id,
      );

      if (updatedParticipants.length > 0) {
        // Update chat with remaining participants
        await ctx.db.patch(chat._id, {
          participantIds: updatedParticipants,
        });

        // Also clean up unreadCounts if it exists
        if (chat.unreadCounts) {
          const updatedUnreadCounts = { ...chat.unreadCounts };
          delete updatedUnreadCounts[user._id];

          await ctx.db.patch(chat._id, {
            unreadCounts: updatedUnreadCounts,
          });
        }
      } else {
        // Delete chat if no participants left
        // First delete all messages in this chat
        const chatMessages = await ctx.db
          .query("messages")
          .withIndex("by_chatId", (q) => q.eq("chatId", chat._id))
          .collect();

        for (const message of chatMessages) {
          await ctx.db.delete(message._id);
        }

        // Delete the chat
        await ctx.db.delete(chat._id);
      }
    }

    // Delete messages sent by user
    const userMessages = await ctx.db
      .query("messages")
      .withIndex("by_senderId", (q) => q.eq("senderId", user._id))
      .collect();

    for (const message of userMessages) {
      await ctx.db.delete(message._id);
    }

    // 9. Delete chat presence records
    const userChatPresence = await ctx.db
      .query("chatPresence")
      .withIndex("by_userId_chatId", (q) => q.eq("userId", user._id))
      .collect();

    for (const presence of userChatPresence) {
      await ctx.db.delete(presence._id);
    }

    // 10. Delete user presence records
    const userPresence = await ctx.db
      .query("userPresence")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    for (const presence of userPresence) {
      await ctx.db.delete(presence._id);
    }

    // 11. Delete active chat sessions
    const userActiveSessions = await ctx.db
      .query("activeChatSessions")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .collect();

    for (const session of userActiveSessions) {
      await ctx.db.delete(session._id);
    }

    // 12. Delete typing indicators
    const userTypingIndicators = await ctx.db
      .query("typingIndicators")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    for (const indicator of userTypingIndicators) {
      await ctx.db.delete(indicator._id);
    }

    // 13. Handle connections
    const userConnections = await ctx.db
      .query("connections")
      .withIndex("by_user1", (q) => q.eq("user1Id", user._id))
      .collect();

    for (const connection of userConnections) {
      await ctx.db.delete(connection._id);
    }

    // Also connections where user is user2
    const userConnections2 = await ctx.db
      .query("connections")
      .withIndex("by_user2", (q) => q.eq("user2Id", user._id))
      .collect();

    for (const connection of userConnections2) {
      await ctx.db.delete(connection._id);
    }

    // 14. Delete push subscriptions
    const userPushSubscriptions = await ctx.db
      .query("pushSubscriptions")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    for (const subscription of userPushSubscriptions) {
      await ctx.db.delete(subscription._id);
    }

    // 15. Handle band relationships
    if (user.bandLeaderOf && user.bandLeaderOf.length > 0) {
      for (const bandId of user.bandLeaderOf) {
        const band = await ctx.db.get(bandId);
        if (band) {
          // Archive band if leader is deleting account
          await ctx.db.patch(bandId, {
            status: "archived",
          });
        }
      }
    }

    // if (user.bandMemberOf && user.bandMemberOf.length > 0) {
    //   for (const bandId of user.bandMemberOf) {
    //     const bandMembers = await ctx.db
    //       .query("bands")
    //       .withIndex("by_band_user", (q) =>
    //         q.eq("bandId", bandId).eq("userId", user._id)
    //       )
    //       .collect();

    //     for (const member of bandMembers) {
    //       await ctx.db.delete(member._id);
    //     }
    //   }
    // }

    // 16. Delete band gig applications
    const userBandApplications = await ctx.db
      .query("bandGigApplications")
      .collect();

    for (const application of userBandApplications) {
      // You might need to check if this application is for a band the user leads
      // This would require additional logic based on your data structure
    }

    // 17. Update other users' followers/followings lists
    // Remove user from other users' followers list
    const allUsers = await ctx.db.query("users").collect();

    for (const otherUser of allUsers) {
      if (otherUser._id === user._id) continue;

      const updates: any = {};
      const userIdString = user._id.toString();

      // Remove from followers
      if (otherUser.followers?.includes(userIdString)) {
        updates.followers = otherUser.followers.filter(
          (id) => id !== userIdString,
        );
      }

      // Remove from followings
      if (otherUser.followings?.includes(userIdString)) {
        updates.followings = otherUser.followings.filter(
          (id) => id !== userIdString,
        );
      }

      // Remove from references (note the typo in your schema: "refferences" not "references")
      if (otherUser.refferences?.includes(userIdString)) {
        updates.refferences = otherUser.refferences.filter(
          (id) => id !== userIdString,
        );
      }

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(otherUser._id, updates);
      }
    }

    // 18. Handle reports involving this user
    // 18. Handle reports involving this user
    const userReports = await ctx.db
      .query("reports")
      .filter((q) =>
        q.or(
          q.eq(q.field("reportedUserId"), user.clerkId), // Use clerkId, not user._id.toString()
          q.eq(q.field("reporterId"), user.clerkId), // Use clerkId, not user._id.toString()
        ),
      )
      .collect();

    for (const report of userReports) {
      // Mark reports as resolved due to account deletion
      await ctx.db.patch(report._id, {
        status: "resolved",
        resolvedBy: "system", // Or "account_deletion"
        resolutionNote: "Account deleted",
        resolvedAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // 19. Delete testimonials by this user
    const userTestimonials = await ctx.db
      .query("testimonials")
      .filter((q) => q.eq(q.field("userId"), user.clerkId))
      .collect();

    for (const testimonial of userTestimonials) {
      await ctx.db.delete(testimonial._id);
    }

    // 20. Finally, delete the user account
    await ctx.db.delete(user._id);

    // 21. Send notification to admins
    const admins = await ctx.db
      .query("users")
      .withIndex("by_is_admin", (q) => q.eq("isAdmin", true))
      .collect();

    for (const admin of admins) {
      await createNotificationInternal(ctx, {
        userDocumentId: admin._id,
        type: "admin_alert",
        title: "⚠️ User Account Deleted",
        message: `User ${user.username || user.email} deleted their account`,
        actionUrl: `/admin/users/deleted`,
        metadata: {
          deletedUserId: user._id,
          deletedUsername: user.username,
          deletionRecordId,
          gigsDeleted: userGigs.length,
          videosDeleted: userVideos.length,
          chatsAffected: userChats.length,
          timestamp: Date.now(),
        },
      });
    }

    return {
      success: true,
      message: "User account and all associated data deleted successfully",
      data: {
        userDeleted: true,
        gigsDeleted: userGigs.length,
        notificationsDeleted: userNotifications.length,
        videosDeleted: userVideos.length,
        commentsDeleted: userComments.length,
        instantGigsDeleted: userInstantGigs.length,
        chatsAffected: userChats.length,
        messagesDeleted: userMessages.length,
        connectionsDeleted: userConnections.length + userConnections2.length,
        deletionRecordId,
      },
    };
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
      }),
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
// In convex/controllers/user.ts
export const getUsersByIds = query({
  args: { userIds: v.array(v.id("users")) },
  handler: async (ctx, args) => {
    if (args.userIds.length === 0) return [];

    const users = await Promise.all(
      args.userIds.map((userId) => ctx.db.get(userId)),
    );

    return users.filter(Boolean);
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
// convex/controllers/users.ts
export const checkSecurityQuestion = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return !!user?.securityQuestion;
  },
});

export const updateSecurityQuestion = mutation({
  args: {
    securityQuestion: v.string(),
    securityAnswer: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user by clerkId
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Validate input
    if (!args.securityQuestion.trim()) {
      throw new Error("Security question is required");
    }

    if (!args.securityAnswer.trim()) {
      throw new Error("Security answer is required");
    }

    // Use normalizeSecurityAnswer (or hashSecurityAnswer if using crypto)
    const normalizedAnswer = normalizeSecurityAnswer(args.securityAnswer);

    await ctx.db.patch(user._id, {
      securityQuestion: args.securityQuestion.trim(),
      securityAnswer: normalizedAnswer,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Security question set successfully",
    };
  },
});

// Optional: Check if user has security question
export const hasSecurityQuestion = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    return !!(user?.securityQuestion && user?.securityAnswer);
  },
});
// convex/controllers/user.ts
// Add this query to get simple user metrics for the PosterInfoCard

export const getUserSimpleMetrics = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    // Get ALL gigs
    const allGigs = await ctx.db.query("gigs").collect();

    // For MUSICIAN: gigs where they were booked
    const musicianBookedGigs = allGigs.filter(
      (gig) =>
        gig.bookedBy === args.userId ||
        gig.bandCategory?.some((role) =>
          role.bookedUsers.includes(args.userId),
        ) ||
        gig.bookCount?.some(
          (booking) =>
            booking.appliedBy === args.userId ||
            booking.performingMembers?.some((m) => m.userId === args.userId),
        ),
    );

    // For CLIENT: gigs they posted
    const clientPostedGigs = allGigs.filter(
      (gig) => gig.postedBy === args.userId,
    );

    // Determine which set to use based on role
    const relevantGigs = user.isClient ? clientPostedGigs : musicianBookedGigs;

    // Count based on who cancelled
    let completedByMe = 0;
    let cancelledByMe = 0;
    let cancelledByOther = 0;
    let pendingGigs = 0;

    relevantGigs.forEach((gig) => {
      // Check if gig was completed (paid)
      const isCompleted =
        gig.paymentStatus === "paid" || gig.paymentStatus === "verified_paid";

      if (isCompleted) {
        completedByMe++;
        return;
      }

      // Check if gig was cancelled
      if (gig.cancelledAt) {
        // Determine who cancelled
        if (gig.cancelledBy === args.userId) {
          // I cancelled
          cancelledByMe++;
        } else if (
          gig.cancelledBy === (user.isClient ? "musician" : "client") ||
          gig.cancelledBy === "both" ||
          gig.cancelledBy
        ) {
          // Other party cancelled
          cancelledByOther++;
        } else {
          // Unknown cancellation - count as pending
          pendingGigs++;
        }
      } else {
        // Not completed, not cancelled = pending/upcoming
        pendingGigs++;
      }
    });

    const total = relevantGigs.length;

    // Calculate meaningful rates
    const completionRate =
      total > 0 ? Math.round((completedByMe / total) * 100) : 0;

    const myCancellationRate =
      total > 0 ? Math.round((cancelledByMe / total) * 100) : 0;

    const otherCancellationRate =
      total > 0 ? Math.round((cancelledByOther / total) * 100) : 0;

    // Simple reliability score (your fault vs their fault)
    const reliabilityScore =
      total > 0
        ? Math.round(((completedByMe + cancelledByOther) / total) * 100)
        : 0;

    // Get response metrics using your existing helper
    const responseData = await calculateResponseMetrics(ctx, user);

    // Get reliability tier using your existing helper
    const tier = getReliabilityTier(completionRate, myCancellationRate, total);

    return {
      // Basic counts
      totalGigs: total,
      completedByMe,
      cancelledByMe,
      cancelledByOther,
      pendingGigs,

      // Rates
      completionRate,
      myCancellationRate,
      otherCancellationRate,
      reliabilityScore,

      // Response
      avgResponseHours: responseData.avgResponseHours,
      totalResponses: responseData.totalResponses,

      // Tier
      reliabilityTier: tier,

      // Human-readable summary
      summary: user.isClient
        ? `${completionRate}% of gigs completed • ${myCancellationRate}% cancelled by you`
        : `${completionRate}% reliable • ${myCancellationRate}% cancelled by you`,

      // Display-ready format for PosterInfoCard
      display: {
        reliability: {
          value: reliabilityScore,
          label: "Reliability",
          icon: "🛡️",
          color: getRateColor(reliabilityScore, "high"),
        },
        completion: {
          value: completionRate,
          label: "Completed",
          icon: "✅",
          color: getRateColor(completionRate, "high"),
        },
        myCancellations: {
          value: myCancellationRate,
          label: "My Cancellations",
          icon: "❌",
          color: getRateColor(myCancellationRate, "low"),
        },
        otherCancellations: {
          value: otherCancellationRate,
          label: "Other's Cancellations",
          icon: "🤷",
          color: "text-slate-400",
        },
        response: {
          hours: responseData.avgResponseHours,
          label: responseData.avgResponseHours
            ? `${responseData.avgResponseHours}h avg response`
            : "No response data",
          icon: user.isClient ? "📅" : "⚡",
        },
        badge: {
          tier,
          label:
            tier === "elite"
              ? "Elite"
              : tier === "trusted"
                ? "Trusted"
                : tier === "verified"
                  ? "Verified"
                  : tier === "basic"
                    ? "Basic"
                    : tier === "new"
                      ? "New"
                      : "Needs Work",
          emoji:
            tier === "elite"
              ? "👑"
              : tier === "trusted"
                ? "⭐"
                : tier === "verified"
                  ? "✅"
                  : tier === "basic"
                    ? "👍"
                    : tier === "new"
                      ? "🌱"
                      : "⚠️",
          color:
            tier === "elite"
              ? "from-amber-500 to-yellow-500"
              : tier === "trusted"
                ? "from-sky-500 to-blue-500"
                : tier === "verified"
                  ? "from-emerald-500 to-teal-500"
                  : tier === "basic"
                    ? "from-slate-400 to-slate-500"
                    : tier === "new"
                      ? "from-purple-500 to-pink-500"
                      : "from-rose-500 to-red-500",
        },
      },
    };
  },
});

// Also add this helper if not already present (find first applicant)
function findFirstApplicant(gig: Doc<"gigs">) {
  // Check booking history for applicants
  const applicants =
    gig.bookingHistory
      ?.filter((e) => e.status === "applied")
      .sort((a, b) => a.timestamp - b.timestamp) || [];

  if (applicants.length > 0) {
    return applicants[0];
  }

  // Check bookCount as fallback
  if (gig.bookCount && gig.bookCount.length > 0) {
    const sorted = [...gig.bookCount].sort((a, b) => a.appliedAt - b.appliedAt);
    return {
      timestamp: sorted[0].appliedAt,
      userId: sorted[0].appliedBy,
    };
  }

  return null;
}

// Add this helper if not already present
function findInterestTime(
  gig: Doc<"gigs">,
  userId: Id<"users">,
): number | null {
  // Try to find in booking history first
  const entry = gig.bookingHistory
    ?.filter((e) => e.userId === userId)
    .sort((a, b) => a.timestamp - b.timestamp)[0];

  if (entry) {
    return entry.timestamp;
  }

  // Fallback to rough estimate based on array position
  if (gig.interestedUsers) {
    const index = gig.interestedUsers.indexOf(userId);
    if (index !== -1) {
      return gig._creationTime + (index + 1) * 60 * 60 * 1000;
    }
  }

  return null;
}
const musicianResponseRate = (gig: Doc<"gigs">, userId: Id<"users">) => {
  // CASE 1: Direct booking (no shortlist)
  if (gig.bookedBy === userId) {
    return {
      type: "direct_booking",
      timeToBook: gig?.bookedAt && gig?.bookedAt - gig._creationTime, // Total time
      quality: "excellent", // They got booked immediately!
    };
  }

  // CASE 2: Band role booking
  const bookedRole = gig.bandCategory?.find((role) =>
    role.bookedUsers.includes(userId),
  );
  if (bookedRole) {
    return {
      type: "band_booking",
      timeToBook: gig?.bookedAt && gig?.bookedAt - gig._creationTime,
      quality: "good",
    };
  }

  // CASE 3: Showed interest but not booked
  if (gig.interestedUsers?.includes(userId)) {
    return {
      type: "interested_only",
      timeToInterest: findInterestTime(gig, userId),
      quality: "pending",
    };
  }

  return null;
};
// For clients: How quickly do they fill their gig?
const clientResponseRate = (gig: Doc<"gigs">) => {
  // Find first applicant
  const firstApplicant = findFirstApplicant(gig);

  if (firstApplicant && gig.bookedAt) {
    const timeToFirstApp = firstApplicant.timestamp - gig._creationTime;
    const timeToBook = gig.bookedAt - gig._creationTime;
    const timeToDecide = gig.bookedAt - firstApplicant.timestamp;

    return {
      timeToFirstApp, // How fast applicants came in
      timeToDecide, // How fast they chose someone
      timeToBook, // Total time to fill the gig
      quality: timeToDecide < 24 * 60 * 60 * 1000 ? "fast" : "normal",
    };
  }

  return null;
};
// Helper to get color based on rate and desired direction
function getRateColor(rate: number, direction: "high" | "low"): string {
  if (direction === "high") {
    // For metrics where high is good (completion)
    if (rate >= 90) return "text-emerald-500";
    if (rate >= 75) return "text-emerald-400";
    if (rate >= 50) return "text-amber-500";
    if (rate >= 25) return "text-orange-500";
    return "text-rose-500";
  } else {
    // For metrics where low is good (cancellation)
    if (rate <= 5) return "text-emerald-500";
    if (rate <= 10) return "text-emerald-400";
    if (rate <= 20) return "text-amber-500";
    if (rate <= 30) return "text-orange-500";
    return "text-rose-500";
  }
}

// Determine reliability tier
function getReliabilityTier(
  completion: number,
  cancellation: number,
  total: number,
): string {
  if (total < 3) return "new"; // Not enough data

  if (completion >= 90 && cancellation <= 5) return "elite";
  if (completion >= 80 && cancellation <= 10) return "trusted";
  if (completion >= 70 && cancellation <= 15) return "verified";
  if (completion >= 50) return "basic";

  return "needs-improvement";
}

// Calculate response metrics based on role
async function calculateResponseMetrics(ctx: any, user: Doc<"users">) {
  const allGigs = await ctx.db.query("gigs").collect();

  let totalResponseTime = 0;
  let responseCount = 0;

  if (user.isClient) {
    // CLIENT: Time to respond to applicants
    allGigs.forEach((gig: any) => {
      if (gig.postedBy === user._id && gig.bookingHistory) {
        const applicantResponses = new Map();

        gig.bookingHistory.forEach((entry: any) => {
          if (
            entry.actionBy === user._id &&
            (entry.status === "shortlisted" || entry.status === "rejected")
          ) {
            const applicantId = entry.userId;

            const applicationEntry = gig.bookingHistory?.find(
              (e: any) => e.userId === applicantId && e.status === "applied",
            );

            if (applicationEntry) {
              const responseTime = entry.timestamp - applicationEntry.timestamp;
              totalResponseTime += responseTime;
              responseCount++;
            }
          }
        });
      }
    });
  } else {
    // MUSICIAN: Time to respond to gig opportunities
    allGigs.forEach((gig: any) => {
      if (gig.bookingHistory) {
        const userEntries = gig.bookingHistory
          .filter((entry: any) => entry.userId === user._id)
          .sort((a: any, b: any) => a.timestamp - b.timestamp);

        if (userEntries.length > 0) {
          const firstInteraction = userEntries[0];
          const responseTime = firstInteraction.timestamp - gig._creationTime;
          totalResponseTime += responseTime;
          responseCount++;
        }
      }
    });
  }

  const avgResponseHours =
    responseCount > 0
      ? Math.round(totalResponseTime / responseCount / (1000 * 60 * 60))
      : null;

  return {
    avgResponseHours,
    totalResponses: responseCount,
  };
}
// convex/controllers/user.ts
// Add this query to get all online users

export const getOnlineUsers = query({
  args: {
    thresholdMinutes: v.optional(v.number()),
    limit: v.optional(v.number()),
    roleType: v.optional(v.string()), // Optional filter by role (musician, client, etc.)
  },
  handler: async (ctx, args) => {
    const threshold = args.thresholdMinutes || 5; // Default 5 minutes
    const limit = args.limit || 50;

    const now = Date.now();
    const cutoffTime = now - threshold * 60 * 1000; // Convert minutes to milliseconds

    // Build query
    let query = ctx.db
      .query("users")
      .withIndex("by_last_active", (q) => q.gt("lastActive", cutoffTime));

    // Optional: filter by role
    if (args.roleType) {
      if (args.roleType === "musician") {
        query = query.filter((q) => q.eq(q.field("isMusician"), true));
      } else if (args.roleType === "client") {
        query = query.filter((q) => q.eq(q.field("isClient"), true));
      }
    }

    // Get online users
    const onlineUsers = await query.take(limit);

    // Return only the fields needed for display
    return onlineUsers.map((user) => ({
      _id: user._id,
      firstname: user.firstname || "",
      username: user.username || "",
      picture: user.picture || "",
      lastActive: user.lastActive,
      isMusician: user.isMusician || false,
      isClient: user.isClient || false,
      roleType: user.roleType || "",
      instrument: user.instrument || "",
      trustStars: user.trustStars || 0,
    }));
  },
});

// Also add this query to get online count only (lighter weight)
export const getOnlineUsersCount = query({
  args: {
    thresholdMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const threshold = args.thresholdMinutes || 5;
    const cutoffTime = Date.now() - threshold * 60 * 1000;

    const onlineUsers = await ctx.db
      .query("users")
      .withIndex("by_last_active", (q) => q.gt("lastActive", cutoffTime))
      .collect();

    return onlineUsers.length;
  },
});

// And a query to get online users by role breakdown
export const getOnlineUsersStats = query({
  args: {
    thresholdMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const threshold = args.thresholdMinutes || 5;
    const cutoffTime = Date.now() - threshold * 60 * 1000;

    const onlineUsers = await ctx.db
      .query("users")
      .withIndex("by_last_active", (q) => q.gt("lastActive", cutoffTime))
      .collect();

    const musicians = onlineUsers.filter((u) => u.isMusician).length;
    const clients = onlineUsers.filter((u) => u.isClient).length;
    const bookers = onlineUsers.filter((u) => u.isBooker).length;

    return {
      total: onlineUsers.length,
      musicians,
      clients,
      bookers,
      other: onlineUsers.length - (musicians + clients + bookers),
    };
  },
});
