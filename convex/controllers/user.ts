// convex/controllers/user.ts
import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

export const updateFirstLogin = mutationGeneric({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Updating firstLogin for user:", args.clerkId);

      // Find the user by clerkId
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
        .first();

      if (!user) {
        console.log("User not found for clerkId:", args.clerkId);
        throw new Error("User not found");
      }

      // Update firstLogin to false
      await ctx.db.patch(user._id, {
        firstLogin: false,
      });

      console.log(
        "Successfully updated firstLogin to false for user:",
        args.clerkId
      );

      return { success: true };
    } catch (error) {
      console.error("Error updating firstLogin:", error);
      throw error;
    }
  },
});
export const createOrUpdateUserPublic = mutationGeneric({
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
    const userData = {
      ...args,
      lastActive: now,
      updatedAt: now,
    };

    if (existingUser) {
      // Update only the fields that exist in the schema
      return await ctx.db.patch(existingUser._id, {
        ...userData,
        // Only include fields that exist in schema
        phone: existingUser.phone,
        city: existingUser.city,
        address: existingUser.address,
        instrument: existingUser.instrument,
        experience: existingUser.experience,
        roleType: existingUser.roleType,
        bio: existingUser.bio,
      });
    } else {
      // Create new user with schema-compliant defaults
      return await ctx.db.insert("users", {
        ...userData,
        // Required fields with defaults
        isMusician: false,
        isClient: false,
        isAdmin: false,
        isBanned: false,

        // Arrays
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

        // Business
        tier: "free",
        earnings: 0,
        totalSpent: 0,

        // Monthly stats
        monthlyGigsPosted: 0,
        monthlyMessages: 0,
        monthlyGigsBooked: 0,

        // Counters
        completedGigsCount: 0,
        reportsCount: 0,
        cancelgigCount: 0,
        renewalAttempts: 0,

        // Weekly stats
        gigsBookedThisWeek: { count: 0, weekStart: now },

        // Preferences
        theme: "system",
        firstLogin: true,
        onboardingComplete: false,
        firstTimeInProfile: true,

        // Timestamps
        createdAt: now,
      });
    }
  },
});
interface UpdateProfileArgs {
  userId: any; // Use v.id("users") type
  updates: {
    firstname?: string;
    lastname?: string;
    city?: string;
    address?: string;
    phone?: string;
    instrument?: string;
    experience?: string;
    bio?: string;
    roleType?: string;
    isMusician?: boolean;
    isClient?: boolean;
    musiciangenres?: string[];
    rate?: {
      regular?: string;
      function?: string;
      concert?: string;
      corporate?: string;
    };
  };
}

// Update user with musician info
export const updateUserAsMusician = mutationGeneric({
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
      tier: v.string(),
      nextBillingDate: v.number(),
      monthlyGigsPosted: v.number(),
      monthlyMessages: v.number(),
      monthlyGigsBooked: v.number(),
      gigsBookedThisWeek: v.object({
        count: v.number(),
        weekStart: v.number(),
      }),
      lastBookingDate: v.number(),
      earnings: v.number(),
      totalSpent: v.number(),
      firstLogin: v.boolean(),
      organization: v.optional(v.string()),
      onboardingComplete: v.boolean(),
      lastActive: v.number(),
      isBanned: v.boolean(),
      banReason: v.optional(v.string()),
      bannedAt: v.optional(v.number()),
      lastAdminAction: v.number(),
      theme: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Updating user as musician:", args.clerkId);

      // Find user by clerkId
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
        .first();

      if (!user) {
        throw new Error("User not found");
      }

      // Update user with musician data
      await ctx.db.patch(user._id, args.updates);

      console.log("Successfully updated user as musician");
      return { success: true, userId: user._id };
    } catch (error) {
      console.error("Error updating user as musician:", error);
      throw error;
    }
  },
});

// Update user as client
export const updateUserAsClient = mutationGeneric({
  args: {
    clerkId: v.string(),
    updates: v.object({
      isMusician: v.boolean(),
      isClient: v.boolean(),
      city: v.string(),
      organization: v.string(),
      talentbio: v.string(),
      tier: v.string(),
      nextBillingDate: v.number(),
      monthlyGigsPosted: v.number(),
      monthlyMessages: v.number(),
      monthlyGigsBooked: v.number(),
      gigsBookedThisWeek: v.object({
        count: v.number(),
        weekStart: v.number(),
      }),
      lastBookingDate: v.number(),
      earnings: v.number(),
      totalSpent: v.number(),
      firstLogin: v.boolean(),
      onboardingComplete: v.boolean(),
      lastActive: v.number(),
      isBanned: v.boolean(),
      banReason: v.optional(v.string()),
      bannedAt: v.optional(v.number()),
      lastAdminAction: v.number(),
      theme: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Updating user as client:", args.clerkId);

      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
        .first();

      if (!user) {
        throw new Error("User not found");
      }

      await ctx.db.patch(user._id, args.updates);

      console.log("Successfully updated user as client");
      return { success: true, userId: user._id };
    } catch (error) {
      console.error("Error updating user as client:", error);
      throw error;
    }
  },
});

// Update user as admin
export const updateUserAsAdmin = mutationGeneric({
  args: {
    clerkId: v.string(),
    updates: v.object({
      isAdmin: v.boolean(),
      adminCity: v.string(),
      adminRole: v.string(),
      tier: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Updating user as admin:", args.clerkId);

      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
        .first();

      if (!user) {
        throw new Error("User not found");
      }

      await ctx.db.patch(user._id, args.updates);

      console.log("Successfully updated user as admin");
      return { success: true, userId: user._id };
    } catch (error) {
      console.error("Error updating user as admin:", error);
      throw error;
    }
  },
});

export const updateUserProfile = mutationGeneric({
  args: {
    userId: v.id("users"),
    updates: v.object({
      firstname: v.optional(v.string()),
      lastname: v.optional(v.string()),
      city: v.optional(v.string()),
      address: v.optional(v.string()),
      phone: v.optional(v.string()),
      instrument: v.optional(v.string()),
      experience: v.optional(v.string()),
      bio: v.optional(v.string()),
      roleType: v.optional(v.string()),
      isMusician: v.optional(v.boolean()),
      isClient: v.optional(v.boolean()),
      musiciangenres: v.optional(v.array(v.string())),
      rate: v.optional(
        v.object({
          regular: v.optional(v.string()),
          function: v.optional(v.string()),
          concert: v.optional(v.string()),
          corporate: v.optional(v.string()),
        })
      ),
    }),
  },
  handler: async (ctx, args: UpdateProfileArgs) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (user.clerkId !== identity.subject) throw new Error("Not authorized");

    return await ctx.db.patch(args.userId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  },
});

export const followUser = mutationGeneric({
  args: {
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args: { targetUserId: any }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser) throw new Error("User not found");

    // Add to current user's followings
    if (!currentUser.followings.includes(args.targetUserId)) {
      await ctx.db.patch(currentUser._id, {
        followings: [...currentUser.followings, args.targetUserId],
        updatedAt: Date.now(),
      });
    }

    // Add to target user's followers
    const targetUser = await ctx.db.get(args.targetUserId);
    if (targetUser && !targetUser.followers.includes(currentUser._id)) {
      await ctx.db.patch(args.targetUserId, {
        followers: [...targetUser.followers, currentUser._id],
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const addReview = mutationGeneric({
  args: {
    targetUserId: v.id("users"),
    rating: v.number(),
    comment: v.optional(v.string()),
    gigId: v.optional(v.id("gigs")),
  },
  handler: async (
    ctx,
    args: { targetUserId: any; rating: number; comment?: string; gigId?: any }
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .first();
    if (!currentUser) throw new Error("User not found");

    const reviewId = crypto.randomUUID();
    const review = {
      _id: reviewId,
      postedBy: currentUser._id,
      postedTo: args.targetUserId,
      rating: args.rating,
      comment: args.comment,
      gigId: args.gigId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Add to target user's allreviews
    const targetUser = await ctx.db.get(args.targetUserId);
    if (targetUser) {
      await ctx.db.patch(args.targetUserId, {
        allreviews: [...targetUser.allreviews, review],
        updatedAt: Date.now(),
      });
    }

    // Add to current user's myreviews
    await ctx.db.patch(currentUser._id, {
      myreviews: [...currentUser.myreviews, review],
      updatedAt: Date.now(),
    });

    return reviewId;
  },
});

export const getCurrentUser = queryGeneric({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Getting user by Clerk ID:", args.clerkId);
    try {
      console.log("Getting user by Clerk ID:", args.clerkId);

      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
        .first();

      console.log("Found user:", user);

      return user;
    } catch (error) {
      console.error("Error in getCurrentUser:", error);
      return null;
    }
  },
});

interface SearchUsersArgs {
  query: string;
  isMusician?: boolean;
  city?: string;
  instrument?: string;
}
export const searchUsers = queryGeneric({
  args: {
    query: v.string(),
    isMusician: v.optional(v.boolean()),
    city: v.optional(v.string()),
    instrument: v.optional(v.string()),
  },
  handler: async (ctx, args: SearchUsersArgs) => {
    // Get all users (or use an index if you have many users)
    const allUsers = await ctx.db.query("users").collect();

    // Apply all filters
    return allUsers.filter((user) => {
      // Text search
      const searchTerm = args.query.toLowerCase();
      const matchesSearch =
        user.firstname?.toLowerCase().includes(searchTerm) ||
        user.lastname?.toLowerCase().includes(searchTerm) ||
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.city?.toLowerCase().includes(searchTerm) ||
        user.instrument?.toLowerCase().includes(searchTerm);

      // Boolean filters
      const matchesMusician =
        args.isMusician === undefined || user.isMusician === args.isMusician;
      const matchesCity = !args.city || user.city === args.city;
      const matchesInstrument =
        !args.instrument || user.instrument === args.instrument;

      return (
        matchesSearch && matchesMusician && matchesCity && matchesInstrument
      );
    });
  },
});

export const updateUserTier = mutationGeneric({
  args: {
    userId: v.id("users"),
    tier: v.union(v.literal("free"), v.literal("pro")),
    tierStatus: v.union(
      v.literal("active"),
      v.literal("pending"),
      v.literal("canceled"),
      v.literal("expired")
    ),
    nextBillingDate: v.optional(v.number()),
  },
  handler: async (
    ctx,
    args: {
      userId: any;
      tier: string;
      tierStatus: string;
      nextBillingDate?: number;
    }
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Check if user is admin or the user themselves
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser) throw new Error("User not found");
    if (!currentUser.isAdmin && currentUser._id !== args.userId) {
      throw new Error("Not authorized");
    }

    return await ctx.db.patch(args.userId, {
      tier: args.tier,
      tierStatus: args.tierStatus,
      nextBillingDate: args.nextBillingDate,
      updatedAt: Date.now(),
    });
  },
});
