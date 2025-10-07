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

export const createOrUpdateUserPublic = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    username: v.string(),
    picture: v.optional(v.string()),
    firstname: v.optional(v.string()),
    lastname: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("Creating user publicly:", args.clerkId);

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    const now = Date.now();
    const userData = createUserData(args, now);

    if (existingUser) {
      return await ctx.db.patch(existingUser._id, userData);
    } else {
      return await ctx.db.insert("users", {
        ...userData,
        // Array fields
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
        // Weekly stats
        gigsBookedThisWeek: { count: 0, weekStart: now },
      });
    }
  },
});

// Update the other mutation functions to use proper literal types
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
        v.union(
          v.literal("lightMode"),
          v.literal("darkMode"),
          v.literal("system")
        )
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
        v.union(
          v.literal("lightMode"),
          v.literal("darkMode"),
          v.literal("system")
        )
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

export const followUser = mutation({
  args: {
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser) throw new Error("User not found");

    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser) throw new Error("Target user not found");

    const currentFollowings = currentUser.followings || [];
    const targetFollowers = targetUser.followers || [];

    // Check if already following
    const isAlreadyFollowing = currentFollowings.includes(args.targetUserId);

    if (isAlreadyFollowing) {
      // Unfollow logic
      await ctx.db.patch(currentUser._id, {
        followings: currentFollowings.filter((id) => id !== args.targetUserId),
        lastActive: Date.now(),
      });

      await ctx.db.patch(args.targetUserId, {
        followers: targetFollowers.filter((id) => id !== currentUser._id),
        lastActive: Date.now(),
      });

      return { success: true, action: "unfollowed" };
    } else {
      // Follow logic
      await ctx.db.patch(currentUser._id, {
        followings: [...currentFollowings, args.targetUserId],
        lastActive: Date.now(),
      });

      await ctx.db.patch(args.targetUserId, {
        followers: [...targetFollowers, currentUser._id],
        lastActive: Date.now(),
      });

      return { success: true, action: "followed" };
    }
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

    return {
      ...user,
      // Safe defaults for all fields
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
