// convex/controllers/user.ts
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

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

// convex/controllers/user.ts
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
        likedVideos: [],
        bookingHistory: [],
        adminPermissions: [],
        allreviews: [],
        myreviews: [],
        videosProfile: [],
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
      });
    }
  },
});
// Add to convex/user.ts
export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    clerkId: v.string(), // Add this parameter
    updates: v.object({
      // ... your existing fields ...
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
      isMusician: v.optional(v.boolean()),
      isClient: v.optional(v.boolean()),
      rate: v.optional(
        v.object({
          regular: v.optional(v.string()),
          function: v.optional(v.string()),
          concert: v.optional(v.string()),
          corporate: v.optional(v.string()),
        })
      ),
      videosProfile: v.optional(
        v.array(
          v.object({
            _id: v.string(),
            url: v.string(),
            title: v.string(),
            createdAt: v.optional(v.number()),
            isPublic: v.optional(v.boolean()),
            description: v.optional(v.string()),
          })
        )
      ),
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

    return { success: true };
  },
});
// Helper function to create type-safe user data
const createUserData = (args: any, now: number) => {
  return {
    ...args,
    lastActive: now,
    // Boolean fields
    isMusician: false,
    isClient: false,
    isAdmin: false,
    isBanned: false,

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

    // String fields
    banReason: "",

    // Date fields
    bannedAt: 0,
  };
};
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

    // Ensure rate has all properties with safe defaults
    const safeRate = user.rate
      ? {
          regular: user.rate.regular || "",
          function: user.rate.function || "",
          concert: user.rate.concert || "",
          corporate: user.rate.corporate || "",
        }
      : {
          regular: "",
          function: "",
          concert: "",
          corporate: "",
        };

    return {
      ...user,
      rate: safeRate,
      // ... other safe defaults
      followers: user.followers || [],
      followings: user.followings || [],
      allreviews: user.allreviews || [],
      myreviews: user.myreviews || [],
      firstLogin: user.firstLogin ?? true,
      onboardingComplete: user.onboardingComplete ?? false,
      isMusician: user.isMusician ?? false,
      isClient: user.isClient ?? false,
      tier: user.tier ?? "free",
    };
  },
});

export const updateUserAsMusician = mutation({
  args: {
    clerkId: v.string(),
    updates: v.object({
      isMusician: v.boolean(),
      isClient: v.boolean(),
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
        lastActive: Date.now(),
      });

      return { success: true, userId: user._id };
    } catch (error) {
      console.error("Error updating user as client:", error);
      throw error;
    }
  },
});
export const updateUserAsAdmin = mutation({
  args: {
    clerkId: v.string(),
    updates: v.object({
      isAdmin: v.optional(v.boolean()),
      adminCity: v.optional(v.string()),
      adminRole: v.optional(
        v.union(
          v.literal("super"),
          v.literal("content"),
          v.literal("support"),
          v.literal("analytics")
        )
      ),
      tier: v.optional(v.union(v.literal("free"), v.literal("pro"))),
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
        lastActive: Date.now(),
      });

      return { success: true, userId: user._id };
    } catch (error) {
      console.error("Error updating user as admin:", error);
      throw error;
    }
  },
});
// Add this utility function for user search
export const searchUsers = query({
  args: {
    query: v.string(),
    isMusician: v.optional(v.boolean()),
    city: v.optional(v.string()),
    instrument: v.optional(v.string()),
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
          user.instrument?.toLowerCase().includes(searchTerm);

        const matchesMusician =
          args.isMusician === undefined || user.isMusician === args.isMusician;

        const matchesCity =
          !args.city ||
          user.city?.toLowerCase().includes(args.city.toLowerCase());

        const matchesInstrument =
          !args.instrument ||
          user.instrument
            ?.toLowerCase()
            .includes(args.instrument.toLowerCase());

        return (
          matchesSearch && matchesMusician && matchesCity && matchesInstrument
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
export const followUser = mutation({
  args: { userId: v.string(), tId: v.id("users") },
  handler: async (ctx, args) => {
    if (!args.userId) throw new Error("Unauthorized");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .first();
    if (!currentUser) throw new Error("User not found");

    const targetUser = await ctx.db.get(args.tId);
    if (!targetUser) throw new Error("Target user not found");

    const currentFollowings = currentUser.followings || [];
    const targetFollowers = targetUser.followers || [];

    // Check if already following
    const isAlreadyFollowing = currentFollowings.includes(args.tId);

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

      return { success: true, action: "unfollowed" };
    } else {
      // Follow logic
      await ctx.db.patch(currentUser._id, {
        followings: [...currentFollowings, args.tId],
        lastActive: Date.now(),
      });

      await ctx.db.patch(args.tId, {
        followers: [...targetFollowers, currentUser._id],
        lastActive: Date.now(),
      });

      return { success: true, action: "followed" };
    }
  },
});

export const likeVideo = mutation({
  args: {
    videoId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const likedVideos = user.likedVideos || [];

    if (!likedVideos.includes(args.videoId)) {
      await ctx.db.patch(user._id, {
        likedVideos: [...likedVideos, args.videoId],
        lastActive: Date.now(),
      });
    }

    return { success: true };
  },
});

export const unlikeVideo = mutation({
  args: {
    videoId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const likedVideos = user.likedVideos || [];

    await ctx.db.patch(user._id, {
      likedVideos: likedVideos.filter((id) => id !== args.videoId),
      lastActive: Date.now(),
    });

    return { success: true };
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

// Add this type definition somewhere in your file
type UserDocument = {
  viewedProfiles?: string[];
  profileViews?: {
    totalCount: number;
    recentViewers: Array<{ userId: string; timestamp: number }>;
    lastUpdated: number;
  };
  // Add other fields as needed
};

export const trackProfileView = mutation({
  args: {
    viewedUserId: v.string(), // This is Clerk ID of the profile being viewed
    viewerUserId: v.string(), // This is Clerk ID of the viewer
  },
  handler: async (ctx, args) => {
    const { viewedUserId, viewerUserId } = args;

    // Don't track self-views
    if (viewedUserId === viewerUserId) return;

    // Find users by clerkId instead of using the ID directly
    const [viewedUserDoc, viewerDoc] = await Promise.all([
      ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", viewedUserId))
        .first(),
      ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", viewerUserId))
        .first(),
    ]);

    if (!viewedUserDoc) return;

    const currentTime = Date.now();

    // Update viewed user's profile view count
    const currentViews = viewedUserDoc.profileViews || {
      totalCount: 0,
      recentViewers: [],
      lastUpdated: currentTime,
    };

    // Add viewer to recent viewers
    const newRecentViewers = [
      { userId: viewerUserId, timestamp: currentTime },
      ...currentViews.recentViewers.slice(0, 49),
    ];

    await ctx.db.patch(viewedUserDoc._id, {
      profileViews: {
        totalCount: currentViews.totalCount + 1,
        recentViewers: newRecentViewers,
        lastUpdated: currentTime,
      },
    });

    // Update viewer's viewedProfiles
    if (viewerDoc) {
      const viewedProfiles = (viewerDoc as any).viewedProfiles || [];
      const updatedViewedProfiles = [
        viewedUserId, // Store Clerk ID here
        ...viewedProfiles.filter((id: string) => id !== viewedUserId),
      ].slice(0, 100);

      await ctx.db.patch(viewerDoc._id, {
        viewedProfiles: updatedViewedProfiles,
      });
    }
    if (viewedUserDoc.tier === "pro" && viewerDoc) {
      await ctx.db.insert("notifications", {
        userId: viewedUserId, // Notify the profile owner
        type: "profile_view",
        title: "Profile Viewed",
        message: `${viewerDoc.firstname || "Someone"} viewed your profile`,
        image: viewerDoc.picture,
        actionUrl: `/profile/${viewerUserId}`,
        actionLabel: "View Profile",
        relatedUserId: viewerUserId,
        isRead: false,
        isArchived: false,
        createdAt: currentTime,
      });
    }

    return { success: true };
  },
});
// export const createOrUpdateUserPublic = mutation({
//   args: {
//     clerkId: v.string(),
//     email: v.string(),
//     username: v.string(),
//     picture: v.optional(v.string()),
//     firstname: v.optional(v.string()),
//     lastname: v.optional(v.string()),
//   },
//   handler: async (ctx, args) => {
//     console.log("Creating user publicly:", args.clerkId);

//     const existingUser = await ctx.db
//       .query("users")
//       .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
//       .first();

//     const now = Date.now();
//     const userData = createUserData(args, now);

//     if (existingUser) {
//       return await ctx.db.patch(existingUser._id, userData);
//     } else {
//       return await ctx.db.insert("users", {
//         ...userData,
//         // Array fields
//         followers: [],
//         followings: [],
//         refferences: [],
//         musicianhandles: [],
//         musiciangenres: [],
//         savedGigs: [],
//         favoriteGigs: [],
//         likedVideos: [],
//         bookingHistory: [],
//         adminPermissions: [],
//         allreviews: [],
//         myreviews: [],
//         videosProfile: [],
//         // Weekly stats
//         gigsBookedThisWeek: { count: 0, weekStart: now },
//       });
//     }
//   },
// });

// convex/migrations/migrateAllUsers.ts
